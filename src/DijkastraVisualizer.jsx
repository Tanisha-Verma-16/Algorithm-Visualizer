import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const GRID_ROWS = 20;
const GRID_COLS = 40;
const CELL_SIZE = 20;

const CELL_TYPES = {
  EMPTY: 'empty',
  START: 'start',
  END: 'end',
  WALL: 'wall',
  VISITED: 'visited',
  PATH: 'path',
  CURRENT: 'current'
};

const MODES = {
  SET_START: 'start',
  SET_END: 'end',
  SET_WALL: 'wall',
  ERASE: 'erase'
};

const DijkstraVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [startNode, setStartNode] = useState({ row: 5, col: 5 });
  const [endNode, setEndNode] = useState({ row: 15, col: 35 });
  const [mode, setMode] = useState(MODES.SET_WALL);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  const animationRef = useRef(null);
  const visitedNodesRef = useRef([]);
  const shortestPathRef = useRef([]);
  const currentStepRef = useRef(0);
  const isAnimatingPathRef = useRef(false);

  // Initialize grid
  const initializeGrid = () => {
    const newGrid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID_COLS; col++) {
        currentRow.push({
          row,
          col,
          type: CELL_TYPES.EMPTY,
          distance: Infinity,
          previousNode: null,
          isVisited: false
        });
      }
      newGrid.push(currentRow);
    }
    
    // Set start and end nodes
    newGrid[startNode.row][startNode.col].type = CELL_TYPES.START;
    newGrid[endNode.row][endNode.col].type = CELL_TYPES.END;
    
    return newGrid;
  };

  useEffect(() => {
    setGrid(initializeGrid());
  }, [startNode.row, startNode.col, endNode.row, endNode.col]);

  // Get cell class based on type
  const getCellClass = (cell) => {
    const baseClass = 'w-5 h-5 border border-gray-300 cursor-pointer transition-colors duration-200';
    
    switch (cell.type) {
      case CELL_TYPES.START:
        return `${baseClass} bg-green-500`;
      case CELL_TYPES.END:
        return `${baseClass} bg-red-500`;
      case CELL_TYPES.WALL:
        return `${baseClass} bg-gray-800`;
      case CELL_TYPES.VISITED:
        return `${baseClass} bg-blue-200`;
      case CELL_TYPES.PATH:
        return `${baseClass} bg-yellow-400`;
      case CELL_TYPES.CURRENT:
        return `${baseClass} bg-purple-400`;
      default:
        return `${baseClass} bg-white hover:bg-gray-100`;
    }
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (isRunning) return;

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      const cell = newGrid[row][col];

      if (mode === MODES.SET_START && cell.type !== CELL_TYPES.END) {
        // Clear previous start
        newGrid[startNode.row][startNode.col].type = CELL_TYPES.EMPTY;
        cell.type = CELL_TYPES.START;
        setStartNode({ row, col });
      } else if (mode === MODES.SET_END && cell.type !== CELL_TYPES.START) {
        // Clear previous end
        newGrid[endNode.row][endNode.col].type = CELL_TYPES.EMPTY;
        cell.type = CELL_TYPES.END;
        setEndNode({ row, col });
      } else if (mode === MODES.SET_WALL && cell.type === CELL_TYPES.EMPTY) {
        cell.type = CELL_TYPES.WALL;
      } else if (mode === MODES.ERASE && cell.type === CELL_TYPES.WALL) {
        cell.type = CELL_TYPES.EMPTY;
      }

      return newGrid;
    });
  };

  // Handle mouse events for drawing
  const handleMouseDown = (row, col) => {
    setIsMouseDown(true);
    handleCellClick(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isMouseDown && (mode === MODES.SET_WALL || mode === MODES.ERASE)) {
      handleCellClick(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Get neighbors of a node
  const getNeighbors = (node, grid) => {
    const neighbors = [];
    const { row, col } = node;
    
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < GRID_ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < GRID_COLS - 1) neighbors.push(grid[row][col + 1]);
    
    return neighbors.filter(neighbor => neighbor.type !== CELL_TYPES.WALL);
  };

  // Dijkstra's algorithm
  const dijkstra = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    const unvisitedNodes = [];
    
    // Initialize all nodes
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const node = grid[row][col];
        node.distance = Infinity;
        node.previousNode = null;
        node.isVisited = false;
        unvisitedNodes.push(node);
      }
    }
    
    // Set start node distance to 0
    grid[startNode.row][startNode.col].distance = 0;
    
    while (unvisitedNodes.length > 0) {
      // Sort nodes by distance
      unvisitedNodes.sort((a, b) => a.distance - b.distance);
      const closestNode = unvisitedNodes.shift();
      
      // If we encounter a wall, skip it
      if (closestNode.type === CELL_TYPES.WALL) continue;
      
      // If the closest node is at infinity, we're trapped
      if (closestNode.distance === Infinity) return visitedNodesInOrder;
      
      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);
      
      // If we reached the end node, stop
      if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
        return visitedNodesInOrder;
      }
      
      // Update distances of neighbors
      const neighbors = getNeighbors(closestNode, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          const tentativeDistance = closestNode.distance + 1;
          if (tentativeDistance < neighbor.distance) {
            neighbor.distance = tentativeDistance;
            neighbor.previousNode = closestNode;
          }
        }
      }
    }
    
    return visitedNodesInOrder;
  };

  // Get shortest path
  const getShortestPath = (endNode) => {
    const nodesInShortestPathOrder = [];
    let currentNode = endNode;
    
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    
    return nodesInShortestPathOrder;
  };

  // Animation function
  const animate = () => {
    if (isPaused) return;
    
    const currentStep = currentStepRef.current;
    const visitedNodes = visitedNodesRef.current;
    const shortestPath = shortestPathRef.current;
    
    if (!isAnimatingPathRef.current && currentStep < visitedNodes.length) {
      // Animate visited nodes
      const node = visitedNodes[currentStep];
      
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        if (node.type !== CELL_TYPES.START && node.type !== CELL_TYPES.END) {
          newGrid[node.row][node.col].type = CELL_TYPES.VISITED;
        }
        return newGrid;
      });
      
      currentStepRef.current++;
      
      animationRef.current = setTimeout(() => {
        animate();
      }, 101 - speed);
      
    } else if (!isAnimatingPathRef.current && currentStep >= visitedNodes.length) {
      // Start animating shortest path
      isAnimatingPathRef.current = true;
      currentStepRef.current = 0;
      
      animationRef.current = setTimeout(() => {
        animate();
      }, 101 - speed);
      
    } else if (isAnimatingPathRef.current && currentStep < shortestPath.length) {
      // Animate shortest path
      const node = shortestPath[currentStep];
      
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        if (node.type !== CELL_TYPES.START && node.type !== CELL_TYPES.END) {
          newGrid[node.row][node.col].type = CELL_TYPES.PATH;
        }
        return newGrid;
      });
      
      currentStepRef.current++;
      
      animationRef.current = setTimeout(() => {
        animate();
      }, 101 - speed);
      
    } else {
      // Animation complete
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  // Start algorithm
  const startAlgorithm = () => {
    if (isRunning) return;
    
    // Clear previous animation results
    clearVisualElements();
    
    // Create a deep copy of the grid for algorithm
    const gridCopy = grid.map(row => 
      row.map(cell => ({ 
        ...cell, 
        distance: Infinity, 
        previousNode: null, 
        isVisited: false 
      }))
    );
    
    // Run Dijkstra's algorithm
    const visitedNodesInOrder = dijkstra(gridCopy, startNode, endNode);
    const shortestPathNodes = getShortestPath(gridCopy[endNode.row][endNode.col]);
    
    // Store results in refs
    visitedNodesRef.current = visitedNodesInOrder;
    shortestPathRef.current = shortestPathNodes;
    currentStepRef.current = 0;
    isAnimatingPathRef.current = false;
    
    // Start animation
    setIsRunning(true);
    setIsPaused(false);
    
    console.log('Starting algorithm with', visitedNodesInOrder.length, 'visited nodes');
    console.log('Shortest path has', shortestPathNodes.length, 'nodes');
    
    // Start animation
    animate();
  };

  // Pause/Resume
  const togglePause = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
      if (isPaused) {
        // Resume animation
        animate();
      } else {
        // Pause animation
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      }
    }
  };

  // Clear visual elements only
  const clearVisualElements = () => {
    setGrid(prevGrid => 
      prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          type: cell.type === CELL_TYPES.VISITED || cell.type === CELL_TYPES.PATH 
            ? CELL_TYPES.EMPTY 
            : cell.type
        }))
      )
    );
  };

  // Clear grid
  const clearGrid = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    visitedNodesRef.current = [];
    shortestPathRef.current = [];
    currentStepRef.current = 0;
    isAnimatingPathRef.current = false;
    setGrid(initializeGrid());
  };

  // Reset walls only
  const clearWalls = () => {
    if (isRunning) return;
    
    setGrid(prevGrid => 
      prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          type: cell.type === CELL_TYPES.WALL ? CELL_TYPES.EMPTY : cell.type
        }))
      )
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Dijkstra's Algorithm Visualizer
        </h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* Mode Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode(MODES.SET_START)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mode === MODES.SET_START 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isRunning}
              >
                Set Start
              </button>
              <button
                onClick={() => setMode(MODES.SET_END)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mode === MODES.SET_END 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isRunning}
              >
                Set End
              </button>
              <button
                onClick={() => setMode(MODES.SET_WALL)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mode === MODES.SET_WALL 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isRunning}
              >
                Draw Walls
              </button>
              <button
                onClick={() => setMode(MODES.ERASE)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mode === MODES.ERASE 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isRunning}
              >
                Erase
              </button>
            </div>
            
            {/* Algorithm Controls */}
            <div className="flex gap-2">
              <button
                onClick={startAlgorithm}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={16} />
                Start
              </button>
              <button
                onClick={togglePause}
                disabled={!isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={clearGrid}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <RotateCcw size={16} />
                Clear
              </button>
              <button
                onClick={clearWalls}
                disabled={isRunning}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Walls
              </button>
            </div>
            
            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <Settings size={16} />
              <label className="text-sm font-medium">Speed:</label>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-20"
                disabled={isRunning}
              />
              <span className="text-sm w-8">{speed}</span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Legend:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border"></div>
              <span>Start Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border"></div>
              <span>End Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border"></div>
              <span>Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border"></div>
              <span>Shortest Path</span>
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="text-sm text-gray-600">
            Status: {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Ready'} | 
            Visited: {visitedNodesRef.current.length} | 
            Path Length: {shortestPathRef.current.length}
          </div>
        </div>
        
        {/* Grid */}
        <div className="bg-white rounded-lg shadow-md p-4 overflow-auto">
          <div 
            className="grid gap-0 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClass(cell)}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  style={{ userSelect: 'none' }}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-4 mt-6">
          <h3 className="text-lg font-semibold mb-3">Instructions:</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li>1. Select a mode to set start/end points or draw walls</li>
            <li>2. Click and drag to draw walls or use erase mode to remove them</li>
            <li>3. Adjust the speed slider to control animation speed</li>
            <li>4. Click "Start" to begin the Dijkstra's algorithm visualization</li>
            <li>5. Use "Pause/Resume" to control the animation during execution</li>
            <li>6. Click "Clear" to reset everything or "Clear Walls" to remove only walls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DijkstraVisualizer;