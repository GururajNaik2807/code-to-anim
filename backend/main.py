import sys
import copy
import io
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="CodeToAnim Trace Engine",
    description="Backend execution engine to capture step-by-step code execution states for visual animation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---
class CodeExecutionRequest(BaseModel):
    code: str

class TraceStep(BaseModel):
    step: int
    line: int
    variables: Dict[str, Any]
    output: Optional[str] = "" 
    visual_layout: Dict[str, Any] = {} # Pre-calculated layout blueprint

class TraceResponse(BaseModel):
    success: bool
    steps: List[TraceStep]
    error: Optional[str] = None


# --- Helper: Safe JSON Serialization ---
def make_json_safe(val, depth=0):
    if depth > 20: return "..."
    if isinstance(val, (int, float, str, bool, type(None))): return val
    if isinstance(val, (list, tuple, set)): return [make_json_safe(item, depth + 1) for item in val]
    if isinstance(val, dict): return {str(k): make_json_safe(v, depth + 1) for k, v in val.items()}
    if isinstance(val, type) or callable(val): return str(val)

    # Automatically parse Custom Classes (like ListNode, TreeNode) into safe dicts
    safe_dict = {}
    try:
        for attr in dir(val):
            if not attr.startswith('_'):
                attr_val = getattr(val, attr)
                if not callable(attr_val):
                    safe_dict[attr] = make_json_safe(attr_val, depth + 1)
        if safe_dict: return safe_dict
    except Exception: pass

    return str(val)

# --- Abstracted Blueprint Generator ---
def generate_visual_layout(clean_vars: dict) -> dict:
    
    # 1. Binary Tree Check
    def is_tree(obj):
        return isinstance(obj, dict) and ('left' in obj or 'right' in obj)

    for key, val in clean_vars.items():
        root = val if is_tree(val) else (val.get('root') if isinstance(val, dict) and is_tree(val.get('root')) else None)
        if root:
            nodes, edges = [], []
            def traverse(node, x, y, h_spacing, path_id):
                if not isinstance(node, dict): return
                val_str = str(node.get('val', node.get('data', node.get('value', '?'))))
                nodes.append({"val": val_str, "x": x, "y": y, "id": path_id})
                
                if isinstance(node.get('left'), dict):
                    cx, cy = x - h_spacing, y + 60
                    edges.append({"x1": x, "y1": y, "x2": cx, "y2": cy})
                    traverse(node['left'], cx, cy, h_spacing / 1.8, path_id + 'L')
                
                if isinstance(node.get('right'), dict):
                    cx, cy = x + h_spacing, y + 60
                    edges.append({"x1": x, "y1": y, "x2": cx, "y2": cy})
                    traverse(node['right'], cx, cy, h_spacing / 1.8, path_id + 'R')
            
            traverse(root, 250, 30, 100, 'root')
            return {"type": "tree", "key": key, "nodes": nodes, "edges": edges}

    # 2. Linked List Check
    def is_ll(obj):
        return isinstance(obj, dict) and 'next' in obj

    for key, val in clean_vars.items():
        head = val if is_ll(val) else (val.get('head') if isinstance(val, dict) and is_ll(val.get('head')) else None)
        if head:
            nodes, curr, safe_count = [], head, 0
            while isinstance(curr, dict) and safe_count < 50:
                nodes.append({"val": str(curr.get('val', curr.get('data', curr.get('value', '?'))))})
                curr = curr.get('next')
                safe_count += 1
            return {"type": "linked_list", "key": key, "nodes": nodes}

    # 3. Dictionary Check
    for key, val in clean_vars.items():
        if isinstance(val, dict) and len(val) > 0 and not isinstance(list(val.values())[0], dict):
            entries = [{"key": str(k), "val": str(v)} for k, v in val.items()]
            return {"type": "dict", "key": key, "entries": entries}

    # 4. Array / String Check
    for key, val in clean_vars.items():
        is_valid_array = isinstance(val, list)
        is_valid_string = isinstance(val, str) and not val.startswith("<")
        
        if is_valid_array or is_valid_string:
            arr_data = [str(v) for v in val] if is_valid_array else list(val)
            pointers = []
            for p_key, p_val in clean_vars.items():
                if isinstance(p_val, int) and 0 <= p_val < len(val):
                    pointers.append({"key": p_key, "index": p_val})
            return {"type": "array", "key": key, "data": arr_data, "pointers": pointers}

    return {"type": "none"}

# --- Standalone Worker Function ---
def run_trace_worker(code_string: str) -> dict:
    steps = []
    step_counter = 0
    MAX_STEPS = 500  

    stdout_buffer = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = stdout_buffer

    IGNORED_SYSTEM_KEYS = {'file', 'sep', 'end', 'flush', 'args', 'func'}

    def trace_func(frame, event, arg):
        nonlocal step_counter
        if frame.f_code.co_filename != "<string>": return None

        if event == 'line':
            step_counter += 1
            if step_counter > MAX_STEPS:
                sys.settrace(None)
                return None

            combined_vars = {**frame.f_globals, **frame.f_locals}
            clean_vars = {}
            for k, v in combined_vars.items():
                if not k.startswith('__') and k not in IGNORED_SYSTEM_KEYS and not callable(v):
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

    execution_scope = {}
    sys.settrace(trace_func)
    try:
        exec(code_string, execution_scope)
        if steps and steps[-1]["output"] != stdout_buffer.getvalue():
            steps[-1]["output"] = stdout_buffer.getvalue()
        return {"success": True, "steps": steps}
    except Exception as e:
        return {"success": False, "error": f"{type(e).__name__}: {str(e)}"}
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

# --- API Endpoints ---

# 1. Health check endpoint to prevent 404 when visiting the base URL
@app.get("/")
def read_root():
    return {"status": "online", "message": "CodeToAnim Trace Engine is running successfully!"}

# 2. Main execution trace endpoint
@app.post("/api/trace", response_model=TraceResponse)
def execute_code_trace(request: CodeExecutionRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code string cannot be empty.")
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(run_trace_worker, request.code)
        try:
            result = future.result(timeout=3.0)
        except TimeoutError:
            raise HTTPException(status_code=400, detail="Execution timed out (3s safety limit exceeded).")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Engine execution error: {str(e)}")

    if not result["success"]: return TraceResponse(success=False, steps=[], error=result["error"])
    return TraceResponse(success=True, steps=result["steps"])