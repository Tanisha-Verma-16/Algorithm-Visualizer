import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Search } from 'lucide-react';

const BinarySearchVisualizer = () => {
  const [array, setArray] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
  const [inputArray, setInputArray] = useState('1,3,5,7,9,11,13,15,17,19');
  const [target, setTarget] = useState(7);
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [mid, setMid] = useState(-1);
  const [found, setFound] = useState(false);
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(500);

  const parseArray = () => {
    try {
      const parsed = inputArray.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
      const sorted = [...parsed].sort((a, b) => a - b);
      setArray(sorted);
      reset();
    } catch (error) {
      alert('Please enter valid numbers separated by commas');
    }
  };

  const reset = () => {
    setIsSearching(false);
    setCurrentStep(-1);
    setLeft(-1);
    setRight(-1);
    setMid(-1);
    setFound(false);
    setSteps([]);
  };

  const generateSteps = () => {
    const searchSteps = [];
    let l = 0;
    let r = array.length - 1;
    let stepCount = 0;

    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      searchSteps.push({
        step: stepCount,
        left: l,
        right: r,
        mid: m,
        midValue: array[m],
        comparison: array[m] === target ? 'equal' : array[m] < target ? 'less' : 'greater',
        found: array[m] === target
      });

      if (array[m] === target) {
        break;
      } else if (array[m] < target) {
        l = m + 1;
      } else {
        r = m - 1;
      }
      stepCount++;
    }

    if (searchSteps.length === 0 || !searchSteps[searchSteps.length - 1].found) {
      searchSteps.push({
        step: stepCount,
        left: l,
        right: r,
        mid: -1,
        midValue: null,
        comparison: 'not_found',
        found: false
      });
    }

    return searchSteps;
  };

  const startSearch = () => {
    if (array.length === 0) {
      alert('Please enter an array first');
      return;
    }
    
    reset();
    const searchSteps = generateSteps();
    setSteps(searchSteps);
    setIsSearching(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isSearching && currentStep >= 0 && currentStep < steps.length) {
      const timer = setTimeout(() => {
        const step = steps[currentStep];
        setLeft(step.left);
        setRight(step.right);
        setMid(step.mid);
        setFound(step.found);

        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsSearching(false);
        }
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [isSearching, currentStep, steps, speed]);

  const getElementStyle = (index) => {
    let bgColor = 'bg-blue-100';
    let borderColor = 'border-blue-300';
    let textColor = 'text-blue-800';

    if (index === mid && mid !== -1) {
      bgColor = found ? 'bg-green-200' : 'bg-yellow-200';
      borderColor = found ? 'border-green-400' : 'border-yellow-400';
      textColor = found ? 'text-green-800' : 'text-yellow-800';
    } else if (index >= left && index <= right && left !== -1 && right !== -1) {
      bgColor = 'bg-blue-200';
      borderColor = 'border-blue-400';
      textColor = 'text-blue-900';
    } else if (left !== -1 && right !== -1) {
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-300';
      textColor = 'text-gray-500';
    }

    return `${bgColor} ${borderColor} ${textColor}`;
  };

  const getCurrentStepInfo = () => {
    if (currentStep <= 0 || steps.length === 0) return null;
    
    const step = steps[currentStep - 1];
    if (step.comparison === 'not_found') {
      return `Target ${target} not found in array`;
    }
    
    return (
      <div className="text-sm">
        <div>Step {step.step + 1}: Checking middle element at index {step.mid}</div>
        <div>array[{step.mid}] = {step.midValue}, target = {target}</div>
        <div className="mt-1">
          {step.comparison === 'equal' && <span className="text-green-600">Found! array[{step.mid}] === {target}</span>}
          {step.comparison === 'less' && <span className="text-blue-600">array[{step.mid}] &lt; {target}, search right half</span>}
          {step.comparison === 'greater' && <span className="text-red-600">array[{step.mid}] &gt; {target}, search left half</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Binary Search Visualizer</h1>
        <p className="text-center text-gray-600">Enter a sorted array and search for values with step-by-step visualization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Array (comma-separated numbers)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1,3,5,7,9,11,13,15,17,19"
              />
              <button
                onClick={parseArray}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Set Array
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Array will be automatically sorted</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Value
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation Speed
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Fast</span>
              <span>{speed}ms</span>
              <span>Slow</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startSearch}
              disabled={isSearching}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Search className="w-4 h-4" />
              Start Search
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Array Visualization</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {array.map((value, index) => (
            <div
              key={index}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-semibold transition-all duration-300 ${getElementStyle(index)}`}
            >
              {value}
            </div>
          ))}
        </div>
        
        {array.length > 0 && (
          <div className="flex justify-center mt-4 text-sm text-gray-600">
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
                <span>Search Range</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
                <span>Current Middle</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                <span>Found</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Excluded</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {getCurrentStepInfo() && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Current Step</h3>
          <div className="bg-gray-50 p-4 rounded-lg border">
            {getCurrentStepInfo()}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Search Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">Left Pointer</div>
            <div className="text-xl font-bold text-blue-800">{left >= 0 ? left : '-'}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-600">Right Pointer</div>
            <div className="text-xl font-bold text-red-800">{right >= 0 ? right : '-'}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-yellow-600">Middle Index</div>
            <div className="text-xl font-bold text-yellow-800">{mid >= 0 ? mid : '-'}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Status</div>
            <div className="text-xl font-bold text-green-800">
              {found ? 'Found!' : isSearching ? 'Searching...' : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">How Binary Search Works</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>1. Binary search only works on sorted arrays</p>
          <p>2. Compare the target with the middle element</p>
          <p>3. If equal, we found it! If target is smaller, search left half. If larger, search right half.</p>
          <p>4. Repeat until found or search space is exhausted</p>
          <p>5. Time complexity: O(log n) - much faster than linear search!</p>
        </div>
      </div>
    </div>
  );
};

export default BinarySearchVisualizer;