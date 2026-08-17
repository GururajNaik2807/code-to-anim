import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer({ 
  steps, 
  currentStepIndex, 
  isEditorMinimized, 
  setIsEditorMinimized, 
  errorMessage, 
  activeLineNumber, 
  isEditing, 
  user, 
  handleFirstStep, 
  handlePrevStep, 
  handleNextStep, 
  handleLastStep 
}) {
  
  const currentStep = steps[currentStepIndex];
  const variables = currentStep?.variables || {};
  const consoleOutput = currentStep?.output ?? "";

  // FILTERED VARIABLES
  const IGNORED_KEYS = new Set(['file', 'sep', 'end', 'flush', 'args', 'func']);
  const cleanVariables = Object.fromEntries(
    Object.entries(variables).filter(([key, val]) => {
      if (IGNORED_KEYS.has(key)) return false;
      if (typeof val === 'string' && (val.includes('built-in function') || val.includes('_io.'))) return false;
      return true;
    })
  );

  // --- ARRAY & STRING PARSING ---
  const primaryArrayKey = Object.keys(cleanVariables).find((key) => {
    const val = cleanVariables[key];
    if (!val || val.length === 0 || key === 'found_indices') return false;
    if (Array.isArray(val)) return true;
    if (typeof val === 'string') {
      if (
        val.startsWith("<class") || 
        val.startsWith("<module") || 
        val.startsWith("<function") || 
        val.startsWith("<built-in") ||
        val.startsWith("<method") ||
        (val.startsWith("<") && val.includes("object at 0x"))
      ) return false; 
      return true;
    }
    return false;
  });

  const rawData = primaryArrayKey ? cleanVariables[primaryArrayKey] : null;
  const primaryArray = typeof rawData === 'string' ? rawData.split('') : rawData;
  const arrayLength = Array.isArray(primaryArray) ? primaryArray.length : 0;
  
  const activePointers = Object.keys(cleanVariables).filter(
    (key) => typeof cleanVariables[key] === 'number' && cleanVariables[key] >= 0 && cleanVariables[key] < arrayLength
  );

  // --- LINKED LIST PARSING ---
  const getNodeValue = (node) => node.val !== undefined ? node.val : node.data !== undefined ? node.data : node.value !== undefined ? node.value : '?';

  const findLinkedList = (vars) => {
    for (const [key, obj] of Object.entries(vars)) {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
      if ('next' in obj) return { key, head: obj };
      if ('head' in obj && obj.head && typeof obj.head === 'object' && 'next' in obj.head) return { key: `${key}.head`, head: obj.head };
    }
    return { key: null, head: null };
  };

  const { key: primaryLinkedListKey, head: primaryLinkedListHead } = findLinkedList(cleanVariables);

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
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
      if ('left' in obj || 'right' in obj) return { key, root: obj };
      if ('root' in obj && obj.root && typeof obj.root === 'object' && ('left' in obj.root || 'right' in obj.root)) return { key: `${key}.root`, root: obj.root };
    }
    return { key: null, root: null };
  };

  const { key: primaryTreeKey, root: primaryTreeRoot } = findBinaryTree(cleanVariables);

  const getTreeLayout = (rootNode) => {
    const nodes = [];
    const edges = [];
    if (!rootNode) return { nodes, edges };

    const traverse = (node, x, y, horizontalSpacing, pathId) => {
      if (!node || typeof node !== 'object') return;
      nodes.push({ val: getNodeValue(node), x, y, id: pathId });

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

  // --- DICTIONARY / HASH MAP PARSING ---
  const findDictionary = (vars) => {
    return Object.keys(vars).find(key => {
      const val = vars[key];
      if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
      const isNode = ('val' in val || 'data' in val || 'value' in val) || 'head' in val || 'root' in val || 'left' in val || 'right' in val || 'next' in val;
      return !isNode;
    }) || null;
  };

  const primaryDictKey = findDictionary(cleanVariables);
  const primaryDict = primaryDictKey ? cleanVariables[primaryDictKey] : null;
  const dictEntries = primaryDict ? Object.entries(primaryDict) : [];

  const variableEntries = Object.entries(cleanVariables);
  const standardVariableEntries = variableEntries.filter(([_, val]) => {
    if (typeof val === 'string') {
      return !(val.startsWith("<class") || val.startsWith("<function") || val.startsWith("<method") || val.startsWith("<module"));
    }
    return true;
  });

  return (
    <div 
      className={`h-full flex flex-col bg-gray-900/40 transition-all duration-300 ease-in-out ${
        isEditorMinimized ? "w-full" : "w-1/2"
      }`}
    >
      <div className="px-4 py-2 border-b bg-gray-900 border-gray-800 text-xs font-mono font-semibold text-gray-400 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditorMinimized(!isEditorMinimized)}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-purple-300 rounded border border-gray-700 transition-colors flex items-center gap-2"
            title={isEditorMinimized ? "Expand Editor" : "Minimize Editor"}
          >
            {isEditorMinimized ? "▶ Show Editor" : "◀ Hide Editor"}
          </button>
          <span>VISUAL CANVAS & STATE INSPECTOR</span>
        </div>
        {activeLineNumber && (!isEditing || !user) && (
          <span className="text-xs text-purple-400 font-mono bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded">
            Line {activeLineNumber}
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col p-6 overflow-auto gap-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {errorMessage && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 text-red-300 rounded-lg text-sm font-mono shadow-lg">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* SECTION 1: Visualizers */}
        {treeLayout.nodes.length > 0 ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider">
                Binary Tree ({primaryTreeKey})
              </span>
              <span className="text-xs font-mono text-gray-500">nodes: {treeLayout.nodes.length}</span>
            </div>
            <div className="relative w-full min-h-[220px] overflow-auto flex justify-center bg-gray-950/50 rounded-lg border border-gray-800/50">
              <div className="relative w-[500px] h-[220px]">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {treeLayout.edges.map((edge, idx) => (
                    <line key={`edge-${idx}`} x1={edge.x1} y1={edge.y1 + 16} x2={edge.x2} y2={edge.y2 + 16} stroke="#374151" strokeWidth="2" />
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
              <span className="text-xs font-mono text-gray-500">nodes: {flatLinkedList.length}</span>
            </div>
            <div className="flex gap-2 items-center py-4 min-h-[120px] overflow-x-auto max-w-full px-4 scrollbar-thin scrollbar-thumb-gray-800">
              <AnimatePresence mode="popLayout">
                {flatLinkedList.map((node, idx) => (
                    <motion.div key={`ll-node-${idx}`} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border-2 bg-gray-800 border-blue-500/50 flex items-center justify-center text-lg font-bold font-mono text-blue-300 shadow-md shadow-blue-500/20">
                          {String(getNodeValue(node))}
                        </div>
                      </div>
                      {idx < flatLinkedList.length - 1 && <div className="mx-2 text-gray-600 font-bold">➔</div>}
                      {idx === flatLinkedList.length - 1 && (
                        <><div className="mx-2 text-gray-600 font-bold">➔</div><div className="text-xs font-mono text-gray-500 font-bold italic">None</div></>
                      )}
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : primaryDictKey ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">Dictionary ({primaryDictKey})</span>
              <span className="text-xs font-mono text-gray-500">keys: {dictEntries.length}</span>
            </div>
            <div className="w-full max-w-md flex flex-col gap-1.5 py-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
              {dictEntries.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {dictEntries.map(([dKey, dVal]) => (
                    <motion.div key={`dict-${dKey}`} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center bg-gray-950 border border-gray-800 rounded-md p-2.5 shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-mono text-xs text-gray-500">Key:</span>
                        <span className="font-mono text-sm text-yellow-300 font-bold truncate">{dKey}</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-mono text-xs text-gray-500">Val:</span>
                        <span className="font-mono text-sm text-gray-200 truncate">{typeof dVal === 'object' ? JSON.stringify(dVal) : String(dVal)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center text-xs font-mono text-gray-600 italic py-4">Dictionary is empty</div>
              )}
            </div>
          </div>
        ) : Array.isArray(primaryArray) && primaryArray.length > 0 ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                {typeof rawData === 'string' ? 'String' : 'Array'} Structure ({primaryArrayKey})
              </span>
              <span className="text-xs font-mono text-gray-500">length: {primaryArray.length}</span>
            </div>
            <div className="flex gap-4 items-end py-4 min-h-[120px] overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-800">
              <AnimatePresence mode="popLayout">
                {primaryArray.map((val, idx) => {
                  const pointingKeys = activePointers.filter((pKey) => cleanVariables[pKey] === idx);
                  return (
                    <motion.div key={`array-node-${idx}-${val}`} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center flex-shrink-0">
                      <div className="h-7 flex flex-col items-center justify-end mb-1">
                        {pointingKeys.length > 0 && (
                          <motion.div initial={{ y: -4 }} animate={{ y: 0 }} className="flex flex-col items-center animate-bounce">
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-purple-500 text-white shadow">{pointingKeys.join(", ")}</span>
                            <span className="text-purple-400 text-xs">⬇️</span>
                          </motion.div>
                        )}
                      </div>
                      <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold font-mono transition-all duration-200 shadow-md ${pointingKeys.length > 0 ? "bg-purple-900/80 border-purple-400 text-white shadow-purple-500/30 scale-105" : "bg-gray-800 border-gray-700 text-purple-300"}`}>
                        {String(val)}
                      </div>
                      <span className="mt-1 text-[10px] font-mono text-gray-500">[{idx}]</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-4 text-center text-gray-500 font-mono text-xs">
            No active list, tree, or dict structure currently in scope.
          </div>
        )}

        {/* SECTION 2: Variable State Inspector */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 shadow-md">
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-3 border-b border-gray-800 pb-2 flex justify-between">
            <span>Variable Inspector</span>
            <span>{standardVariableEntries.length} Active</span>
          </div>
          {standardVariableEntries.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {standardVariableEntries.map(([varName, varVal]) => {
                const isList = Array.isArray(varVal);
                const isNode = typeof varVal === 'object' && varVal !== null && !isList && (('val' in varVal || 'data' in varVal || 'value' in varVal) || 'head' in varVal || 'root' in varVal);
                const isDict = typeof varVal === 'object' && varVal !== null && !isList && !isNode;
                const isPrimary = varName === primaryArrayKey || varName === primaryLinkedListKey || varName === primaryTreeKey || varName === primaryDictKey;
                return (
                  <div key={varName} className={`p-2.5 rounded-lg border font-mono transition-all ${isPrimary ? "bg-purple-950/30 border-purple-800/60" : "bg-gray-950/60 border-gray-800"}`}>
                    <div className="text-[10px] text-gray-400 flex justify-between items-center mb-0.5">
                      <span className="font-bold text-purple-300">{varName}</span>
                      <span className="text-[9px] text-gray-500 uppercase">{isList ? `list[${varVal.length}]` : isNode ? "Node" : isDict ? "Dict" : typeof varVal}</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{isList || isDict ? JSON.stringify(varVal) : isNode ? "{...}" : String(varVal)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 font-mono text-xs text-center py-4">Run steps to inspect variables in real time.</div>
          )}
        </div>

        {/* SECTION 3: Terminal Console */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-inner flex flex-col min-h-[120px]">
          <div className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider mb-2 border-b border-gray-800/80 pb-1.5 flex justify-between items-center">
            <span>📟 Terminal Output (Standard Print)</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <div className="flex-1 font-mono text-xs text-green-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[140px] scrollbar-thin scrollbar-thumb-gray-800">
            {consoleOutput ? consoleOutput : <span className="text-gray-600 italic">&gt; Output stream empty...</span>}
          </div>
        </div>
      </div>

      <footer className="h-16 border-t bg-gray-900 border-gray-800 flex items-center justify-center gap-4 px-6 shadow-inner">
        <button onClick={handleFirstStep} disabled={steps.length === 0 || currentStepIndex === 0} className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-lg transition-colors">⏮️</button>
        <button onClick={handlePrevStep} disabled={steps.length === 0 || currentStepIndex === 0} className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-md text-lg transition-colors">⏪</button>
        <div className="font-mono text-xs font-semibold text-gray-400 min-w-[130px] text-center tracking-wide">{steps.length > 0 ? `STEP ${currentStepIndex + 1} / ${steps.length}` : "STEP 0 / 0"}</div>
        <button onClick={handleNextStep} disabled={steps.length === 0 || currentStepIndex === steps.length - 1} className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-md text-lg shadow-md transition-colors">⏩</button>
        <button onClick={handleLastStep} disabled={steps.length === 0 || currentStepIndex === steps.length - 1} className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-md text-lg shadow-md transition-colors">⏭️</button>
      </footer>
    </div>
  );
}