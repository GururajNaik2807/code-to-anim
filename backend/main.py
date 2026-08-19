import ast
import contextlib
import io
import sys
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- Constants & Security Limits ---
MAX_CODE_LINES = 100
MAX_CODE_CHARS = 5000
MAX_STEPS = 500
EXECUTION_TIMEOUT_SECONDS = 3.0

ALLOWED_BUILTINS = {
    "abs": abs, "all": all, "any": any, "bool": bool,
    "dict": dict, "enumerate": enumerate, "filter": filter,
    "float": float, "int": int, "isinstance": isinstance,
    "len": len, "list": list, "map": map, "max": max,
    "min": min, "pow": pow, "print": print, "range": range,
    "reversed": reversed, "round": round, "set": set,
    "sorted": sorted, "str": str, "sum": sum, "tuple": tuple,
    "zip": zip, "True": True, "False": False, "None": None,
}

FORBIDDEN_CALLS = {
    "eval", "exec", "compile", "open", "input", "globals",
    "locals", "vars", "dir", "getattr", "setattr", "delattr",
    "hasattr", "__import__", "breakpoint", "help", "memoryview"
}

app = FastAPI(
    title="CodeToAnim Trace Engine",
    description="Backend execution engine to capture step-by-step code execution states.",
    version="1.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Add your production frontend domain here when deployed
        # "https://your-frontend-domain.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- Pydantic Request / Response Models ---
class CodeExecutionRequest(BaseModel):
    code: str = Field(
        ...,
        max_length=MAX_CODE_CHARS,
        description=f"User Python algorithm code (Max {MAX_CODE_CHARS} chars, {MAX_CODE_LINES} lines)."
    )

class TraceStep(BaseModel):
    step: int
    line: int
    variables: Dict[str, Any]
    output: Optional[str] = ""
    visual_layout: Dict[str, Any] = {}

class TraceResponse(BaseModel):
    success: bool
    steps: List[TraceStep]
    error: Optional[str] = None


# --- AST Security Validator ---
class SecurityASTValidator(ast.NodeVisitor):
    """Walks the Python AST to block dangerous constructs before execution."""

    def visit_Import(self, node):
        raise ValueError("Import statements are disabled for security reasons.")

    def visit_ImportFrom(self, node):
        raise ValueError("Import statements are disabled for security reasons.")

    def visit_Call(self, node):
        # Block dangerous function calls by name
        if isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
            raise ValueError(f"Function call '{node.func.id}()' is prohibited.")
        self.generic_visit(node)

    def visit_Attribute(self, node):
        # Block dunder attribute traversal (e.g. __class__, __globals__)
        if node.attr.startswith("__"):
            raise ValueError(f"Accessing private/dunder attribute '{node.attr}' is prohibited.")
        self.generic_visit(node)


def validate_code_security(code_string: str) -> None:
    """Validates line limits and scans AST for security vulnerabilities."""
    lines = code_string.splitlines()
    if len(lines) > MAX_CODE_LINES:
        raise ValueError(f"Code exceeds maximum limit of {MAX_CODE_LINES} lines (received {len(lines)}).")

    try:
        tree = ast.parse(code_string, filename="<user_code>")
    except SyntaxError as e:
        raise ValueError(f"SyntaxError: {e.msg} at line {e.lineno}")

    validator = SecurityASTValidator()
    validator.visit(tree)


# --- Helper: Safe JSON Serialization ---
def make_json_safe(val, depth=0):
    if depth > 10:
        return "..."
    if isinstance(val, (int, float, str, bool, type(None))):
        return val
    if isinstance(val, (list, tuple, set)):
        return [make_json_safe(item, depth + 1) for item in list(val)[:100]]
    if isinstance(val, dict):
        return {str(k): make_json_safe(v, depth + 1) for k, v in list(val.items())[:100]}
    if isinstance(val, type) or callable(val):
        return str(val)

    # Parse Custom Classes (ListNode, TreeNode, etc.)
    safe_dict = {}
    try:
        for attr in dir(val):
            if not attr.startswith("_"):
                attr_val = getattr(val, attr)
                if not callable(attr_val):
                    safe_dict[attr] = make_json_safe(attr_val, depth + 1)
        if safe_dict:
            return safe_dict
    except Exception:
        pass

    return str(val)


# --- Layout Blueprint Generator ---
def generate_visual_layout(clean_vars: dict) -> dict:
    def is_tree(obj):
        return isinstance(obj, dict) and ("left" in obj or "right" in obj)

    # 1. Binary Tree Check
    for key, val in clean_vars.items():
        root = val if is_tree(val) else (val.get("root") if isinstance(val, dict) and is_tree(val.get("root")) else None)
        if root:
            nodes, edges = [], []

            def traverse(node, x, y, h_spacing, path_id, depth=0):
                if not isinstance(node, dict) or depth > 10:
                    return
                val_str = str(node.get("val", node.get("data", node.get("value", "?"))))
                nodes.append({"val": val_str, "x": x, "y": y, "id": path_id})

                if isinstance(node.get("left"), dict):
                    cx, cy = x - h_spacing, y + 60
                    edges.append({"x1": x, "y1": y, "x2": cx, "y2": cy})
                    traverse(node["left"], cx, cy, h_spacing / 1.8, path_id + "L", depth + 1)

                if isinstance(node.get("right"), dict):
                    cx, cy = x + h_spacing, y + 60
                    edges.append({"x1": x, "y1": y, "x2": cx, "y2": cy})
                    traverse(node["right"], cx, cy, h_spacing / 1.8, path_id + "R", depth + 1)

            traverse(root, 250, 30, 100, "root")
            return {"type": "tree", "key": key, "nodes": nodes, "edges": edges}

    # 2. Linked List Check
    def is_ll(obj):
        return isinstance(obj, dict) and "next" in obj

    for key, val in clean_vars.items():
        head = val if is_ll(val) else (val.get("head") if isinstance(val, dict) and is_ll(val.get("head")) else None)
        if head:
            nodes, curr, safe_count = [], head, 0
            while isinstance(curr, dict) and safe_count < 50:
                nodes.append({"val": str(curr.get("val", curr.get("data", curr.get("value", "?"))))})
                curr = curr.get("next")
                safe_count += 1
            return {"type": "linked_list", "key": key, "nodes": nodes}

    # 3. Dictionary Check
    for key, val in clean_vars.items():
        if isinstance(val, dict) and len(val) > 0 and not isinstance(list(val.values())[0], dict):
            entries = [{"key": str(k), "val": str(v)} for k, v in list(val.items())[:50]]
            return {"type": "dict", "key": key, "entries": entries}

    # 4. Array / String Check
    for key, val in clean_vars.items():
        is_valid_array = isinstance(val, list)
        is_valid_string = isinstance(val, str) and not val.startswith("<")

        if is_valid_array or is_valid_string:
            arr_data = [str(v) for v in val[:50]] if is_valid_array else list(val[:50])
            pointers = []
            for p_key, p_val in clean_vars.items():
                if isinstance(p_val, int) and 0 <= p_val < len(arr_data):
                    pointers.append({"key": p_key, "index": p_val})
            return {"type": "array", "key": key, "data": arr_data, "pointers": pointers}

    return {"type": "none"}


# --- Worker Execution Sandbox ---
def run_trace_worker(code_string: str) -> dict:
    steps = []
    step_counter = 0
    stdout_buffer = io.StringIO()
    ignored_keys = {"file", "sep", "end", "flush", "args", "func"}

    def trace_func(frame, event, arg):
        nonlocal step_counter
        if frame.f_code.co_filename != "<user_code>":
            return None

        if event == "line":
            step_counter += 1
            if step_counter > MAX_STEPS:
                sys.settrace(None)
                return None

            combined_vars = {**frame.f_globals, **frame.f_locals}
            clean_vars = {}
            for k, v in combined_vars.items():
                if not k.startswith("_") and k not in ignored_keys and not callable(v):
                    try:
                        clean_vars[k] = make_json_safe(v)
                    except Exception as e:
                        clean_vars[k] = f"Error: {str(e)}"

            layout_blueprint = generate_visual_layout(clean_vars)

            steps.append({
                "step": step_counter,
                "line": frame.f_lineno,
                "variables": clean_vars,
                "output": stdout_buffer.getvalue(),
                "visual_layout": layout_blueprint
            })
        return trace_func

    # Sandboxed execution scope with restricted built-ins
    execution_scope = {
        "__builtins__": ALLOWED_BUILTINS.copy(),
        "__name__": "__main__",
        "__doc__": None,
    }

    compiled_code = compile(code_string, "<user_code>", "exec")

    # Use thread-safe stdout redirection
    with contextlib.redirect_stdout(stdout_buffer):
        sys.settrace(trace_func)
        try:
            exec(compiled_code, execution_scope)
            if steps and steps[-1]["output"] != stdout_buffer.getvalue():
                steps[-1]["output"] = stdout_buffer.getvalue()
            return {"success": True, "steps": steps}
        except Exception as e:
            # Catch runtime errors and "print" them to the user
            error_msg = f"❌ Runtime Error ({type(e).__name__}): {str(e)}"
            
            if steps:
                # Append the error to the console output of the final recorded step
                steps[-1]["output"] = stdout_buffer.getvalue() + f"\n{error_msg}"
            else:
                # If it failed before any steps were recorded, create a mock step
                steps.append({
                    "step": 1,
                    "line": 1,
                    "variables": {},
                    "output": error_msg,
                    "visual_layout": {"type": "none"}
                })
            
            return {"success": False, "error": error_msg, "steps": steps}
        finally:
            sys.settrace(None)


# --- API Endpoints ---
# Reusable executor pool
executor_pool = ThreadPoolExecutor(max_workers=4)

@app.post("/api/trace", response_model=TraceResponse)
def execute_code_trace(request: CodeExecutionRequest):
    code = request.code.strip()
    
    # Helper to generate a visual error message step
    def create_error_response(message: str) -> TraceResponse:
        mock_step = TraceStep(
            step=1, 
            line=1, 
            variables={}, 
            output=message, 
            visual_layout={"type": "none"}
        )
        return TraceResponse(success=False, steps=[mock_step], error=message)

    if not code:
        return create_error_response("❌ Error: Code string cannot be empty.")

    # 1. Static AST Security & Line Limit Check
    try:
        validate_code_security(code)
    except ValueError as val_err:
        # User entered malicious code or exceeded limits
        return create_error_response(f"🛡️ Security Block: {str(val_err)}")

    # 2. Execute within ThreadPool with safety timeout
    try:
        future = executor_pool.submit(run_trace_worker, code)
        result = future.result(timeout=EXECUTION_TIMEOUT_SECONDS)
    except TimeoutError:
        # User created an infinite loop or heavy computation
        return create_error_response(f"⏳ Timeout Error: Code execution took too long (Limit: {EXECUTION_TIMEOUT_SECONDS}s). Check for infinite loops!")
    except Exception as e:
        return create_error_response(f"⚙️ System Error: {str(e)}")

    if not result.get("success"):
        # Returns the step data that contains the Runtime Error formatted by the worker
        return TraceResponse(success=False, steps=result.get("steps", []), error=result.get("error"))

    return TraceResponse(success=True, steps=result["steps"])