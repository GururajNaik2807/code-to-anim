// layoutEngine.js

export const filterVariables = (variables) => {
  return Object.entries(variables || {}).filter(([_, val]) => {
    if (typeof val === 'string') {
      return !(
        val.startsWith("<class") || 
        val.startsWith("<function") || 
        val.startsWith("<method") || 
        val.startsWith("<module")
      );
    }
    return true;
  });
};

export const calculateTreeBounds = (nodes) => {
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  if (nodes && nodes.length > 0) {
    minX = Math.min(...nodes.map(n => n.x || 0));
    maxX = Math.max(...nodes.map(n => n.x || 0));
    minY = Math.min(...nodes.map(n => n.y || 0));
    maxY = Math.max(...nodes.map(n => n.y || 0));
  }
  return {
    treeCenterX: (minX + maxX) / 2,
    treeCenterY: (minY + maxY) / 2
  };
};

export const calculateGraphLayout = (nodes, dimensions) => {
  const nodesCount = nodes?.length || 0;
  // Determine node size based on count
  const nodeSize = nodesCount > 8 ? 32 : nodesCount > 5 ? 40 : 48; 
  const padding = nodeSize + 24; 
  
  // Calculate available space
  const availableWidth = Math.max(120, dimensions.width - padding * 2);
  const availableHeight = Math.max(120, dimensions.height - padding * 2);
  const radius = Math.min(availableWidth, availableHeight) / 2;

  // Position nodes in a circle
  const positionedNodes = nodes?.map((node, idx) => {
    const angle = (idx / nodesCount) * 2 * Math.PI - Math.PI / 2;
    return {
      ...node,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }) || [];

  return { positionedNodes, nodeSize };
};