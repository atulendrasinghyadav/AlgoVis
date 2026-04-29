import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Shuffle, ArrowLeft, Clock, Search, Scissors, AlertTriangle, ChevronRight, Code2, CheckCircle2 } from 'lucide-react';
import { markAlgoAsCompleted } from '../firebase/progressService';
import * as searchingAlgorithms from '../searchingAlgorithms/searchingAlgorithms';
import './SearchingVisualizer.css';

const MAX_ARRAY_SIZE = 100;

const ALGO_DATA = {
  linear: {
    name: 'Linear Search',
    icon: <Search size={28} />,
    tagline: 'The brute-force approach. Checks element by element.',
    description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
    timeBest: 'O(1)',
    timeAvg: 'O(N)',
    timeWorst: 'O(N)',
    space: 'O(1)',
    reqSorted: false,
    color: '#eab308',
  },
  binary: {
    name: 'Binary Search',
    icon: <Scissors size={28} />,
    tagline: 'Divide and conquer on a sorted array.',
    description: 'Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
    timeBest: 'O(1)',
    timeAvg: 'O(log N)',
    timeWorst: 'O(log N)',
    space: 'O(1)',
    reqSorted: true,
    color: '#a16207',
  }
};

const CODE_SNIPPETS = {
  linear: {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

// Linear Search - O(n)
int linearSearch(vector<int> arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    vector<int> arr = {5, 2, 8, 1, 9};
    int result = linearSearch(arr, 8);
    cout << (result != -1 ? "Found at: " + to_string(result) : "Not found") << endl;
    return 0;
}`,
    java: `public class LinearSearch {
    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 9};
        int result = linearSearch(arr, 8);
        System.out.println(result != -1 ? "Found at: " + result : "Not found");
    }
}`
  },
  binary: {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

// Binary Search - O(log n), requires sorted array
int binarySearch(vector<int> arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> arr = {1, 2, 5, 8, 9};
    int result = binarySearch(arr, 8);
    cout << (result != -1 ? "Found at: " + to_string(result) : "Not found") << endl;
    return 0;
}`,
    java: `public class BinarySearch {
    static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 5, 8, 9};
        int result = binarySearch(arr, 8);
        System.out.println(result != -1 ? "Found at: " + result : "Not found");
    }
}`
  }
};

