import sys
import copy
import io
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import collections
import heapq
import builtins

# --- CRITICAL FIX: Save the real import function before we override it ---
_original_import = builtins.__import__

app = FastAPI(
    title="CodeToAnim Trace Engine",
    description="Backend execution engine to capture step-by-step code execution states for visual animation.",
    version="1.0.2"
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
    visual_layout: Dict[str, Any] = {}

class TraceResponse(BaseModel):
    success: bool
    steps: List[TraceStep]
    error: Optional[str] = None


# --- Helper: Safe JSON Serialization ---
def make_json_safe(val, depth=0):
    if depth > 15: return "..."
    
    # --- FIX: Prevent module scanning crashes ---
    if type(val).__name__ == 'module': return str(val)
    
    if isinstance(val, (int, float, str, bool, type(None))): return val
    
    # FIX: Handle sets and deques by converting them to lists first!
    if type(val).__name__ == 'deque' or isinstance(val, collections.deque):
        return [make_json_safe(item, depth + 1) for item in list(val)[:50]]
    if isinstance(val, set): 
        return [make_json_safe(item, depth + 1) for item in list(val)[:50]]
    if isinstance(val, (list, tuple)): 
        return [make_json_safe(item, depth + 1) for item in val[:50]]
        
    if isinstance(val, dict): 
        return {str(k): make_json_safe(v, depth + 1) for i, (k, v) in enumerate(val.items()) if i < 50}
    if isinstance(val, type) or callable(val): return str(val)

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

# --- Advanced Abstracted Blueprint Generator (Scoring Engine) ---
def generate_visual_layout(clean_vars: dict) -> dict:
    candidates = []

    def is_tree(obj):
        return isinstance(obj, dict) and ('left' in obj or 'right' in obj)

    def is_ll(obj):
        return isinstance(obj, dict) and 'next' in obj

    def is_graph(obj):
        if not isinstance(obj, dict) or len(obj) == 0: return False
        
        wrapper_keys = {'stack', 'queue', 'q', 'arr', 'array', 'list', 'items', 'data', 'elements'}
        if len(obj) == 1 and list(obj.keys())[0].lower() in wrapper_keys:
            return False
            
        sample = next(iter(obj.values()), None)
        return isinstance(sample, list)

    for key, val in clean_vars.items():
        # 1. TREE SCORING
        root = val if is_tree(val) else (val.get('root') if isinstance(val, dict) and is_tree(val.get('root')) else None)
        if root:
            nodes, edges = [], []
            def traverse(node, x, y, h_spacing, path_id):
                if not isinstance(node, dict) or len(nodes) > 40: return
                val_str = str(node.get('val', node.get('data', node.get('value', '?'))))
                nodes.append({"val": val_str, "x": x, "y": y, "id": path_id})
                
                if isinstance(node.get('left'), dict):
                    edges.append({"x1": x, "y1": y, "x2": x - h_spacing, "y2": y + 60})
                    traverse(node['left'], x - h_spacing, y + 60, h_spacing / 1.8, path_id + 'L')
                
                if isinstance(node.get('right'), dict):
                    edges.append({"x1": x, "y1": y, "x2": x + h_spacing, "y2": y + 60})
                    traverse(node['right'], x + h_spacing, y + 60, h_spacing / 1.8, path_id + 'R')
            
            traverse(root, 250, 30, 100, 'root')
            score = 100 + len(nodes) + (20 if key in ['root', 'tree'] else 0)
            candidates.append({"type": "tree", "key": key, "nodes": nodes, "edges": edges, "score": score})
            continue

        # 2. LINKED LIST SCORING
        head = val if is_ll(val) else (val.get('head') if isinstance(val, dict) and is_ll(val.get('head')) else None)
        if head:
            nodes, curr, safe_count = [], head, 0
            while isinstance(curr, dict) and safe_count < 30:
                nodes.append({"val": str(curr.get('val', curr.get('data', curr.get('value', '?'))))})
                curr = curr.get('next')
                safe_count += 1
            score = 90 + len(nodes) + (30 if key in ['prev', 'curr', 'tail'] else 0)
            candidates.append({"type": "linked_list", "key": key, "nodes": nodes, "score": score})
            continue

        # 3. GRAPH SCORING
        graph_data = None
        if is_graph(val):
            graph_data = val
        elif isinstance(val, dict):
            if is_graph(val.get('graph')):
                graph_data = val.get('graph')
            elif is_graph(val.get('adj')):
                graph_data = val.get('adj')

        if graph_data:
            nodes = [{"id": k, "neighbors": v} for k, v in graph_data.items()]
            score = 95 + len(nodes) + (30 if key in ['graph', 'adj', 'my_network', 'self'] else 0)
            candidates.append({"type": "graph", "key": key, "nodes": nodes, "score": score})
            continue

        # 4. ARRAY / STACK / QUEUE SCORING
        array_data = None
        is_stack_intent = False
        is_queue_intent = False
        
        if isinstance(val, list):
            array_data = val
            if 'stack' in key.lower():
                is_stack_intent = True
            elif 'queue' in key.lower() or key.lower() == 'q' or 'deque' in key.lower():
                is_queue_intent = True
        elif isinstance(val, dict):
            for attr in ['stack', 'queue', 'q', 'arr', 'array', 'list', 'items', 'data', 'elements']:
                if isinstance(val.get(attr), list):
                    array_data = val.get(attr)
                    if 'stack' in attr.lower() or 'stack' in key.lower():
                        is_stack_intent = True
                    elif 'queue' in attr.lower() or 'queue' in key.lower() or key.lower() == 'q':
                        is_queue_intent = True
                    break
        
        if array_data is not None:
            arr_data = [str(v) for v in array_data[:40]]
            pointers = [{"key": pk, "index": pv} for pk, pv in clean_vars.items() if isinstance(pv, int) and 0 <= pv < len(array_data)]
            
            score = 70 + len(arr_data) + (10 * len(pointers)) + (30 if key in ['res', 'arr', 'nums', 'stack', 'queue', 'q', 'self', 's'] else 0)
            
            layout_type = "stack" if is_stack_intent else "array"
            candidates.append({"type": layout_type, "key": key, "data": arr_data, "pointers": pointers, "score": score})
            continue

        # 5. HASH MAP / DICT SCORING
        if isinstance(val, dict) and len(val) > 0:
            entries = [{"key": str(k), "val": str(v)} for i, (k, v) in enumerate(val.items()) if i < 25]
            score = 60 + len(entries) + (15 if key in ['seen', 'visited', 'memo', 'freq', 'hashmap'] else 0)
            candidates.append({"type": "dict", "key": key, "entries": entries, "score": score})

    if candidates:
        best_candidate = max(candidates, key=lambda x: x['score'])
        del best_candidate['score'] 
        return best_candidate

    return {"type": "none"}

# --- Standalone Worker Function ---
def run_trace_worker(code_string):
    steps = []
    step_counter = 0
    old_stdout = sys.stdout
    stdout_buffer = io.StringIO()
    sys.stdout = stdout_buffer

    # --- RESOURCE LIMITS ---
    MAX_STEPS = 1000
    MAX_TIME = 2.0  # seconds
    MAX_OUTPUT_LEN = 2000 # characters
    start_time = time.time()

    def trace_func(frame, event, arg):
        nonlocal step_counter
        
        # 1. Stop Infinite Loops
        if step_counter >= MAX_STEPS:
            raise RuntimeError(f"Execution stopped: Exceeded {MAX_STEPS} steps.")
        
        # 2. Stop Frozen Code
        if time.time() - start_time > MAX_TIME:
            raise TimeoutError("Execution stopped: Exceeded 2.0 seconds.")

        # Ensure we trace into inner function scopes
        if event == 'line' or event == 'call':
            if event == 'line':
                step_counter += 1
                clean_vars = {}
                for k, v in frame.f_locals.items():
                    if not k.startswith('__') and k not in ['sys', 'time'] and not callable(v):
                        try:
                            clean_vars[k] = make_json_safe(v)
                        except Exception:
                            clean_vars[k] = "Un-serializable object"

                layout_blueprint = generate_visual_layout(clean_vars)
                
                # 3. Cap Output Size
                current_output = stdout_buffer.getvalue()
                if len(current_output) > MAX_OUTPUT_LEN:
                    current_output = current_output[:MAX_OUTPUT_LEN] + "\n...[Output Truncated]"

                steps.append({
                    "step": step_counter,
                    "line": frame.f_lineno,
                    "variables": clean_vars,
                    "output": current_output,
                    "visual_layout": layout_blueprint
                })
        return trace_func

    # --- SECURITY: RESTRICTED BUILT-INS ---
    ALLOWED_MODULES = {'collections', 'heapq'}

    def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
        base_name = name.split('.')[0] 
        if base_name in ALLOWED_MODULES:
            return _original_import(name, globals, locals, fromlist, level)
        raise ImportError(f"Importing module '{name}' is not allowed for security reasons.")

    safe_builtins = {
        'print': print, 'range': range, 'len': len, 'int': int, 'str': str,
        'list': list, 'dict': dict, 'set': set, 'tuple': tuple, 'bool': bool,
        'float': float, 'enumerate': enumerate, 'zip': zip, 'min': min, 'max': max,
        'sum': sum, 'abs': abs, 'round': round, 'Exception': Exception,
        'ValueError': ValueError, 'TypeError': TypeError, 'IndexError': IndexError,
        '__build_class__': __build_class__,
        '__import__': safe_import,
    }
    
    # --- FIX: Inject __name__ for standard script boilerplates ---
    execution_scope = {
        "__builtins__": safe_builtins,
        "__name__": "__main__"
    }

    try:
        sys.settrace(trace_func)
        exec(code_string, execution_scope)
        sys.settrace(None)
        
        # ONE EXTRA STEP FOR FINAL STATE
        step_counter += 1
        clean_vars = {}
        for k, v in execution_scope.items():
            if not k.startswith('__') and not callable(v):
                try:
                    clean_vars[k] = make_json_safe(v)
                except Exception:
                    pass

        steps.append({
            "step": step_counter,
            "line": steps[-1]["line"] if steps else 1,
            "variables": clean_vars,
            "output": stdout_buffer.getvalue()[:MAX_OUTPUT_LEN],
            "visual_layout": generate_visual_layout(clean_vars)
        })
        
        return {"success": True, "steps": steps}
        
    except Exception as e:
        return {"success": False, "error": f"{type(e).__name__}: {str(e)}"}
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

@app.get("/")
def read_root():
    return {"status": "online", "message": "CodeToAnim Trace Engine is running successfully!"}

@app.post("/api/trace", response_model=TraceResponse)
def execute_code_trace(request: CodeExecutionRequest):
    if not request.code.strip():
        return TraceResponse(success=False, steps=[], error="Code string cannot be empty.")
    
    # --- FIX: Removed ThreadPoolExecutor to prevent server deadlocks ---
    try:
        result = run_trace_worker(request.code)
    except Exception as e:
        return TraceResponse(success=False, steps=[], error=f"Server error: {str(e)}")

    if not result.get("success"): 
        return TraceResponse(success=False, steps=[], error=result.get("error", "Unknown error"))
        
    return TraceResponse(success=True, steps=result["steps"])