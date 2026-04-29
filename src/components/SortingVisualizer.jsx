import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Shuffle, ArrowLeft, Clock, Layers, TrendingUp, Zap, GitMerge, ArrowUpDown, ChevronRight, Code2, CheckCircle2 } from 'lucide-react';
import { markAlgoAsCompleted } from '../firebase/progressService';
import * as sortingAlgorithms from '../sortingAlgorithms/sortingAlgorithms';
import './SortingVisualizer.css';

const MAX_ARRAY_SIZE = 100;

const ALGO_DATA = {
  bubble: {
    name: 'Bubble Sort',
    icon: <ArrowUpDown size={28} />,
    tagline: 'The simplest, most intuitive sorting algorithm.',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Great as a teaching baseline.',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    color: '#eab308',
  },
  selection: {
    name: 'Selection Sort',
    icon: <TrendingUp size={28} />,
    tagline: 'Find the minimum, place it at the front.',
    description: 'Divides the array into sorted and unsorted regions. Repeatedly selects the smallest element from unsorted and moves it to the sorted boundary.',
    timeBest: 'O(N²)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: false,
    color: '#f97316',
  },
  insertion: {
    name: 'Insertion Sort',
    icon: <Layers size={28} />,
    tagline: 'Sort the way you sort a hand of cards.',
    description: 'Builds the final sorted array one item at a time. Picks each element and inserts it into its correct position among the already-sorted elements.',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    color: '#ef4444',
  },
  merge: {
    name: 'Merge Sort',
    icon: <GitMerge size={28} />,
    tagline: 'Divide. Conquer. Merge. Interview favorite.',
    description: 'Recursively splits the array into halves until single elements remain, then merges them back together in sorted order. Guaranteed O(N log N).',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N log N)',
    space: 'O(N)',
    stable: true,
    color: '#a16207',
  },
  quick: {
    name: 'Quick Sort',
    icon: <Zap size={28} />,
    tagline: 'The fastest in-place sort on average.',
    description: 'Picks a pivot element, partitions the array so elements smaller go left and larger go right, then recursively sorts each partition.',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N²)',
    space: 'O(log N)',
    stable: false,
    color: '#ca8a04',
  },
};

const CODE_SNIPPETS = {
  bubble: {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1])
                swap(arr[j], arr[j + 1]);
        }
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    for (int x : arr) cout << x << " ";
    return 0;
}`,
    java: `import java.util.Arrays;

public class BubbleSort {
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`
  },
  selection: {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        swap(arr[i], arr[minIdx]);
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    selectionSort(arr);
    for (int x : arr) cout << x << " ";
    return 0;
}`,
    java: `import java.util.Arrays;

public class SelectionSort {
    static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++)
                if (arr[j] < arr[minIdx]) minIdx = j;
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        selectionSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`
  },
  insertion: {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    insertionSort(arr);
    for (int x : arr) cout << x << " ";
    return 0;
}`,
    java: `import java.util.Arrays;

public class InsertionSort {
    static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i], j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        insertionSort(arr);
        System.out.println(Arrays.toString(arr));
    }
}`
  },
  merge: {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& a, int l, int m, int r) {
    vector<int> temp;
    int i = l, j = m + 1;
    while (i <= m && j <= r)
        temp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);
    while (i <= m) temp.push_back(a[i++]);
    while (j <= r) temp.push_back(a[j++]);
    for (int i = l, k = 0; i <= r; i++, k++)
        a[i] = temp[k];
}

void mergeSort(vector<int>& a, int l, int r) {
    if (l < r) {
        int m = (l + r) / 2;
        mergeSort(a, l, m);
        mergeSort(a, m + 1, r);
        merge(a, l, m, r);
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr, 0, arr.size() - 1);
    for (int x : arr) cout << x << " ";
    return 0;
}`,
    java: `import java.util.Arrays;

public class MergeSort {
    static void merge(int[] a, int l, int m, int r) {
        int[] temp = new int[r - l + 1];
        int i = l, j = m + 1, k = 0;
        while (i <= m && j <= r)
            temp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i <= m) temp[k++] = a[i++];
        while (j <= r) temp[k++] = a[j++];
        for (i = l, k = 0; i <= r; i++, k++) a[i] = temp[k];
    }

    static void mergeSort(int[] a, int l, int r) {
        if (l < r) {
            int m = (l + r) / 2;
            mergeSort(a, l, m);
            mergeSort(a, m + 1, r);
            merge(a, l, m, r);
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println(Arrays.toString(arr));
    }
}`
  },
  quick: {
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& a, int l, int r) {
    int p = a[r], i = l - 1;
    for (int j = l; j < r; j++)
        if (a[j] < p) swap(a[++i], a[j]);
    swap(a[++i], a[r]);
    return i;
}

