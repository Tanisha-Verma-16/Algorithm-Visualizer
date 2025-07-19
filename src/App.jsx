import React, { useState } from 'react';
import { Search, Play, Code, GitBranch, Route, Shuffle, Zap } from 'lucide-react';
import KMPVisualizer from './KMPVisualizer';
import BinarySearchVisualizer from './BinarySearchVisualizer';
import DijkstraVisualizer from './DijkastraVisualizer';
import PathfindingVisualizer from './PathFindingVisualizer';
import QuickSortVisualizer from './QuickSortVisualizer';
import MergeSortVisualizer from './MergeSortVisualizer';

// import React, { useState } from 'react';
// import { Search, Play, Code, GitBranch, Route, Shuffle, Zap } from 'lucide-react';



const AlgorithmVisualizer = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('binary-search');

  const algorithms = [
    {
      id: 'binary-search',
      name: 'Binary Search',
      category: 'Search',
      icon: <Search className="w-5 h-5" />,
      difficulty: 'Easy',
      timeComplexity: 'O(log n)',
      description: 'Efficiently finds a target value in a sorted array by repeatedly dividing the search interval in half.'
    },
    {
      id: 'kmp',
      name: 'Knuth-Morris-Pratt',
      category: 'String Matching',
      icon: <Code className="w-5 h-5" />,
      difficulty: 'Medium',
      timeComplexity: 'O(n + m)',
      description: 'String-searching algorithm that searches for occurrences of a pattern within a main text string.'
    },
    {
      id: 'bfs-dfs',
      name: 'BFS/DFS',
      category: 'Graph Traversal',
      icon: <GitBranch className="w-5 h-5" />,
      difficulty: 'Medium',
      timeComplexity: 'O(V + E)',
      description: 'Graph traversal algorithms for exploring nodes and edges systematically.'
    },
    {
      id: 'dijkstra',
      name: 'Dijkstra\'s Algorithm',
      category: 'Shortest Path',
      icon: <Route className="w-5 h-5" />,
      difficulty: 'Hard',
      timeComplexity: 'O((V + E) log V)',
      description: 'Finds the shortest paths between nodes in a graph with non-negative edge weights.'
    },
    {
      id: 'merge-sort',
      name: 'Merge Sort',
      category: 'Sorting',
      icon: <Shuffle className="w-5 h-5" />,
      difficulty: 'Medium',
      timeComplexity: 'O(n log n)',
      description: 'Divide-and-conquer sorting algorithm that divides the array into halves and merges them back sorted.'
    },
    {
      id: 'quick-sort',
      name: 'Quick Sort',
      category: 'Sorting',
      icon: <Zap className="w-5 h-5" />,
      difficulty: 'Medium',
      timeComplexity: 'O(n log n) avg',
      description: 'Efficient sorting algorithm using divide-and-conquer with a pivot element.'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderVisualizer = () => {
    switch (selectedAlgorithm) {
      case 'binary-search':
        return <BinarySearchVisualizer />;
      case 'kmp':
        return <KMPVisualizer />;
      case 'bfs-dfs':
        return <PathfindingVisualizer />;
      case 'dijkstra':
        return <DijkstraVisualizer />;
      case 'merge-sort':
        return <MergeSortVisualizer />;
      case 'quick-sort':
        return <QuickSortVisualizer />;
      default:
        return <BinarySearchVisualizer />;
    }
  };

  const selectedAlgorithmData = algorithms.find(algo => algo.id === selectedAlgorithm);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Algorithm Visualizer
            </h1>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Algorithms</h2>
            <div className="space-y-2">
              {algorithms.map((algorithm) => (
                <button
                  key={algorithm.id}
                  onClick={() => setSelectedAlgorithm(algorithm.id)}
                  className={`w-full p-4 rounded-xl transition-all duration-300 text-left group hover:scale-[1.02] ${
                    selectedAlgorithm === algorithm.id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      selectedAlgorithm === algorithm.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    } transition-colors`}>
                      {algorithm.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{algorithm.name}</h3>
                      <p className="text-sm text-gray-500">{algorithm.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(algorithm.difficulty)}`}>
                      {algorithm.difficulty}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {algorithm.timeComplexity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {selectedAlgorithmData && (
              <div className="max-w-6xl mx-auto">
                {/* Algorithm Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                      <div className="text-blue-600">
                        {selectedAlgorithmData.icon}
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {selectedAlgorithmData.name}
                      </h1>
                      <p className="text-gray-500 text-lg mt-1">{selectedAlgorithmData.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-lg border ${getDifficultyColor(selectedAlgorithmData.difficulty)}`}>
                        {selectedAlgorithmData.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Time Complexity:</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-mono text-sm">
                        {selectedAlgorithmData.timeComplexity}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed">
                    {selectedAlgorithmData.description}
                  </p>
                </div>

                {/* Visualization Area */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Visualization</h2>
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg text-white">
                      <Play className="w-5 h-5" />
                      <span>Run</span>
                    </button>
                  </div>
                  
                  {/* Render the appropriate visualizer component */}
                  {renderVisualizer()}
                </div>

                {/* Controls and Information */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Controls</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 transition-colors">
                          Start
                        </button>
                        <button className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 transition-colors">
                          Reset
                        </button>
                        <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-colors">
                          Step
                        </button>
                      </div>
                      <div className="pt-2">
                        <label className="block text-sm text-gray-600 mb-2">Speed</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          defaultValue="50"
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Algorithm Info</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best Case:</span>
                        <span className="font-mono text-green-600">{selectedAlgorithmData.timeComplexity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Case:</span>
                        <span className="font-mono text-orange-600">{selectedAlgorithmData.timeComplexity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Worst Case:</span>
                        <span className="font-mono text-red-600">{selectedAlgorithmData.timeComplexity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Space Complexity:</span>
                        <span className="font-mono text-blue-600">O(1)</span>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;