// sortingAlgorithms.js

// Helper to swap and record
function swap(arr, i, j, animations) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  // record the swap
  animations.push({ type: 'swap', indices: [i, j], values: [arr[i], arr[j]] });
}

export function getBubbleSortAnimations(array) {
  const animations = [];
  const auxiliaryArray = array.slice();
  const n = auxiliaryArray.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // push comparison
      animations.push({ type: 'compare', indices: [j, j + 1] });
      animations.push({ type: 'uncompare', indices: [j, j + 1] });
      if (auxiliaryArray[j] > auxiliaryArray[j + 1]) {
        swap(auxiliaryArray, j, j + 1, animations);
      }
    }
  }
  return animations;
}

export function getSelectionSortAnimations(array) {
  const animations = [];
  const auxiliaryArray = array.slice();
  const n = auxiliaryArray.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      animations.push({ type: 'compare', indices: [minIdx, j] });
      animations.push({ type: 'uncompare', indices: [minIdx, j] });
      if (auxiliaryArray[j] < auxiliaryArray[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      swap(auxiliaryArray, i, minIdx, animations);
    }
  }
  return animations;
}

export function getInsertionSortAnimations(array) {
  const animations = [];
  const auxiliaryArray = array.slice();
  const n = auxiliaryArray.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      animations.push({ type: 'compare', indices: [j, j - 1] });
      animations.push({ type: 'uncompare', indices: [j, j - 1] });
      if (auxiliaryArray[j] < auxiliaryArray[j - 1]) {
        swap(auxiliaryArray, j, j - 1, animations);
        j--;
      } else {
        break;
      }
    }
  }
  return animations;
}

// QUICK SORT
export function getQuickSortAnimations(array) {
  const animations = [];
  const auxiliaryArray = array.slice();
  quickSortHelper(auxiliaryArray, 0, auxiliaryArray.length - 1, animations);
  return animations;
}

function quickSortHelper(arr, startIdx, endIdx, animations) {
  if (startIdx >= endIdx) return;
  const pivotIdx = partition(arr, startIdx, endIdx, animations);
  quickSortHelper(arr, startIdx, pivotIdx - 1, animations);
  quickSortHelper(arr, pivotIdx + 1, endIdx, animations);
}

function partition(arr, startIdx, endIdx, animations) {
  const pivotValue = arr[endIdx];
  // We can highlight the pivot if we want, but sticking to standard compare/swap for now
  let pivotIdx = startIdx;
  for (let i = startIdx; i < endIdx; i++) {
    animations.push({ type: 'compare', indices: [i, endIdx] });
    animations.push({ type: 'uncompare', indices: [i, endIdx] });
    if (arr[i] <= pivotValue) {
      swap(arr, i, pivotIdx, animations);
      pivotIdx++;
    }
  }
  swap(arr, pivotIdx, endIdx, animations);
  return pivotIdx;
}

// MERGE SORT
export function getMergeSortAnimations(array) {
  const animations = [];
  if (array.length <= 1) return array;
  const auxiliaryArray = array.slice();
  mergeSortHelper(array.slice(), 0, array.length - 1, auxiliaryArray, animations);
  return animations;
}

function mergeSortHelper(mainArray, startIdx, endIdx, auxiliaryArray, animations) {
  if (startIdx === endIdx) return;
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;
  while (i <= middleIdx && j <= endIdx) {
    animations.push({ type: 'compare', indices: [i, j] });
    animations.push({ type: 'uncompare', indices: [i, j] });
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      // Overwrite value at index k in the main array with the value at index i in the auxiliary array.
      animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[i] });
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[j] });
      mainArray[k++] = auxiliaryArray[j++];
    }
  }
  while (i <= middleIdx) {
    animations.push({ type: 'compare', indices: [i, i] });
    animations.push({ type: 'uncompare', indices: [i, i] });
    animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[i] });
    mainArray[k++] = auxiliaryArray[i++];
  }
  while (j <= endIdx) {
    animations.push({ type: 'compare', indices: [j, j] });
    animations.push({ type: 'uncompare', indices: [j, j] });
    animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[j] });
    mainArray[k++] = auxiliaryArray[j++];
  }
}
