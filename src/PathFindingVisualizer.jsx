import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, RotateCcw, MousePointer } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 25;

const CELL_TYPES = {
  EMPTY: 'empty',
  WALL: 'wall',
  START: 'start',
  END: 'end',
  VISITED: 'visited',
  PATH: 'path',
  CURRENT: 'current'
};

const MODES = {
  WALL: 'wall',
  START: 'start',
  END: 'end'
};

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [mode, setMode] = useState(MODES.WALL);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ row: 5, col: 5 });
  const [endPos, setEndPos] = useState({ row: 15, col: 15 });
  const [speed, setSpeed] = useState(50);

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        currentRow.push({
          row,
          col,
          type: CELL_TYPES.EMPTY,
          isVisited: false,
          parent: null,
          distance: Infinity,
          f: Infinity,
          g: Infinity,
          h: Infinity
        });
      }
      newGrid.push(currentRow);
    }
    
    // Set start and end positions
    newGrid[startPos.row][startPos.col].type = CELL_TYPES.START;
    newGrid[endPos.row][endPos.col].type = CELL_TYPES.END;
    
    setGrid(newGrid);
  };

  const resetGrid = () => {
    if (isRunning) return;
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          type: cell.type === CELL_TYPES.WALL ? CELL_TYPES.WALL : 
                cell.type === CELL_TYPES.START ? CELL_TYPES.START :
                cell.type === CELL_TYPES.END ? CELL_TYPES.END : CELL_TYPES.EMPTY,
          isVisited: false,
          parent: null,
          distance: Infinity,
          f: Infinity,
          g: Infinity,
          h: Infinity
        }))
      );
      return newGrid;
    });
  };

  const clearWalls = () => {
    if (isRunning) return;
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          type: cell.type === CELL_TYPES.WALL ? CELL_TYPES.EMPTY : cell.type,
          isVisited: false,
          parent: null,
          distance: Infinity
        }))
      );
      return newGrid;
    });
  };

  const getNeighbors = (node, grid) => {
    const neighbors = [];
    const { row, col } = node;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < GRID_SIZE && 
          newCol >= 0 && newCol < GRID_SIZE && 
          grid[newRow][newCol].type !== CELL_TYPES.WALL) {
        neighbors.push(grid[newRow][newCol]);
      }
    }
    
    return neighbors;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const bfs = async (grid, start, end) => {
    const queue = [start];
    const visited = new Set();
    visited.add(`${start.row}-${start.col}`);
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.row === end.row && current.col === end.col) {
        return reconstructPath(current);
      }
      
      // Mark as current
      if (current.type !== CELL_TYPES.START && current.type !== CELL_TYPES.END) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[current.row][current.col] = {
            ...newGrid[current.row][current.col],
            type: CELL_TYPES.CURRENT
          };
          return newGrid;
        });
        
        await sleep(101 - speed);
        
        // Mark as visited
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[current.row][current.col] = {
            ...newGrid[current.row][current.col],
            type: CELL_TYPES.VISITED
          };
          return newGrid;
        });
      }
      
      const neighbors = getNeighbors(current, grid);
      
      for (const neighbor of neighbors) {
        const key = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(key)) {
          visited.add(key);
          neighbor.parent = current;
          queue.push(neighbor);
        }
      }
    }
    
    return null;
  };

  const dfs = async (grid, start, end) => {
    const stack = [start];
    const visited = new Set();
    
    while (stack.length > 0) {
      const current = stack.pop();
      const key = `${current.row}-${current.col}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (current.row === end.row && current.col === end.col) {
        return reconstructPath(current);
      }
      
      // Mark as current
      if (current.type !== CELL_TYPES.START && current.type !== CELL_TYPES.END) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[current.row][current.col] = {
            ...newGrid[current.row][current.col],
            type: CELL_TYPES.CURRENT
          };
          return newGrid;
        });
        
        await sleep(101 - speed);
        
        // Mark as visited
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[current.row][current.col] = {
            ...newGrid[current.row][current.col],
            type: CELL_TYPES.VISITED
          };
          return newGrid;
        });
      }
      
      const neighbors = getNeighbors(current, grid);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(neighborKey)) {
          neighbor.parent = current;
          stack.push(neighbor);
        }
      }
    }
    
    return null;
  };

  const reconstructPath = (endNode) => {
    const path = [];
    let current = endNode;
    
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    
    return path;
  };

  const animatePath = async (path) => {
    for (let i = 1; i < path.length - 1; i++) {
      const node = path[i];
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[node.row][node.col] = {
          ...newGrid[node.row][node.col],
          type: CELL_TYPES.PATH
        };
        return newGrid;
      });
      await sleep(50);
    }
  };

  const runAlgorithm = async () => {
    if (isRunning) return;
    
    resetGrid();
    setIsRunning(true);
    
    await sleep(100);
    
    const startNode = grid[startPos.row][startPos.col];
    const endNode = grid[endPos.row][endPos.col];
    
    let path = null;
    
    if (algorithm === 'bfs') {
      path = await bfs(grid, startNode, endNode);
    } else if (algorithm === 'dfs') {
      path = await dfs(grid, startNode, endNode);
    }
    
    if (path) {
      await animatePath(path);
    }
    
    setIsRunning(false);
  };

  const handleCellClick = (row, col) => {
    if (isRunning) return;
    
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      const cell = newGrid[row][col];
      
      if (mode === MODES.START) {
        // Clear previous start
        newGrid[startPos.row][startPos.col].type = CELL_TYPES.EMPTY;
        // Set new start
        cell.type = CELL_TYPES.START;
        setStartPos({ row, col });
      } else if (mode === MODES.END) {
        // Clear previous end
        newGrid[endPos.row][endPos.col].type = CELL_TYPES.EMPTY;
        // Set new end
        cell.type = CELL_TYPES.END;
        setEndPos({ row, col });
      } else if (mode === MODES.WALL) {
        if (cell.type === CELL_TYPES.START || cell.type === CELL_TYPES.END) return prevGrid;
        cell.type = cell.type === CELL_TYPES.WALL ? CELL_TYPES.EMPTY : CELL_TYPES.WALL;
      }
      
      return newGrid;
    });
  };

  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    setIsDrawing(true);
    handleCellClick(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isRunning || !isDrawing || mode !== MODES.WALL) return;
    
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      const cell = newGrid[row][col];
      
      if (cell.type === CELL_TYPES.START || cell.type === CELL_TYPES.END) return prevGrid;
      cell.type = CELL_TYPES.WALL;
      
      return newGrid;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const getCellClassName = (cell) => {
    const baseClass = 'w-6 h-6 border border-gray-300 cursor-pointer transition-colors duration-200';
    
    switch (cell.type) {
      case CELL_TYPES.START:
        return `${baseClass} bg-green-500`;
      case CELL_TYPES.END:
        return `${baseClass} bg-red-500`;
      case CELL_TYPES.WALL:
        return `${baseClass} bg-gray-800`;
      case CELL_TYPES.VISITED:
        return `${baseClass} bg-blue-200`;
      case CELL_TYPES.CURRENT:
        return `${baseClass} bg-yellow-400`;
      case CELL_TYPES.PATH:
        return `${baseClass} bg-purple-500`;
      default:
        return `${baseClass} bg-white hover:bg-gray-100`;
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Pathfinding Visualizer</h1>
      
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Algorithm:</label>
          <select 
            value={algorithm} 
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isRunning}
            className="px-3 py-1 border rounded-md"
          >
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Mode:</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            disabled={isRunning}
            className="px-3 py-1 border rounded-md"
          >
            <option value={MODES.WALL}>Draw Walls</option>
            <option value={MODES.START}>Move Start</option>
            <option value={MODES.END}>Move End</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Speed:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            disabled={isRunning}
            className="w-20"
          />
          <span className="text-sm">{speed}%</span>
        </div>
        
        <button
          onClick={runAlgorithm}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Start'}
        </button>
        
        <button
          onClick={resetGrid}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        
        <button
          onClick={clearWalls}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
        >
          <Square className="w-4 h-4" />
          Clear Walls
        </button>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 border"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border"></div>
          <span>End</span>
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
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 border"></div>
          <span>Path</span>
        </div>
      </div>
      
      {/* Grid */}
      <div 
        className="grid gap-0 border-2 border-gray-400 bg-white p-2 rounded-lg shadow-lg"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          userSelect: 'none'
        }}
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(cell)}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onMouseUp={handleMouseUp}
            />
          ))
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-600 max-w-2xl text-center">
        <p className="mb-2">
          <strong>Instructions:</strong> Select a mode and click/drag on the grid to interact.
        </p>
        <p>
          <strong>BFS</strong> finds the shortest path by exploring all neighbors at each level.
          <strong> DFS</strong> goes as deep as possible before backtracking.
        </p>
      </div>
    </div>
  );
};

export default PathfindingVisualizer;