export function getLinearSearchAnimations(array, target) {
  const animations = [];
  
  for (let i = 0; i < array.length; i++) {
    // Check element
    animations.push({ type: 'scan', index: i });
    
    if (array[i] === target) {
      animations.push({ type: 'found', index: i });
      return animations;
    } else {
      animations.push({ type: 'unscan', index: i });
    }
  }
  
  return animations; // Not found
}

export function getBinarySearchAnimations(array, target) {
  const animations = [];
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    // Show current boundaries
    animations.push({ type: 'boundary', left, right });
    
    const mid = Math.floor((left + right) / 2);
    
    // Check mid
    animations.push({ type: 'scan', index: mid });

    if (array[mid] === target) {
      animations.push({ type: 'found', index: mid });
      return animations;
    }
    
    animations.push({ type: 'unscan', index: mid });

    if (array[mid] < target) {
      // It's in the right half, eliminate left half
      const eliminated = [];
      for (let i = left; i <= mid; i++) eliminated.push(i);
      animations.push({ type: 'eliminate', indices: eliminated });
      left = mid + 1;
    } else {
      // It's in the left half, eliminate right half
      const eliminated = [];
      for (let i = mid; i <= right; i++) eliminated.push(i);
      animations.push({ type: 'eliminate', indices: eliminated });
      right = mid - 1;
    }
  }

  return animations; // Not found
}
