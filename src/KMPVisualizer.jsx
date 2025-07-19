import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';

const KMPVisualizer = () => {
  const [text, setText] = useState('ABABCABABA');
  const [pattern, setPattern] = useState('ABABA');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState('preprocessing'); // 'preprocessing' or 'matching'
  const [steps, setSteps] = useState([]);
  const [failureFunction, setFailureFunction] = useState([]);

  // Build failure function (LPS array)
  const buildFailureFunction = (pattern) => {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;
    const steps = [];

    steps.push({
      phase: 'preprocessing',
      lps: [...lps],
      i: 0,
      len: 0,
      description: 'Initialize failure function array with zeros'
    });

    while (i < pattern.length) {
      if (pattern[i] === pattern[len]) {
        len++;
        lps[i] = len;
        steps.push({
          phase: 'preprocessing',
          lps: [...lps],
          i: i,
          len: len,
          description: `Match found: pattern[${i}] = pattern[${len-1}], set lps[${i}] = ${len}`
        });
        i++;
      } else {
        if (len !== 0) {
          len = lps[len - 1];
          steps.push({
            phase: 'preprocessing',
            lps: [...lps],
            i: i,
            len: len,
            description: `No match, backtrack: len = lps[${len + lps[len]}] = ${len}`
          });
        } else {
          lps[i] = 0;
          steps.push({
            phase: 'preprocessing',
            lps: [...lps],
            i: i,
            len: len,
            description: `No match and len = 0, set lps[${i}] = 0`
          });
          i++;
        }
      }
    }

    return { lps, steps };
  };

  // KMP search algorithm
  const kmpSearch = (text, pattern, lps) => {
    const steps = [];
    let i = 0; // index for text
    let j = 0; // index for pattern
    const matches = [];

    while (i < text.length) {
      const isMatch = text[i] === pattern[j];
      
      steps.push({
        phase: 'matching',
        textIndex: i,
        patternIndex: j,
        isMatch: isMatch,
        matches: [...matches],
        description: `Compare text[${i}] = '${text[i]}' with pattern[${j}] = '${pattern[j]}'`
      });

      if (isMatch) {
        i++;
        j++;
      }

      if (j === pattern.length) {
        matches.push(i - j);
        steps.push({
          phase: 'matching',
          textIndex: i - 1,
          patternIndex: j - 1,
          isMatch: true,
          matches: [...matches],
          description: `Match found at position ${i - j}!`
        });
        j = lps[j - 1];
      } else if (i < text.length && !isMatch) {
        if (j !== 0) {
          j = lps[j - 1];
          steps.push({
            phase: 'matching',
            textIndex: i,
            patternIndex: j,
            isMatch: false,
            matches: [...matches],
            description: `Mismatch, use failure function: j = lps[${j + lps[j]}] = ${j}`
          });
        } else {
          i++;
        }
      }
    }

    return { steps, matches };
  };

  // Generate all steps when text or pattern changes
  useEffect(() => {
    if (text && pattern) {
      const { lps, steps: preprocessSteps } = buildFailureFunction(pattern);
      setFailureFunction(lps);
      
      const { steps: matchSteps } = kmpSearch(text, pattern, lps);
      
      setSteps([...preprocessSteps, ...matchSteps]);
      setCurrentStep(0);
      setPhase('preprocessing');
    }
  }, [text, pattern]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, speed, steps.length]);

  // Update phase based on current step
  useEffect(() => {
    if (steps[currentStep]) {
      setPhase(steps[currentStep].phase);
    }
  }, [currentStep, steps]);

  const currentStepData = steps[currentStep] || {};

  const renderPreprocessingVisualization = () => {
    if (phase !== 'preprocessing') return null;

    const { lps = [], i = 0, len = 0 } = currentStepData;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-600">Preprocessing Phase: Building Failure Function</h3>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Pattern:</div>
          <div className="flex gap-1 mb-2">
            {pattern.split('').map((char, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-sm ${
                  idx === i ? 'bg-blue-200 border-blue-500' : 
                  idx === len ? 'bg-green-200 border-green-500' : 
                  'bg-gray-50 border-gray-300'
                }`}
              >
                {char}
              </div>
            ))}
          </div>
          <div className="flex gap-1 text-xs text-gray-500">
            {pattern.split('').map((_, idx) => (
              <div key={idx} className="w-8 text-center">{idx}</div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Failure Function (LPS):</div>
          <div className="flex gap-1">
            {lps.map((val, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-sm ${
                  idx === i ? 'bg-yellow-200 border-yellow-500' : 'bg-gray-50 border-gray-300'
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <span className="font-semibold">Current:</span> i = {i}, len = {len}
        </div>
      </div>
    );
  };

  const renderMatchingVisualization = () => {
    if (phase !== 'matching') return null;

    const { textIndex = 0, patternIndex = 0, isMatch = false, matches = [] } = currentStepData;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-green-600">Matching Phase: Pattern Search</h3>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Text:</div>
          <div className="flex gap-1 mb-2">
            {text.split('').map((char, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-sm ${
                  matches.includes(idx - patternIndex) && idx >= textIndex - patternIndex && idx <= textIndex - patternIndex + pattern.length - 1
                    ? 'bg-green-300 border-green-600'
                    : idx === textIndex 
                    ? isMatch ? 'bg-green-200 border-green-500' : 'bg-red-200 border-red-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                {char}
              </div>
            ))}
          </div>
          <div className="flex gap-1 text-xs text-gray-500">
            {text.split('').map((_, idx) => (
              <div key={idx} className="w-8 text-center">{idx}</div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Pattern:</div>
          <div className="flex gap-1 mb-2" style={{ marginLeft: `${(textIndex - patternIndex) * 36}px` }}>
            {pattern.split('').map((char, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-sm ${
                  idx === patternIndex 
                    ? isMatch ? 'bg-green-200 border-green-500' : 'bg-red-200 border-red-500'
                    : 'bg-blue-50 border-blue-300'
                }`}
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Failure Function:</div>
          <div className="flex gap-1">
            {failureFunction.map((val, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-sm ${
                  idx === patternIndex ? 'bg-yellow-200 border-yellow-500' : 'bg-gray-50 border-gray-300'
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <span className="font-semibold">Current:</span> text[{textIndex}] vs pattern[{patternIndex}]
          {matches.length > 0 && (
            <span className="ml-4 text-green-600 font-semibold">
              Matches found at: {matches.join(', ')}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Knuth-Morris-Pratt Algorithm Visualizer
      </h1>

      {/* Input Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text to search in:
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to search in"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pattern to find:
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter pattern to find"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <SkipBack size={16} />
              Previous
            </button>
            
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <SkipForward size={16} />
              Next
            </button>
            
            <button
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Speed:</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md"
            >
              <option value={2000}>Slow</option>
              <option value={1000}>Medium</option>
              <option value={500}>Fast</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-1">
            Progress: Step {currentStep + 1} of {steps.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-6 p-4 border rounded-lg">
        {renderPreprocessingVisualization()}
        {renderMatchingVisualization()}
        
        {/* Step Description */}
        {currentStepData.description && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div className="text-sm font-medium text-blue-800">
              {currentStepData.description}
            </div>
          </div>
        )}
      </div>

      {/* Algorithm Explanation */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">How KMP Works:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Preprocessing Phase:</strong> Build a failure function (LPS array) that tells us how many characters to skip when a mismatch occurs.</p>
          <p><strong>Matching Phase:</strong> Use the failure function to avoid redundant comparisons when searching for the pattern in the text.</p>
          <p><strong>Time Complexity:</strong> O(n + m) where n is the text length and m is the pattern length.</p>
          <p><strong>Key Insight:</strong> When a mismatch occurs, we don't need to start over - we can use information from the partial match.</p>
        </div>
      </div>
    </div>
  );
};

export default KMPVisualizer;