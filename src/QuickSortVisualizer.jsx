import React, { useState, useEffect, useRef } from 'react';

const QuickSortVisualizer = () => {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [originalArray, setOriginalArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [inputValue, setInputValue] = useState('64, 34, 25, 12, 22, 11, 90');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [steps, setSteps] = useState([]);
  const [stepCounter, setStepCounter] = useState(0);
  const [highlightedBars, setHighlightedBars] = useState({});
  
  const timeoutRef = useRef(null);
  const animationSpeed = 1100 - (speed * 100);

  const complexityData = [
    { label: 'Best Case', value: 'O(n log n)' },
    { label: 'Average Case', value: 'O(n log n)' },
    { label: 'Worst Case', value: 'O(n²)' },
    { label: 'Space Complexity', value: 'O(log n)' }
  ];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setArrayFromInput = () => {
    const numbers = inputValue
      .split(',')
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num));
    
    if (numbers.length === 0) {
      alert('Please enter valid numbers');
      return;
    }
    
    setArray([...numbers]);
    setOriginalArray([...numbers]);
    clearSteps();
    setHighlightedBars({});
  };

  const generateRandomArray = () => {
    const size = Math.floor(Math.random() * 8) + 5;
    const randomArray = [];
    for (let i = 0; i < size; i++) {
      randomArray.push(Math.floor(Math.random() * 100) + 1);
    }
    const arrayString = randomArray.join(', ');
    setInputValue(arrayString);
    setArray([...randomArray]);
    setOriginalArray([...randomArray]);
    clearSteps();
    setHighlightedBars({});
  };

  const addStep = (description, type = 'normal') => {
    setSteps(prev => [...prev, { 
      id: stepCounter + 1, 
      text: `Step ${stepCounter + 1}: ${description}`, 
      type 
    }]);
    setStepCounter(prev => prev + 1);
  };

  const clearSteps = () => {
    setSteps([]);
    setStepCounter(0);
  };

  const highlightBars = (indices, className) => {
    const newHighlights = {};
    indices.forEach(index => {
      newHighlights[index] = className;
    });
    setHighlightedBars(newHighlights);
  };

  const sleep = (ms) => {
    return new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  };

  const quickSort = async (arr, low = 0, high = arr.length - 1, depth = 0) => {
    if (low < high && isRunning) {
      addStep(`Sorting subarray from index ${low} to ${high}`, 'current');
      
      const pi = await partition(arr, low, high);
      
      if (isRunning) {
        addStep(`Pivot ${arr[pi]} is in correct position at index ${pi}`);
        
        await quickSort(arr, low, pi - 1, depth + 1);
        await quickSort(arr, pi + 1, high, depth + 1);
      }
    }
    
    if (depth === 0 && isRunning) {
      const sortedIndices = Array.from({length: arr.length}, (_, i) => i);
      highlightBars(sortedIndices, 'sorted');
      addStep('Array is completely sorted!');
      setIsRunning(false);
    }
  };

  const partition = async (arr, low, high) => {
    const pivot = arr[high];
    addStep(`Choosing pivot: ${pivot} (last element)`);
    highlightBars([high], 'pivot');
    await sleep(animationSpeed);
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (!isRunning) break;
      
      addStep(`Comparing ${arr[j]} with pivot ${pivot}`);
      highlightBars([j, high], 'comparing');
      await sleep(animationSpeed);
      
      if (arr[j] < pivot) {
        i++;
        addStep(`${arr[j]} < ${pivot}, swapping with element at index ${i}`);
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        highlightBars([i, j, high], 'comparing');
        await sleep(animationSpeed);
      }
    }
    
    addStep(`Placing pivot ${pivot} in correct position`);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    highlightBars([i + 1], 'pivot');
    await sleep(animationSpeed);
    
    return i + 1;
  };

  const startSort = async () => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }
    
    setIsRunning(true);
    setIsPaused(false);
    clearSteps();
    setHighlightedBars({});
    
    addStep('Starting QuickSort algorithm');
    await quickSort([...array]);
  };

  const pauseSort = () => {
    if (isRunning) {
      setIsPaused(true);
      setIsRunning(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      addStep('Algorithm paused');
    }
  };

  const resetSort = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setArray([...originalArray]);
    clearSteps();
    setHighlightedBars({});
    addStep('Array reset to original state');
  };

  const getBarClassName = (index) => {
    const baseClass = 'bar';
    const highlightClass = highlightedBars[index];
    return highlightClass ? `${baseClass} ${highlightClass}` : baseClass;
  };

  const maxValue = Math.max(...array);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 p-5">
      <style jsx>{`
        .bar {
          background: linear-gradient(to top, #4299e1, #63b3ed);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          padding-bottom: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .bar.pivot {
          background: linear-gradient(to top, #f56565, #fc8181);
          transform: scale(1.1);
        }

        .bar.comparing {
          background: linear-gradient(to top, #ed8936, #f6ad55);
          transform: scale(1.05);
        }

        .bar.sorted {
          background: linear-gradient(to top, #48bb78, #68d391);
        }

        .step {
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-700 mb-8 text-shadow">
          🚀 QuickSort Algorithm Visualizer
        </h1>
        
        {/* Algorithm Complexity Info */}
        <div className="bg-gray-100 p-6 rounded-2xl mb-8 border-2 border-gray-200">
          <h3 className="text-xl font-semibold text-center mb-4 text-gray-700">Algorithm Complexity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {complexityData.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm text-center">
                <h4 className="text-gray-600 mb-1 font-medium">{item.label}</h4>
                <span className="text-blue-600 font-bold text-lg">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border-2 border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter numbers separated by commas (e.g., 64, 34, 25, 12, 22, 11, 90)"
              className="flex-1 min-w-64 px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isRunning}
            />
            <button
              onClick={setArrayFromInput}
              disabled={isRunning}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              Set Array
            </button>
            <button
              onClick={generateRandomArray}
              disabled={isRunning}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              Random Array
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={startSort}
            disabled={isRunning}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPaused ? 'Resume' : 'Start QuickSort'}
          </button>
          <button
            onClick={pauseSort}
            disabled={!isRunning}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            Pause
          </button>
          <button
            onClick={resetSort}
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-xl font-bold uppercase tracking-wider hover:transform hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            Reset
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <label className="font-semibold text-gray-700">Speed:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-semibold text-gray-700 min-w-6 text-center">{speed}</span>
        </div>

        {/* Visualization */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-inner min-h-96">
          <div className="flex items-end justify-center h-80 gap-1 mb-6">
            {array.map((value, index) => {
              const barWidth = Math.max(20, Math.min(60, (600 - (array.length * 2)) / array.length));
              const barHeight = (value / maxValue) * 250;
              
              return (
                <div
                  key={`${index}-${value}`}
                  className={getBarClassName(index)}
                  style={{
                    width: `${barWidth}px`,
                    height: `${barHeight}px`,
                    minHeight: '30px'
                  }}
                >
                  {value}
                </div>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-2xl font-semibold text-center mb-6 text-gray-700">Algorithm Steps</h3>
          <div className="max-h-64 overflow-y-auto">
            {steps.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No steps yet. Click "Start QuickSort" to begin!
              </div>
            ) : (
              steps.map((step) => (
                <div
                  key={step.id}
                  className={`step bg-white p-4 mb-3 rounded-xl border-l-4 shadow-sm ${
                    step.type === 'current' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-blue-300'
                  }`}
                >
                  {step.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSortVisualizer;