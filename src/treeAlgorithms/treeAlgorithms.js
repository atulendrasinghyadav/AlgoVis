export class TreeNode {
  constructor(value) {
    this.value = value;
    this.id = Math.random().toString(36).substring(2, 9);
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    // visual flags
    this.isHidden = false; 
    this.isHighlighted = false;
  }
}

function nodeVar(name, node) {
  return node ? { name, nodeId: node.id, value: node.value } : { name, nodeId: null, value: null };
}

function valueVar(name, value) {
  return { name, nodeId: null, value };
}

// Clone deeply to avoid react state mutation bugs
export function cloneTree(root) {
  if (!root) return null;
  const newNode = new TreeNode(root.value);
  newNode.id = root.id;
  newNode.x = root.x;
  newNode.y = root.y;
  newNode.isHidden = root.isHidden;
  newNode.isHighlighted = root.isHighlighted;
  newNode.left = cloneTree(root.left);
  newNode.right = cloneTree(root.right);
  return newNode;
}

// Calculate SVG coordinates
export function calculateCoordinates(node, x, y, dx, dy) {
  if (!node) return;
  node.x = x;
  node.y = y;
  if (node.left) calculateCoordinates(node.left, x - dx, y + dy, dx / 2, dy);
  if (node.right) calculateCoordinates(node.right, x + dx, y + dy, dx / 2, dy);
}

// Generate a random balanced tree
export function generateRandomTree(numNodes) {
  const values = [];
  while(values.length < numNodes) {
    const val = Math.floor(Math.random() * 90) + 10; // 10 to 99
    if (!values.includes(val)) values.push(val);
  }
  values.sort((a,b) => a-b);
  
  function buildBalanced(arr, start, end) {
    if (start > end) return null;
    const mid = Math.floor((start + end) / 2);
    const node = new TreeNode(arr[mid]);
    node.left = buildBalanced(arr, start, mid - 1);
    node.right = buildBalanced(arr, mid + 1, end);
    return node;
  }
  
  const root = buildBalanced(values, 0, values.length - 1);
  return root;
}

export function getMaxDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
}

// --- Traversals ---
export function getPreOrderAnimations(root) {
  const animations = [];
  function traverse(node) {
    if(!node) return;
    animations.push({ type: 'visit', id: node.id, vars: [nodeVar('curr', node)] });
    animations.push({ type: 'unvisit', id: node.id });
    traverse(node.left);
    traverse(node.right);
  }
  traverse(root);
  return animations;
}

export function getInOrderAnimations(root) {
  const animations = [];
  function traverse(node) {
    if(!node) return;
    traverse(node.left);
    animations.push({ type: 'visit', id: node.id, vars: [nodeVar('curr', node)] });
    animations.push({ type: 'unvisit', id: node.id });
    traverse(node.right);
  }
  traverse(root);
  return animations;
}

export function getPostOrderAnimations(root) {
  const animations = [];
  function traverse(node) {
    if(!node) return;
    traverse(node.left);
    traverse(node.right);
    animations.push({ type: 'visit', id: node.id, vars: [nodeVar('curr', node)] });
    animations.push({ type: 'unvisit', id: node.id });
  }
  traverse(root);
  return animations;
}

// --- BST Operations ---

export function getSearchAnimations(root, value) {
  const animations = [];
  let curr = root;
  while(curr) {
    animations.push({ type: 'visit', id: curr.id, vars: [nodeVar('curr', curr), valueVar('target', value)] });
    if (curr.value === value) {
      animations.push({ type: 'found', id: curr.id, vars: [nodeVar('curr', curr), valueVar('target', value)] });
      return animations;
    }
    animations.push({ type: 'unvisit', id: curr.id });
    if (value < curr.value) {
      curr = curr.left;
    } else {
      curr = curr.right;
    }
  }
  return animations; // Not found
}

