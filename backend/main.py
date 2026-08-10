import sys
import copy
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

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class TraceResponse(BaseModel):
    success: bool
    steps: List[TraceStep]
    error: Optional[str] = None


# --- Standalone Worker Function for ProcessPoolExecutor ---
def run_trace_worker(code_string: str) -> dict:
    steps = []
    step_counter = 0

    def trace_func(frame, event, arg):
        nonlocal step_counter
        if event == 'line':
            step_counter += 1
            raw_locals = frame.f_locals
            clean_locals = {}
            for key, val in raw_locals.items():
                if not key.startswith('__'):
                    try:
                        clean_locals[key] = copy.deepcopy(val)
                    except Exception:
                        clean_locals[key] = str(val)

            steps.append({
                "step": step_counter,
                "line": frame.f_lineno,
                "variables": clean_locals
            })
        return trace_func

    execution_scope = {}
    sys.settrace(trace_func)
    try:
        exec(code_string, execution_scope)
        return {"success": True, "steps": steps}
    except Exception as e:
        return {"success": False, "error": f"{type(e).__name__}: {str(e)}"}
    finally:
        sys.settrace(None)


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

    # Use ProcessPoolExecutor to safely spawn process on Windows/Mac/Linux
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
        "bubble_sort": "arr = [4, 2, 8, 1]\nn = len(arr)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]",
        "selection_sort": "arr = [64, 25, 12, 22, 11]\nfor i in range(len(arr)):\n    min_idx = i\n    for j in range(i+1, len(arr)):\n        if arr[min_idx] > arr[j]:\n            min_idx = j\n    arr[i], arr[min_idx] = arr[min_idx], arr[i]",
        "reverse_array": "arr = [1, 2, 3, 4, 5]\nleft = 0\nright = len(arr) - 1\nwhile left < right:\n    arr[left], arr[right] = arr[right], arr[left]\n    left += 1\n    right -= 1"
    }