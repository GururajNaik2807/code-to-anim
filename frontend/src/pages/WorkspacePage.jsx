import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../supabaseClient';
import LoginModal from '../components/LoginModal';

// Read production URL from environment variable, fallback to localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function WorkspacePage() {
  const location = useLocation();
  const { user, openAuthModal } = useAuth(); 
  
  const DEFAULT_CODE = `# 1. Define input variables
nums = [2, 7, 11, 15]
target = 9

# 2. Result variable
found_indices = []

# 3. Check every pair
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            found_indices = [i, j]
            break
    if found_indices:
        break

print("Indices found:", found_indices)`;

  const [code, setCode] = useState(location.state?.presetCode || DEFAULT_CODE);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (location.state?.presetCode) {
      setCode(location.state.presetCode);
    }
  }, [location.state]);

  const handleSaveCode = async () => {
    if (!user) {
      openAuthModal('Create a free account or log in to save your custom code and algorithms!');
      return;
    }

    const algoName = prompt("Enter a name for this algorithm:", "My Custom Algorithm");
    if (!algoName) return; 
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_algorithms') 
        .insert([
          { 
            user_id: user.id,
            title: algoName,           
            code_content: code,        
            list_name: 'Favorites'     
          }
        ]);

      if (error) {
        throw error;
      }
      
      alert(`"${algoName}" saved successfully to your profile!`);
    } catch (error) {
      console.error("Error saving to Supabase:", error.message);
      setErrorMessage("Failed to save code: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteTrace = async () => {
    if (!user) {
      const today = new Date().toDateString(); 
      let execData = { count: 0, date: today };

      try {
        const raw = localStorage.getItem('guest_exec_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.date === today) {
            execData.count = typeof parsed.count === 'number' ? parsed.count : 0;
          }
        }
      } catch (err) {
        console.warn('localStorage access failed, allowing execution by default.', err);
      }

      if (execData.count >= 3) {
        try {
          openAuthModal('Daily execution limit reached (3/3 runs used). Sign up for unlimited executions!');
        } catch (err) {
          console.warn('openAuthModal failed to open', err);
        }
        return; 
      }

      execData.count += 1;
      execData.date = today;
      try {
        localStorage.setItem('guest_exec_data', JSON.stringify(execData));
      } catch (err) {
        console.warn('localStorage set failed for guest_exec_data', err);
      }
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/trace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSteps(data.steps || []);
        setCurrentStepIndex(0);
        setIsEditing(false);
      } else {
        setErrorMessage(data.detail || data.error || "Execution trace failed.");
      }
    } catch (err) {
      setErrorMessage(`Could not connect to backend server at ${API_BASE_URL}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstStep = () => setCurrentStepIndex(0);
  const handlePrevStep = () => setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  const handleNextStep = () => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  const handleLastStep = () => setCurrentStepIndex(Math.max(0, steps.length - 1));

  const currentStep = steps[currentStepIndex];
  const activeLineNumber = currentStep?.line ?? null;
  const variables = currentStep?.variables || {};
  const consoleOutput = currentStep?.output ?? "";

  // --- ARRAY PARSING ---
  const primaryArrayKey = Object.keys(variables).find((key) =>
    Array.isArray(variables[key]) && key !== 'found_indices'
  ) || Object.keys(variables).find((key) => Array.isArray(variables[key]));

  const primaryArray = primaryArrayKey ? variables[primaryArrayKey] : null;
  const arrayLength = Array.isArray(primaryArray) ? primaryArray.length : 0;
  
  const activePointers = Object.keys(variables).filter(
    (key) =>
      typeof variables[key] === 'number' &&
      variables[key] >= 0 &&
      variables[key] < arrayLength
  );

  // --- UNIVERSAL LINKED LIST PARSING ---
  const getNodeValue = (node) => {
    if (node.val !== undefined) return node.val;
    if (node.data !== undefined) return node.data;
    if (node.value !== undefined) return node.value;
    return '?';
  };

  const findLinkedList = (vars) => {
    for (const [key, obj] of Object.entries(vars)) {
      if (!obj || typeof obj !== 'object') continue;
      
      if (('val' in obj || 'data' in obj || 'value' in obj) && 'next' in obj) {
        return { key, head: obj };
      }
      
      if ('head' in obj && obj.head && typeof obj.head === 'object') {
        if (('val' in obj.head || 'data' in obj.head || 'value' in obj.head) && 'next' in obj.head) {
           return { key: `${key}.head`, head: obj.head };
        }
      }
    }
    return { key: null, head: null };
  };

  const { key: primaryLinkedListKey, head: primaryLinkedListHead } = findLinkedList(variables);

  const flattenLinkedList = (head) => {
    const nodes = [];
    let current = head;
    let safeCount = 0; 
    while (current && safeCount < 50) {
      nodes.push(current);
      current = current.next;
      safeCount++;
    }
    return nodes;
  };

  const flatLinkedList = primaryLinkedListHead ? flattenLinkedList(primaryLinkedListHead) : [];

  // --- BINARY TREE PARSING ---
  const findBinaryTree = (vars) => {
    for (const [key, obj] of Object.entries(vars)) {
      if (!obj || typeof obj !== 'object') continue;
      
      if (('val' in obj || 'data' in obj || 'value' in obj) && ('left' in obj || 'right' in obj)) {
        return { key, root: obj };
      }
      
      if ('root' in obj && obj.root && typeof obj.root === 'object') {
        if (('val' in obj.root || 'data' in obj.root || 'value' in obj.root) && ('left' in obj.root || 'right' in obj.root)) {
           return { key: `${key}.root`, root: obj.root };
        }
      }
    }
    return { key: null, root: null };
  };

  const { key: primaryTreeKey, root: primaryTreeRoot } = findBinaryTree(variables);

  const getTreeLayout = (rootNode) => {
    const nodes = [];
    const edges = [];
    if (!rootNode) return { nodes, edges };

    const traverse = (node, x, y, horizontalSpacing, pathId) => {
      if (!node || typeof node !== 'object') return;

      nodes.push({ 
        val: getNodeValue(node), 
        x, 
        y, 
        id: pathId 
      });

      if (node.left && typeof node.left === 'object') {
        const childX = x - horizontalSpacing;
        const childY = y + 60;
        edges.push({ x1: x, y1: y, x2: childX, y2: childY });
        traverse(node.left, childX, childY, horizontalSpacing / 1.8, pathId + 'L');
      }
      
      if (node.right && typeof node.right === 'object') {
        const childX = x + horizontalSpacing;
        const childY = y + 60;
        edges.push({ x1: x, y1: y, x2: childX, y2: childY });
        traverse(node.right, childX, childY, horizontalSpacing / 1.8, pathId + 'R');
      }
    };

    traverse(rootNode, 250, 30, 100, 'root');
    return { nodes, edges };
  };

  const treeLayout = primaryTreeRoot ? getTreeLayout(primaryTreeRoot) : { nodes: [], edges: [] };

  const variableEntries = Object.entries(variables);
  const codeLines = code.split('\n');

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-950 text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      
      <LoginModal />

      <header className="h-16 border-b bg-gray-900 border-gray-800 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-3xl hover:scale-105 transition-transform" title="Home">
            🎬
          </Link>
          <h1 className="text-xl font-extrabold text-white tracking-tighter">
            Code<span className="text-purple-500">Anim</span> Universal
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/algorithms"
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-md font-medium border border-purple-500/30 transition-colors flex items-center gap-1.5"
          >
            📚 Algorithm Library
          </Link>

          <button 
            onClick={handleSaveCode}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-blue-300 rounded-md font-medium border border-blue-500/30 transition-colors flex items-center gap-1.5"
          >
            💾 Save Code
          </button>

          {user && (
            <>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-md font-medium border border-purple-500/30 transition-colors flex items-center gap-1.5"
              >
                {isEditing ? "👁️ View Visual Execution" : "✏️ Edit Python Code"}
              </button>

              <Link
                to="/profile"
                className="px-4 py-2 text-sm bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 rounded-md font-medium border border-purple-500/40 transition-colors flex items-center gap-2"
                title="Go to Profile"
              >
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                Profile
              </Link>
            </>
          )}

          {!user && (
            <button 
              onClick={() => openAuthModal('Create an account to unlock unlimited executions and edit code!')}
              className="px-4 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-md font-medium border border-purple-500/50 transition-colors flex items-center gap-1.5"
            >
              🔐 Sign Up / Log In
            </button>
          )}

          <button 
            onClick={handleExecuteTrace}
            disabled={isLoading}
            className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white rounded-md font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
          >
            {isLoading ? "Running Trace..." : "▶ Execute Trace"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-1/2 h-full border-r border-gray-800 flex flex-col bg-gray-950">
          <div className="px-4 py-2 border-b bg-gray-900 border-gray-800 text-xs font-mono font-semibold text-gray-400 flex justify-between items-center">
            <span>{isEditing && user ? "✏️ PYTHON EDITOR" : "🔍 EXECUTION TRACE"}</span>
            <span className="text-purple-400">main.py</span>
          </div>

          {isEditing && user ? (
            <div className="flex-1 flex flex-col p-4 bg-gray-950">
              <div className="flex-1 relative flex rounded-lg border border-gray-800 bg-gray-900/60 overflow-hidden focus-within:border-purple-500/80 transition-colors">
                <div className="select-none py-3 px-2 bg-gray-950/80 text-right text-gray-600 font-mono text-xs leading-6 border-r border-gray-800/80 min-w-[36px]">
                  {codeLines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Type or paste any Python algorithm code here..."
                  spellCheck={false}
                  className="flex-1 bg-transparent p-3 text-gray-100 font-mono text-sm leading-6 resize-none focus:outline-none"
                />
              </div>

              <div className="mt-3 flex justify-end gap-3">
                <button
                  onClick={handleSaveCode}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-blue-300 font-bold text-sm rounded-lg border border-blue-500/30 transition-all"
                >
                  💾 Save Code
                </button>
                <button
                  onClick={handleExecuteTrace}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold text-sm rounded-lg shadow-lg shadow-purple-500/20 transition-all"
                >
                  {isLoading ? "Running..." : "🚀 Run & Visualize"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative bg-gray-950 font-mono text-sm overflow-auto flex">
              <div className="bg-gray-900/50 border-r border-gray-800/60 select-none py-4 text-right pr-3 pl-2 text-gray-600 font-mono text-xs leading-6 min-w-[40px]">
                {codeLines.map((_, idx) => {
                  const lineNum = idx + 1;
                  const isActive = lineNum === activeLineNumber;
                  return (
                    <div key={idx} className={`h-6 flex items-center justify-end gap-1 ${isActive ? "text-purple-400 font-bold" : ""}`}>
                      {isActive && <span className="text-xs animate-pulse">👉</span>}
                      <span>{lineNum}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 py-4 px-3 relative">
                {codeLines.map((lineStr, idx) => {
                  const lineNum = idx + 1;
                  const isActive = lineNum === activeLineNumber;
                  return (
                    <div
                      key={idx}
                      className={`h-6 px-2 rounded flex items-center font-mono text-sm leading-6 whitespace-pre transition-colors duration-150 ${
                        isActive
                          ? "bg-purple-900/40 border-l-4 border-purple-500 text-purple-200 font-semibold shadow-sm"
                          : "text-gray-300"
                      }`}
                    >
                      {lineStr || " "}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2 h-full flex flex-col bg-gray-900/40">
          <div className="px-4 py-2 border-b bg-gray-900 border-gray-800 text-xs font-mono font-semibold text-gray-400 flex justify-between items-center">
            <span>VISUAL CANVAS & STATE INSPECTOR</span>
            {activeLineNumber && (!isEditing || !user) && (
              <span className="text-xs text-purple-400 font-mono bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded">
                Line {activeLineNumber}
              </span>
            )}
          </div>
          
          <div className="flex-1 flex flex-col p-6 overflow-auto gap-6">
            {errorMessage && (
              <div className="p-4 bg-red-950/80 border border-red-500/50 text-red-300 rounded-lg text-sm font-mono shadow-lg">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* SECTION 1: Graphical Visualizers (Trees > Linked Lists > Arrays) */}
            {treeLayout.nodes.length > 0 ? (
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                  <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider">
                    Binary Tree ({primaryTreeKey})
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    nodes: {treeLayout.nodes.length}
                  </span>
                </div>

                <div className="relative w-full min-h-[220px] overflow-auto flex justify-center bg-gray-950/50 rounded-lg border border-gray-800/50">
                  <div className="relative w-[500px] h-[220px]">
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      {treeLayout.edges.map((edge, idx) => (
                        <line 
                          key={`edge-${idx}`} 
                          x1={edge.x1} y1={edge.y1 + 16} 
                          x2={edge.x2} y2={edge.y2 + 16} 
                          stroke="#374151" 
                          strokeWidth="2" 
                        />
                      ))}
                    </svg>

                    <AnimatePresence>
                      {treeLayout.nodes.map((node) => (
                        <motion.div
                          key={`tree-node-${node.id}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 bg-gray-900 border-green-500 flex items-center justify-center text-sm font-bold font-mono text-green-400 shadow-md shadow-green-500/20 z-10"
                          style={{ left: node.x, top: node.y + 16 }}
                        >
                          {String(node.val)}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ) : flatLinkedList.length > 0 ? (
               <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                    Linked List Structure ({primaryLinkedListKey})
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    nodes: {flatLinkedList.length}
                  </span>
                </div>

                <div className="flex gap-2 items-center py-4 min-h-[120px] overflow-x-auto max-w-full px-4">
                  <AnimatePresence mode="popLayout">
                    {flatLinkedList.map((node, idx) => (
                        <motion.div
                          key={`ll-node-${idx}`}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center flex-shrink-0"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full border-2 bg-gray-800 border-blue-500/50 flex items-center justify-center text-lg font-bold font-mono text-blue-300 shadow-md shadow-blue-500/20">
                              {String(getNodeValue(node))}
                            </div>
                          </div>
                          
                          {idx < flatLinkedList.length - 1 && (
                            <div className="mx-2 text-gray-600 font-bold">
                              ➔
                            </div>
                          )}
                          
                          {idx === flatLinkedList.length - 1 && (
                            <>
                              <div className="mx-2 text-gray-600 font-bold">➔</div>
                              <div className="text-xs font-mono text-gray-500 font-bold italic">None</div>
                            </>
                          )}
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : Array.isArray(primaryArray) && primaryArray.length > 0 ? (
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                    Array Structure ({primaryArrayKey})
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    length: {primaryArray.length}
                  </span>
                </div>

                <div className="flex gap-4 items-end py-4 min-h-[120px] overflow-x-auto max-w-full">
                  <AnimatePresence mode="popLayout">
                    {primaryArray.map((val, idx) => {
                      const pointingKeys = activePointers.filter(
                        (pKey) => variables[pKey] === idx
                      );

                      return (
                        <motion.div
                          key={`array-node-${idx}-${val}`}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex flex-col items-center flex-shrink-0"
                        >
                          <div className="h-7 flex flex-col items-center justify-end mb-1">
                            {pointingKeys.length > 0 && (
                              <motion.div 
                                initial={{ y: -4 }}
                                animate={{ y: 0 }}
                                className="flex flex-col items-center animate-bounce"
                              >
                                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-purple-500 text-white shadow">
                                  {pointingKeys.join(", ")}
                                </span>
                                <span className="text-purple-400 text-xs">⬇️</span>
                              </motion.div>
                            )}
                          </div>

                          <div 
                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold font-mono transition-all duration-200 shadow-md ${
                              pointingKeys.length > 0
                                ? "bg-purple-900/80 border-purple-400 text-white shadow-purple-500/30 scale-105"
                                : "bg-gray-800 border-gray-700 text-purple-300"
                            }`}
                          >
                            {String(val)}
                          </div>

                          <span className="mt-1 text-[10px] font-mono text-gray-500">
                            [{idx}]
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-4 text-center text-gray-500 font-mono text-xs">
                No active list or tree structure currently in scope.
              </div>
            )}

            {/* SECTION 2: Live Variable State Grid */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md">
              <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-3 border-b border-gray-800 pb-2 flex justify-between">
                <span>Variable Inspector</span>
                <span>{variableEntries.length} Active</span>
              </div>

              {variableEntries.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {variableEntries.map(([varName, varVal]) => {
                    const isList = Array.isArray(varVal);
                    // Updated to detect both Tree nodes and Linked List nodes
                    const isNode = typeof varVal === 'object' && varVal !== null && (('val' in varVal || 'data' in varVal || 'value' in varVal) || 'head' in varVal || 'root' in varVal);
                    const isPrimary = varName === primaryArrayKey || varName === primaryLinkedListKey || varName === primaryTreeKey;

                    return (
                      <div 
                        key={varName}
                        className={`p-2.5 rounded-lg border font-mono transition-all ${
                          isPrimary
                            ? "bg-purple-950/30 border-purple-800/60"
                            : "bg-gray-950/60 border-gray-800"
                        }`}
                      >
                        <div className="text-[10px] text-gray-400 flex justify-between items-center mb-0.5">
                          <span className="font-bold text-purple-300">{varName}</span>
                          <span className="text-[9px] text-gray-500 uppercase">
                            {isList ? `list[${varVal.length}]` : isNode ? "Node / Structure" : typeof varVal}
                          </span>
                        </div>
                        
                        <div className="text-xs font-semibold text-white truncate">
                          {isList ? JSON.stringify(varVal) : isNode ? "{...}" : String(varVal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 font-mono text-xs text-center py-4">
                  Run steps to inspect variables in real time.
                </div>
              )}
            </div>

            {/* SECTION 3: Terminal Console */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-inner flex flex-col min-h-[120px]">
              <div className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider mb-2 border-b border-gray-800/80 pb-1.5 flex justify-between items-center">
                <span>📟 Terminal Output (Standard Print)</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>

              <div className="flex-1 font-mono text-xs text-green-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[140px]">
                {consoleOutput ? (
                  consoleOutput
                ) : (
                  <span className="text-gray-600 italic">&gt; Output stream empty...</span>
                )}
              </div>
            </div>

          </div>

          <footer className="h-16 border-t bg-gray-900 border-gray-800 flex items-center justify-center gap-4 px-6 shadow-inner">
            <button 
              onClick={handleFirstStep}
              disabled={steps.length === 0 || currentStepIndex === 0}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-lg transition-colors"
              title="First Step"
            >
              ⏮️
            </button>
            <button 
              onClick={handlePrevStep}
              disabled={steps.length === 0 || currentStepIndex === 0}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-lg transition-colors"
              title="Previous Step"
            >
              ⏪
            </button>
            
            <div className="font-mono text-xs font-semibold text-gray-400 min-w-[130px] text-center tracking-wide">
              {steps.length > 0 
                ? `STEP ${currentStepIndex + 1} / ${steps.length}`
                : "STEP 0 / 0"
              }
            </div>
            
            <button 
              onClick={handleNextStep}
              disabled={steps.length === 0 || currentStepIndex === steps.length - 1}
              className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-md text-lg shadow-md transition-colors"
              title="Next Step"
            >
              ⏩
            </button>
            <button 
              onClick={handleLastStep}
              disabled={steps.length === 0 || currentStepIndex === steps.length - 1}
              className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-md text-lg shadow-md transition-colors"
              title="Last Step"
            >
              ⏭️
            </button>
          </footer>
        </div>

      </main>
    </div>
  );
}