void quickSort(vector<int>& a, int l, int r) {
    if (l < r) {
        int p = partition(a, l, r);
        quickSort(a, l, p - 1);
        quickSort(a, p + 1, r);
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    quickSort(arr, 0, arr.size() - 1);
    for (int x : arr) cout << x << " ";
    return 0;
}`,
    java: `import java.util.Arrays;

public class QuickSort {
    static int partition(int[] a, int l, int r) {
        int p = a[r], i = l - 1;
        for (int j = l; j < r; j++)
            if (a[j] < p) {
                i++;
                int t = a[i]; a[i] = a[j]; a[j] = t;
            }
        int t = a[++i]; a[i] = a[r]; a[r] = t;
        return i;
    }

    static void quickSort(int[] a, int l, int r) {
        if (l < r) {
            int p = partition(a, l, r);
            quickSort(a, l, p - 1);
            quickSort(a, p + 1, r);
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        quickSort(arr, 0, arr.length - 1);
        System.out.println(Arrays.toString(arr));
    }
}`
  }
};

export default function SortingVisualizer({ user, isPremium, onNavigate, progress }) {
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [speedMultiplier, setSpeedMultiplier] = useState(5);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dataDist, setDataDist] = useState('random');
  const [customInput, setCustomInput] = useState('');
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
  }, [arraySize, dataDist, selectedAlgo]);

  const cancelSort = () => {
    cancelRef.current = true;
    setIsSorting(false);
    setIsPaused(false);
  };

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const resetArray = () => {
    if (isSorting) return;
    
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      arrayBars[i].style.backgroundColor = 'var(--color-unsorted)';
    }

    let newArr = [];
    if (dataDist === 'random') {
      for (let i = 0; i < arraySize; i++) {
        newArr.push(randomIntFromInterval(10, 400));
      }
    } else if (dataDist === 'nearly_sorted') {
      for (let i = 0; i < arraySize; i++) {
        newArr.push(10 + (i * (390 / arraySize)));
      }
      for (let i = 0; i < arraySize / 5; i++) {
        const iA = randomIntFromInterval(0, arraySize - 1);
        const iB = randomIntFromInterval(0, arraySize - 1);
        const tmp = newArr[iA];
        newArr[iA] = newArr[iB];
        newArr[iB] = tmp;
      }
    } else if (dataDist === 'reversed') {
      for (let i = 0; i < arraySize; i++) {
        newArr.push(400 - (i * (390 / arraySize)));
      }
    } else if (dataDist === 'few_unique') {
      const distinctVals = [50, 150, 250, 350];
      for (let i = 0; i < arraySize; i++) {
        newArr.push(distinctVals[randomIntFromInterval(0, distinctVals.length - 1)]);
      }
    }
    
    setArray(newArr);
    setCustomInput(newArr.join(', '));
  };

  const handleCustomInput = (e) => {
    if (isSorting) return;
    const val = e.target.value;
    setCustomInput(val);
    const parsed = val.split(',').map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num) && num > 0);
    if (parsed.length > 0) {
      setArray(parsed);
      setArraySize(parsed.length <= MAX_ARRAY_SIZE ? parsed.length : MAX_ARRAY_SIZE);
      
      const arrayBars = document.getElementsByClassName('array-bar');
      for (let i = 0; i < arrayBars.length; i++) {
        arrayBars[i].style.backgroundColor = 'var(--color-unsorted)';
      }
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const animateSort = async (animations) => {
    setIsSorting(true);
    setIsPaused(false);
    isPausedRef.current = false;
    cancelRef.current = false;

    const arrayBars = document.getElementsByClassName('array-bar');
    
    for (let i = 0; i < animations.length; i++) {
      if (cancelRef.current) break;

      while (isPausedRef.current && !cancelRef.current) {
        await sleep(50);
      }
      if (cancelRef.current) break;

      const baseSpeed = 3000 / arraySize; 
      const actualDelay = baseSpeed / speedRef.current;
      const isColorChange = animations[i].type === 'compare' || animations[i].type === 'uncompare';
      
      if (isColorChange) {
        const [barOneIdx, barTwoIdx] = animations[i].indices;
        const barOneStyle = arrayBars[barOneIdx].style;
        const barTwoStyle = arrayBars[barTwoIdx].style;
        const color = animations[i].type === 'compare' ? 'var(--color-comparing)' : 'var(--color-unsorted)';
        barOneStyle.backgroundColor = color;
        barTwoStyle.backgroundColor = color;
      } else if (animations[i].type === 'swap') {
        const [barOneIdx, barTwoIdx] = animations[i].indices;
        const [newOneHeight, newTwoHeight] = animations[i].values;
        
        const barOneStyle = arrayBars[barOneIdx].style;
        const barTwoStyle = arrayBars[barTwoIdx].style;
        
        barOneStyle.backgroundColor = 'var(--color-swapping)';
        barTwoStyle.backgroundColor = 'var(--color-swapping)';
        barOneStyle.height = `${newOneHeight}px`;
        barTwoStyle.height = `${newTwoHeight}px`;
      } else if (animations[i].type === 'overwrite') {
        const { index, value } = animations[i];
        const barStyle = arrayBars[index].style;
        barStyle.backgroundColor = 'var(--color-swapping)';
        barStyle.height = `${value}px`;
      }

      await sleep(actualDelay);

      if (!cancelRef.current) {
        if (animations[i].type === 'swap') {
          const [barOneIdx, barTwoIdx] = animations[i].indices;
          arrayBars[barOneIdx].style.backgroundColor = 'var(--color-unsorted)';
          arrayBars[barTwoIdx].style.backgroundColor = 'var(--color-unsorted)';
        } else if (animations[i].type === 'overwrite') {
          const { index } = animations[i];
          arrayBars[index].style.backgroundColor = 'var(--color-unsorted)';
        }
      }
    }

    if (!cancelRef.current) {
      for (let j = 0; j < arrayBars.length; j++) {
        if (cancelRef.current) break;
        arrayBars[j].style.backgroundColor = 'var(--color-sorted)';
        await sleep(200 / arraySize);
      }
    }

    if (!cancelRef.current) {
      setIsSorting(false);
      setIsPaused(false);
    }
  };

  const playAlgorithm = () => {
    if (isSorting) {
      // Toggle pause if already running
      setIsPaused(!isPaused);
      return;
    }

    let animations = [];
    if (selectedAlgo === 'bubble') animations = sortingAlgorithms.getBubbleSortAnimations(array);
    if (selectedAlgo === 'selection') animations = sortingAlgorithms.getSelectionSortAnimations(array);
    if (selectedAlgo === 'insertion') animations = sortingAlgorithms.getInsertionSortAnimations(array);
    if (selectedAlgo === 'quick') animations = sortingAlgorithms.getQuickSortAnimations(array);
    if (selectedAlgo === 'merge') animations = sortingAlgorithms.getMergeSortAnimations(array);
    
    // Mark as completed in Firebase
    if (user) {
      markAlgoAsCompleted(user.uid, 'sorting', selectedAlgo);
    }
    
    animateSort(animations);
  };

  const handleBack = () => {
    if (isSorting) cancelSort();
    setSelectedAlgo(null);
  };

  const handleCodeToggle = () => {
    setShowCodePanel((prev) => !prev);
  };

  const currentCode = selectedAlgo ? CODE_SNIPPETS[selectedAlgo]?.[codeLanguage] : '';

  const maxBarWidth = 40;
  const calculatedWidth = Math.max(3, Math.min(maxBarWidth, (800 / arraySize) - 4));

  /* ─── Card Selection View ─── */
  if (!selectedAlgo) {
    return (
      <div className="sorting-page">
        <div className="sorting-page-header">
          <h2>Sorting Algorithms</h2>
          <p>Select an algorithm to visualize its inner workings in real-time.</p>
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
                {progress?.sorting?.[key] && (
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
                  <span className="stat-key"><Clock size={12} /> Best</span>
                  <span className="stat-val">{data.timeBest}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key"><Clock size={12} /> Avg</span>
                  <span className="stat-val">{data.timeAvg}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key"><Clock size={12} /> Worst</span>
                  <span className="stat-val">{data.timeWorst}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key">Space</span>
                  <span className="stat-val">{data.space}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key">Stable</span>
                  <span className={`stat-val ${data.stable ? 'stable-yes' : 'stable-no'}`}>{data.stable ? 'Yes' : 'No'}</span>
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
    <div className="sorting-container" style={{ marginTop: '2rem' }}>
      {/* Top bar with back button and algo info */}
      <div className="vis-top-bar">
        <button className="back-btn" onClick={handleBack} disabled={isSorting}>
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

      <div className={`sorting-workbench ${showCodePanel ? 'sorting-workbench-with-code' : ''}`}>
        <div className="sorting-main-column">
      <div className="panel controls-panel">
        <div className="control-group">
          <label className="control-label">Array Size ({arraySize})</label>
          <input 
            type="range" 
            min="5" 
            max={MAX_ARRAY_SIZE} 
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isSorting}
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
            <span className="speed-delay">{Math.round(3000 / arraySize / speedMultiplier)}ms/frame</span>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Data Dist.</label>
          <select value={dataDist} onChange={(e) => setDataDist(e.target.value)} disabled={isSorting}>
            <option value="random">Random</option>
            <option value="nearly_sorted">Nearly Sorted</option>
            <option value="reversed">Reversed</option>
            <option value="few_unique">Few Unique</option>
          </select>
        </div>

        <div className="control-group" style={{ flexGrow: 1, minWidth: '200px' }}>
          <label className="control-label">Custom Input</label>
          <input 
            type="text" 
            value={customInput} 
            onChange={handleCustomInput} 
            disabled={isSorting}
            placeholder="e.g. 10, 20, 50, 5"
          />
        </div>

        <div className="control-group" style={{ flexDirection: 'row', gap: '0.8rem', alignItems: 'flex-end', height: '100%' }}>
          <button onClick={resetArray} disabled={isSorting} title="Generate Array" className="icon-btn">
            <Shuffle size={18} />
          </button>
          
          <button 
            className="primary play-btn" 
            onClick={playAlgorithm}
            style={{ minWidth: '110px' }}
          >
            {isSorting ? (
              isPaused ? <><Play size={18} /> Resume</> : <><Pause size={18} /> Pause</>
            ) : (
              <><Play size={18} /> Play</>
            )}
          </button>

          <button 
            className="danger-btn" 
            onClick={cancelSort} 
            disabled={!isSorting}
            title="Cancel Sort"
          >
            <Square size={18} /> Cancel
          </button>
        </div>
      </div>

      <div className="panel array-container">
        {array.map((value, idx) => (
          <div
            className="array-bar"
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