export function getInsertAnimations(originalRoot, value) {
  const animations = [];
  const root = cloneTree(originalRoot);
  
  // Create the new node but keep it visually hidden initially
  const newNode = new TreeNode(value);
  newNode.isHidden = true; // Will be revealed by animation

  if (!root) {
    newNode.isHidden = false; 
    animations.push({ type: 'insert_root', id: newNode.id, vars: [nodeVar('root', newNode), valueVar('value', value)] });
    return { newRoot: newNode, animations };
  }

  let curr = root;
  let depth = 1;

  while(curr) {
    animations.push({ type: 'visit', id: curr.id, vars: [nodeVar('curr', curr), valueVar('value', value)] });
    
    if (curr.value === value) {
      // Value exists, reject insert logically
      animations.push({ type: 'error_flash', id: curr.id, vars: [nodeVar('curr', curr), valueVar('value', value)] });
      return { newRoot: root, animations }; 
    }
    
    if (value < curr.value) {
      if (!curr.left) {
        if (depth >= 6) { // Capacity limit
          animations.push({ type: 'unvisit', id: curr.id });
          return { newRoot: root, animations: [] }; // Silent fail or error flash
        }
        curr.left = newNode;
        animations.push({ type: 'unvisit', id: curr.id });
        animations.push({ type: 'reveal', id: newNode.id, vars: [nodeVar('newNode', newNode)] });
        animations.push({ type: 'found', id: newNode.id, vars: [nodeVar('newNode', newNode)] }); // Light it up to finish
        break;
      }
      animations.push({ type: 'unvisit', id: curr.id });
      curr = curr.left;
    } else {
      if (!curr.right) {
        if (depth >= 6) {
           animations.push({ type: 'unvisit', id: curr.id });
           return { newRoot: root, animations: [] };
        }
        curr.right = newNode;
        animations.push({ type: 'unvisit', id: curr.id });
          animations.push({ type: 'reveal', id: newNode.id, vars: [nodeVar('newNode', newNode)] });
          animations.push({ type: 'found', id: newNode.id, vars: [nodeVar('newNode', newNode)] });
        break;
      }
      animations.push({ type: 'unvisit', id: curr.id });
      curr = curr.right;
    }
    depth++;
  }

  return { newRoot: root, animations };
}

// Returns { newRoot, animations }
// We animate finding the node. Once found, we animate deletion.
export function getDeleteAnimations(originalRoot, value) {
  const animations = [];
  const root = cloneTree(originalRoot);

  function removeNodeRecursively(node, val) {
    if (!node) return null;
    
    animations.push({ type: 'visit', id: node.id, vars: [nodeVar('curr', node), valueVar('target', val)] });
    
    if (val < node.value) {
      animations.push({ type: 'unvisit', id: node.id });
      node.left = removeNodeRecursively(node.left, val);
    } else if (val > node.value) {
      animations.push({ type: 'unvisit', id: node.id });
      node.right = removeNodeRecursively(node.right, val);
    } else {
      // Found the node to delete! Show found glow
      animations.push({ type: 'found', id: node.id, vars: [nodeVar('curr', node), valueVar('target', val)] });
      
      // Case 1: No child
      if (!node.left && !node.right) {
        animations.push({ type: 'fade_out', id: node.id, vars: [nodeVar('curr', node)] });
        return null;
      }
      
      // Case 2: One child
      if (!node.left) {
        animations.push({ type: 'fade_out', id: node.id, vars: [nodeVar('curr', node)] });
        return node.right;
      } else if (!node.right) {
        animations.push({ type: 'fade_out', id: node.id, vars: [nodeVar('curr', node)] });
        return node.left;
      }
      
      // Case 3: Two children
      // Find inorder successor (smallest in right subtree)
      animations.push({ type: 'info', text: 'Finding In-Order Successor' });
      let temp = node.right;
      let prevId = node.id;
      
      while (temp.left) {
        animations.push({ type: 'visit_succ', id: temp.id, vars: [nodeVar('temp', temp), nodeVar('curr', node)] });
        animations.push({ type: 'unvisit_succ', id: temp.id });
        prevId = temp.id;
        temp = temp.left;
      }
      
      animations.push({ type: 'found_succ', id: temp.id, vars: [nodeVar('temp', temp), nodeVar('curr', node)] });
      // Visualize value swap
      animations.push({ type: 'swap_values', node1Id: node.id, node2Id: temp.id, val1: temp.value, val2: node.value, vars: [nodeVar('curr', node), nodeVar('temp', temp)] });
      
      node.value = temp.value;
      
      // Now remove the successor
      animations.push({ type: 'unvisit', id: node.id }); // Clean up original found state
      node.right = removeNodeRecursively(node.right, temp.value);
    }
    return node;
  }

  const newRoot = removeNodeRecursively(root, value);
  return { newRoot, animations };
}

// Flat list helper for react rendering
export function getNodesAndEdges(node) {
  const nodes = [];
  const edges = [];

  function traverse(n) {
    if (!n) return;
    nodes.push(n);
    if (n.left) {
      edges.push({
        id: `e-${n.id}-${n.left.id}`,
        fromX: n.x, fromY: n.y,
        toX: n.left.x, toY: n.left.y,
        isHidden: n.left.isHidden
      });
      traverse(n.left);
    }
    if (n.right) {
      edges.push({
        id: `e-${n.id}-${n.right.id}`,
        fromX: n.x, fromY: n.y,
        toX: n.right.x, toY: n.right.y,
        isHidden: n.right.isHidden
      });
      traverse(n.right);
    }
  }
  
  traverse(node);
  return { nodes, edges };
}
