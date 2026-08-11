import sys
import copy
import io
from concurrent.futures import ProcessPoolExecutor, TimeoutError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="CodeToAnim Trace Engine",
    description="Backend execution engine to capture step-by-step code execution states for visual animation.",
    version="1.0.0"
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
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
    output: Optional[str] = ""  # Captures stdout (print) history per step

class TraceResponse(BaseModel):
    success: bool
    steps: List[TraceStep]
    error: Optional[str] = None


# --- Helper Function for Safe JSON Serialization ---
def make_json_safe(val):
    """Recursively converts variables to JSON-friendly primitives."""
    if isinstance(val, (int, float, str, bool, type(None))):
        return val
    elif isinstance(val, list):
        return [make_json_safe(item) for item in val]
    elif isinstance(val, dict):
        return {str(k): make_json_safe(v) for k, v in val.items()}
    elif isinstance(val, (set, tuple)):
        return [make_json_safe(item) for item in val]
    else:
        return str(val)


# --- Standalone Worker Function for ProcessPoolExecutor ---
def run_trace_worker(code_string: str) -> dict:
    steps = []
    step_counter = 0
    MAX_STEPS = 500  # Cap step count to prevent bloated payloads

    # Redirect stdout to capture prints
    stdout_buffer = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = stdout_buffer

    def trace_func(frame, event, arg):
        nonlocal step_counter
        if event == 'line':
            step_counter += 1
            
            # Stop tracing if execution steps exceed limit
            if step_counter > MAX_STEPS:
                sys.settrace(None)
                return None

            raw_locals = frame.f_locals
            clean_locals = {}
            for key, val in raw_locals.items():
                if not key.startswith('__'):
                    try:
                        clean_locals[key] = make_json_safe(copy.deepcopy(val))
                    except Exception:
                        clean_locals[key] = str(val)

            # Capture all output printed up to the current line
            current_output = stdout_buffer.getvalue()

            steps.append({
                "step": step_counter,
                "line": frame.f_lineno,
                "variables": clean_locals,
                "output": current_output
            })
        return trace_func

    execution_scope = {}
    sys.settrace(trace_func)
    try:
        exec(code_string, execution_scope)
        
        # Ensure the last step holds any prints produced right before exit
        final_output = stdout_buffer.getvalue()
        if steps and steps[-1]["output"] != final_output:
            steps[-1]["output"] = final_output

        return {"success": True, "steps": steps}
    except Exception as e:
        return {"success": False, "error": f"{type(e).__name__}: {str(e)}"}
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout  # Restore standard output buffer


# --- API Endpoints ---
@app.get("/")
def read_root():
    return {
        "status": "Backend Engine Running",
        "service": "CodeToAnim API",
        "docs_url": "/docs"
    }


@app.post("/api/trace", response_model=TraceResponse)
def execute_code_trace(request: CodeExecutionRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code string cannot be empty.")

    with ProcessPoolExecutor(max_workers=1) as executor:
        future = executor.submit(run_trace_worker, request.code)
        try:
            result = future.result(timeout=3.0)  # 3-second timeout limit
        except TimeoutError:
            raise HTTPException(
                status_code=400, 
                detail="Execution timed out (3s safety limit exceeded). Please check for infinite loops!"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Engine execution error: {str(e)}")

    if not result["success"]:
        return TraceResponse(success=False, steps=[], error=result["error"])

    return TraceResponse(success=True, steps=result["steps"])


@app.get("/api/presets")
def get_preset_algorithms():
    return {
        "bubble_sort": "arr = [4, 2, 8, 1]\nn = len(arr)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    print(f'Pass {i+1}:', arr)",
        "selection_sort": "arr = [64, 25, 12, 22, 11]\nfor i in range(len(arr)):\n    min_idx = i\n    for j in range(i+1, len(arr)):\n        if arr[min_idx] > arr[j]:\n            min_idx = j\n    arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    print(f'Sorted up to index {i}:', arr)",
        "reverse_array": "arr = [1, 2, 3, 4, 5]\nleft = 0\nright = len(arr) - 1\nwhile left < right:\n    arr[left], arr[right] = arr[right], arr[left]\n    left += 1\n    right -= 1\nprint('Reversed:', arr)"
    }