export default function SearchingVisualizer({ user, isPremium, onNavigate, progress }) {
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [speedMultiplier, setSpeedMultiplier] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [targetValue, setTargetValue] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [codeLanguage, setCodeLanguage] = useState('cpp');

  const isPausedRef = useRef(false);
  const cancelRef = useRef(false);
  const speedRef = useRef(speedMultiplier);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    if (selectedAlgo) {
      setShowCodePanel(true);
      setCodeLanguage('cpp');
      resetArray();
    }
  }, [arraySize, selectedAlgo]);

  const cancelSearch = () => {
    cancelRef.current = true;
    setIsSearching(false);
    setIsPaused(false);
    const bars = document.getElementsByClassName('search-array-bar');
    for (let bar of bars) {
      bar.classList.remove('scanning', 'found', 'eliminated');
    }
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const resetArray = () => {
    if (isSearching) return;
    
    let newArr = [];
    for (let i = 0; i < arraySize; i++) {
      newArr.push(randomIntFromInterval(10, 400));
    }
    
    // Auto-sort if it's binary search
    if (selectedAlgo === 'binary') {
      newArr.sort((a, b) => a - b);
    }
    
    setArray(newArr);
    
    // Pick a random element from the array to be the target by default
    if (newArr.length > 0) {
      const randomIndex = Math.floor(Math.random() * newArr.length);
      setTargetValue(newArr[randomIndex]);
    }
    
    clearBarStyles(newArr.length);
  };

  const forceWorstCase = () => {
    if (isSearching) return;
    // Set target to something definitely not in the array (e.g. max + 50)
    const maxVal = Math.max(...array, 0);
    setTargetValue(maxVal + 50);
  };

  const clearBarStyles = (len = array.length) => {
    const arrayBars = document.getElementsByClassName('search-array-bar');
    for (let i = 0; i < Math.min(arrayBars.length, len); i++) {
        arrayBars[i].className = 'search-array-bar';
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const animateSearch = async (animations) => {
    setIsSearching(true);
    setIsPaused(false);
    isPausedRef.current = false;
    cancelRef.current = false;

    // Reset styles before starting
    clearBarStyles();
    
    const arrayBars = document.getElementsByClassName('search-array-bar');

    for (let i = 0; i < animations.length; i++) {
      if (cancelRef.current) break;

      while (isPausedRef.current && !cancelRef.current) {
        await sleep(50);
      }
      if (cancelRef.current) break;

      // Binary search has very few steps (log n), so it needs a much slower baseline to be visible.
      const baseSpeed = selectedAlgo === 'binary' ? 600 : (3000 / arraySize); 
      const actualDelay = baseSpeed / speedRef.current;
      const { type, index, left, right, indices } = animations[i];

      if (type === 'scan') {
        arrayBars[index].classList.add('scanning');
        await sleep(actualDelay);
      } else if (type === 'unscan') {
        arrayBars[index].classList.remove('scanning');
        // Small delay to visually register the unscan
        await sleep(actualDelay / 2); 
      } else if (type === 'found') {
        // Clear all scanning, mark found
        for(let j=0; j<arrayBars.length; j++) arrayBars[j].classList.remove('scanning');
        arrayBars[index].classList.add('found');
        break; // Stop animating once found
      } else if (type === 'boundary') {
        // Just briefly flash bounds if needed, or we can just rely on eliminate.
        // We could style the left/right bounds differently, but eliminate is clearer.
      } else if (type === 'eliminate') {
        // Dim out eliminated indices
        for (let idx of indices) {
           arrayBars[idx].classList.add('eliminated');
        }
        await sleep(actualDelay); 
      }
    }

    setIsSearching(false);
    setIsPaused(false);
  };

  const playAlgorithm = () => {
    if (isSearching) {
      setIsPaused(!isPaused);
      return;
    }
    
    let animations = [];
    if (selectedAlgo === 'linear') {
      animations = searchingAlgorithms.getLinearSearchAnimations([...array], targetValue);
    } else if (selectedAlgo === 'binary') {
      animations = searchingAlgorithms.getBinarySearchAnimations([...array], targetValue);
    }
    
    // Mark as completed in Firebase
    if (user) {
      markAlgoAsCompleted(user.uid, 'searching', selectedAlgo);
    }
    
    animateSearch(animations);
  };

  const handleBack = () => {
    if (isSearching) cancelSearch();
    setSelectedAlgo(null);
  };

  const handleCodeToggle = () => {
    setShowCodePanel((prev) => !prev);
  };

  const currentCode = selectedAlgo ? CODE_SNIPPETS[selectedAlgo]?.[codeLanguage] : '';

  const maxBarWidth = 40;
  const calculatedWidth = Math.max(3, Math.min(maxBarWidth, (800 / arraySize) - 4));

  if (!selectedAlgo) {
    return (
      <div className="sorting-page searching-page">
        <div className="sorting-page-header">
          <h2>Searching Algorithms</h2>
          <p>Watch how different strategies locate a target value within an array of data.</p>
        </div>

        <div className="algo-cards-grid">
          {Object.entries(ALGO_DATA).map(([key, data]) => (
            <div
              key={key}
              className={`algo-card ${hoveredCard === key ? 'hovered' : ''}`}
              onClick={() => setSelectedAlgo(key)}
              onMouseEnter={() => setHoveredCard(key)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ '--card-accent': data.color }}
            >
              <div className="algo-card-glow" />
              
              <div className="algo-card-head">
                <div className="algo-card-icon" style={{ color: data.color }}>
                  {data.icon}
                </div>
                <span className="algo-card-name">{data.name}</span>
                {progress?.searching?.[key] && (
                  <div className="algo-card-status">
                    <CheckCircle2 size={13} strokeWidth={3} className="completed-icon" />
                    <span>Visualized</span>
                  </div>
                )}
              </div>

              <p className="algo-card-tagline">{data.tagline}</p>
              <p className="algo-card-desc">{data.description}</p>

              <div className="algo-card-stats">
                <div className="stat-row">
                  <span className="stat-key"><Clock size={12} /> Avg/Worst Time</span>
                  <span className="stat-val">{data.timeWorst}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key">Space</span>
                  <span className="stat-val">{data.space}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key">Requires Sorted Array</span>
                  <span className={`stat-val ${data.reqSorted ? 'stable-yes' : 'stable-no'}`}>{data.reqSorted ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="algo-card-cta">
                <span>Visualize</span> <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Visualizer View ─── */
  const currentAlgo = ALGO_DATA[selectedAlgo];

  return (
    <div className="searching-container" style={{ marginTop: '2rem' }}>
      {/* Top bar with back button and algo info */}
      <div className="vis-top-bar">
        <button className="back-btn" onClick={handleBack} disabled={isSearching}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="vis-algo-badge" style={{ '--card-accent': currentAlgo.color }}>
          <span className="vis-algo-icon" style={{ color: currentAlgo.color }}>{currentAlgo.icon}</span>
          <span>{currentAlgo.name}</span>
        </div>
        <button
          className={`graph-code-toggle-btn ${showCodePanel ? 'active' : ''}`}
          onClick={handleCodeToggle}
        >
          <Code2 size={16} /> {showCodePanel ? 'Hide Code' : 'Show Code'}
        </button>
      </div>

      <div className={`searching-workbench ${showCodePanel ? 'searching-workbench-with-code' : ''}`}>
        <div className="searching-main-column">
      <div className="panel controls-panel">
        
        <div className="control-group">
          <label className="control-label">Target Value</label>
          <input 
            type="number" 
            value={targetValue} 
            onChange={(e) => setTargetValue(Number(e.target.value))} 
            disabled={isSearching}
            style={{ width: '100px' }}
          />
        </div>

        <div className="control-group" style={{ justifyContent: 'flex-end', marginLeft: '-0.5rem' }}>
            <button 
                className="worst-case-btn" 
                onClick={forceWorstCase} 
                disabled={isSearching}
                title="Sets a target value not present in the array"
            >
               <AlertTriangle size={14}/> Force Worst Case
            </button>
        </div>

        <div className="control-group">
          <label className="control-label">Array Size ({arraySize})</label>
          <input 
            type="range" 
            min="5" 
            max={MAX_ARRAY_SIZE} 
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isSearching}
          />
        </div>

        <div className="control-group">
          <label className="control-label">Speed</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
          />
          <div className="speed-indicator">
            <span className="speed-label">{speedMultiplier}x</span>
            <span className="speed-delay">{Math.round((selectedAlgo === 'binary' ? 600 : (3000 / arraySize)) / speedMultiplier)}ms/frame</span>
          </div>
        </div>

        <div className="control-group" style={{ flexDirection: 'row', gap: '0.8rem', alignItems: 'flex-end', height: '100%', marginLeft: 'auto' }}>
          <button onClick={resetArray} disabled={isSearching} title="Generate Array" className="icon-btn">
            <Shuffle size={18} />
          </button>
          
          <button 
            className="primary play-btn" 
            onClick={playAlgorithm}
            style={{ minWidth: '110px' }}
          >
            {isSearching ? (
              isPaused ? <><Play size={18} /> Resume</> : <><Pause size={18} /> Pause</>
            ) : (
              <><Play size={18} /> Search</>
            )}
          </button>

          <button 
            className="danger-btn" 
            onClick={cancelSearch} 
            disabled={!isSearching}
            title="Cancel Search"
          >
            <Square size={18} /> Cancel
          </button>
        </div>
      </div>

      <div className="panel array-container">
        {/* Render a horizontal line mapping to the targetValue's height to show what we are searching for functionally */}
        {targetValue > 0 && targetValue <= 500 && (
            <div 
               className="target-line"
               style={{ bottom: `calc(${targetValue}px + 2rem)` }} // 2rem padding baseline offset
            />
        )}
        
        {array.map((value, idx) => (
          <div
            className="search-array-bar"
            key={idx}
            style={{
              height: `${value}px`,
              width: `${calculatedWidth}px`,
            }}
          ></div>
        ))}
      </div>
        </div>

        {showCodePanel && (
          <aside className="panel graph-code-panel">
            <div className="graph-code-header">
              <div>
                <p className="graph-code-kicker">Complete Program</p>
                <h3>{currentAlgo.name} - {codeLanguage === 'cpp' ? 'C++' : 'Java'}</h3>
                <p className="graph-code-desc">Includes user input format, graph construction, and final output in a beginner-friendly style.</p>
              </div>
              <div className="graph-code-tabs">
                <button className={`graph-code-tab ${codeLanguage === 'cpp' ? 'active' : ''}`} onClick={() => setCodeLanguage('cpp')}>C++</button>
                <button className={`graph-code-tab ${codeLanguage === 'java' ? 'active' : ''}`} onClick={() => setCodeLanguage('java')}>Java</button>
              </div>
            </div>

            <div className="graph-code-shell">
              <pre className="graph-code-block">
                <code>{currentCode}</code>
              </pre>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
