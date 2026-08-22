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

_original_import = builtins.__import__

app = FastAPI(
    title="CodeToAnim Trace Engine",
    description="Backend execution engine to capture step-by-step code execution states.",
    version="1.0.3"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


def make_json_safe(val, depth=0):
    if depth > 15: return "..."
    if type(val).__name__ == 'module': return str(val)
    if isinstance(val, (int, float, str, bool, type(None))): return val
    
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


def generate_visual_layout(clean_vars: dict) -> dict:
    candidates = []

    def is_tree(obj):
        return isinstance(obj, dict) and ('left' in obj or 'right' in obj)

    def is_ll(obj):
        return isinstance(obj, dict) and 'next' in obj

    def is_graph(obj):
        if not isinstance(obj, dict) or len(obj) == 0: return False
        wrapper_keys = {'stack', 'queue', 'q', 'arr', 'array', 'list', 'items', 'data', 'elements'}
        if len(obj) == 1 and list(obj.keys())[0].lower() in wrapper_keys: return False
        for val in obj.values():
            if not isinstance(val, list): return False
            if len(val) > 0 and isinstance(val[0], list): return False 
        return True

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
            
            pointers = []
            for pk, pv in clean_vars.items():
                if isinstance(pv, dict) and pk not in ['root', 'tree', 'self', key]:
                    if 'val' in pv or 'data' in pv or 'value' in pv:
                        ptr_val = str(pv.get('val', pv.get('data', pv.get('value', '?'))))
                        pointers.append({"key": pk, "target_val": ptr_val})
            
            score = 100 + len(nodes) + (20 if key in ['root', 'tree'] else 0)
            candidates.append({"type": "tree", "key": key, "nodes": nodes, "edges": edges, "pointers": pointers, "score": score})
            continue

        # 2. LINKED LIST SCORING (FIXED PRIORITY)
        head = val if is_ll(val) else (val.get('head') if isinstance(val, dict) and is_ll(val.get('head')) else None)
        if head:
            nodes, curr, safe_count = [], head, 0
            while isinstance(curr, dict) and safe_count < 30:
                nodes.append({"val": str(curr.get('val', curr.get('data', curr.get('value', '?'))))})
                curr = curr.get('next')
                safe_count += 1
            # FIX: Heavily weight the length of the list so 'head' always beats 'curr'
            score = 90 + (len(nodes) * 10) + (10 if key in ['head', 'prev', 'curr', 'tail'] else 0)
            candidates.append({"type": "linked_list", "key": key, "nodes": nodes, "score": score})
            continue

        # 3. GRAPH SCORING
        graph_data = None
        matrix_data = None
        if isinstance(val, list) and len(val) > 0 and isinstance(val[0], list):
            matrix_data = val
        elif isinstance(val, dict) and isinstance(val.get('matrix'), list) and len(val['matrix']) > 0 and isinstance(val['matrix'][0], list):
            matrix_data = val['matrix']
            
        if matrix_data:
            nodes = []
            for i, row in enumerate(matrix_data):
                neighbors = []
                if isinstance(row, list):
                    for j, weight in enumerate(row):
                        if weight != 0:
                            neighbors.append(str(j))
                nodes.append({"id": str(i), "neighbors": neighbors})
            score = 95 + len(nodes) + (30 if key in ['graph', 'matrix', 'adj_matrix', 'self'] else 0)
            candidates.append({"type": "graph", "key": key, "nodes": nodes, "score": score})
            continue

        if is_graph(val):
            graph_data = val
        elif isinstance(val, dict):
            if is_graph(val.get('graph_dict')): graph_data = val.get('graph_dict')
            elif is_graph(val.get('graph')): graph_data = val.get('graph')
            elif is_graph(val.get('adj')): graph_data = val.get('adj')

        if graph_data:
            nodes = [{"id": str(k), "neighbors": [str(n) for n in v]} for k, v in graph_data.items()]
            score = 95 + len(nodes) + (30 if key in ['graph', 'adj', 'my_network', 'self', 'graph_dict'] else 0)
            candidates.append({"type": "graph", "key": key, "nodes": nodes, "score": score})
            continue

        # 4. ARRAY / STACK / QUEUE SCORING
        array_data = None
        is_stack_intent = False
        is_queue_intent = False
        
        if isinstance(val, list):
            array_data = val
            if 'stack' in key.lower(): is_stack_intent = True
            elif 'queue' in key.lower() or key.lower() == 'q' or 'deque' in key.lower(): is_queue_intent = True
        elif isinstance(val, dict):
            for attr in ['stack', 'queue', 'q', 'arr', 'array', 'list', 'items', 'data', 'elements']:
                if isinstance(val.get(attr), list):
                    array_data = val.get(attr)
                    if 'stack' in attr.lower() or 'stack' in key.lower(): is_stack_intent = True
                    elif 'queue' in attr.lower() or 'queue' in key.lower() or key.lower() == 'q': is_queue_intent = True
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


def run_trace_worker(code_string):
    steps = []
    step_counter = 0
    old_stdout = sys.stdout
    stdout_buffer = io.StringIO()
    sys.stdout = stdout_buffer

    MAX_STEPS = 1000
    MAX_TIME = 2.0 
    MAX_OUTPUT_LEN = 2000 
    start_time = time.time()

    def trace_func(frame, event, arg):
        nonlocal step_counter
        
        if step_counter >= MAX_STEPS:
            raise RuntimeError(f"Execution stopped: Exceeded {MAX_STEPS} steps.")
        
        if time.time() - start_time > MAX_TIME:
            raise TimeoutError("Execution stopped: Exceeded 2.0 seconds.")

        # ONLY listen to line events to keep visuals stable
        if event == 'line':
            clean_vars = {}
            for k, v in frame.f_locals.items():
                if not k.startswith('__') and k not in ['sys', 'time'] and not callable(v):
                    try:
                        clean_vars[k] = make_json_safe(v)
                    except Exception:
                        pass

            layout_blueprint = generate_visual_layout(clean_vars)
            
            step_counter += 1
            steps.append({
                "step": step_counter,
                "line": frame.f_lineno,
                "variables": clean_vars,
                "output": stdout_buffer.getvalue()[:MAX_OUTPUT_LEN],
                "visual_layout": layout_blueprint
            })
        return trace_func

    ALLOWED_MODULES = {'collections', 'heapq'}

    def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
        base_name = name.split('.')[0] 
        if base_name in ALLOWED_MODULES:
            return _original_import(name, globals, locals, fromlist, level)
        raise ImportError(f"Importing module '{name}' is not allowed.")

    safe_builtins = {
        'print': print, 'range': range, 'len': len, 'int': int, 'str': str,
        'list': list, 'dict': dict, 'set': set, 'tuple': tuple, 'bool': bool,
        'float': float, 'enumerate': enumerate, 'zip': zip, 'min': min, 'max': max,
        'sum': sum, 'abs': abs, 'round': round, 'Exception': Exception,
        'ValueError': ValueError, 'TypeError': TypeError, 'IndexError': IndexError,
        '__build_class__': __build_class__,
        '__import__': safe_import,
        'map': map, 'filter': filter, 'any': any, 'all': all
    }
    
    execution_scope = {
        "__builtins__": safe_builtins,
        "__name__": "__main__"
    }

    try:
        sys.settrace(trace_func)
        exec(code_string, execution_scope)
        sys.settrace(None)
        
        # FIX: The "Missing Print" solution. 
        # Clone the exact local variables from the last line, but update the terminal output.
        if steps:
            final_output = stdout_buffer.getvalue()[:MAX_OUTPUT_LEN]
            if steps[-1]["output"] != final_output:
                final_step = copy.deepcopy(steps[-1])
                final_step["step"] += 1
                final_step["output"] = final_output
                steps.append(final_step)
                
        return {"success": True, "steps": steps}
        
    except Exception as e:
        return {"success": False, "error": f"{type(e).__name__}: {str(e)}"}
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

@app.get("/")
def read_root():
    return {"status": "online"}

@app.post("/api/trace", response_model=TraceResponse)
def execute_code_trace(request: CodeExecutionRequest):
    if not request.code.strip():
        return TraceResponse(success=False, steps=[], error="Code string cannot be empty.")
    try:
        result = run_trace_worker(request.code)
    except Exception as e:
        return TraceResponse(success=False, steps=[], error=f"Server error: {str(e)}")

    if not result.get("success"): 
        return TraceResponse(success=False, steps=[], error=result.get("error", "Unknown error"))
        
    return TraceResponse(success=True, steps=result["steps"])