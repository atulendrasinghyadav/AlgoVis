import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Shuffle, ArrowLeft, Clock, CornerDownRight, Trash2, Crosshair, FastForward, Navigation, Layers, ChevronRight, Code2 } from 'lucide-react';
import * as treeAlgorithms from '../treeAlgorithms/treeAlgorithms';
import './TreeVisualizer.css';

const ALGO_DATA = {
  insert: {
    name: 'BST Insertion',
    icon: <CornerDownRight size={28} />,
    tagline: 'Places a new node in its sorted position.',
    description: 'Traverses the tree comparing values. Once it reaches a null leaf, it attaches the new node.',
    timeWorst: 'O(N)',
    timeAvg: 'O(log N)',
    color: '#eab308'
  },
  delete: {
    name: 'BST Deletion',
    icon: <Trash2 size={28} />,
    tagline: 'Removes a node and handles restructuring.',
    description: 'Finds the node. If it has two children, relies on the in-order successor to fill the gap safely.',
    timeWorst: 'O(N)',
    timeAvg: 'O(log N)',
    color: '#ef4444'
  },
  search_bst: {
    name: 'BST Search',
    icon: <Crosshair size={28} />,
    tagline: 'Fast logarithmic lookup.',
    description: 'Eliminates half the tree at every step based on value comparisons until it finds the target.',
    timeWorst: 'O(N)',
    timeAvg: 'O(log N)',
    color: '#3b82f6'
  },
  preorder: {
    name: 'Pre-Order Traversal',
    icon: <FastForward size={28} />,
    tagline: 'Root -> Left -> Right',
    description: 'Visits the current node before traversing its left and right subtrees. Useful for making a copy of a tree.',
    timeWorst: 'O(N)',
    timeAvg: 'O(N)',
    color: '#8b5cf6'
  },
  inorder: {
    name: 'In-Order Traversal',
    icon: <Navigation size={28} />,
    tagline: 'Left -> Root -> Right',
    description: 'Visits left subtree, then the root, then the right subtree. Retrieves keys in sorted order.',
    timeWorst: 'O(N)',
    timeAvg: 'O(N)',
    color: '#10b981'
  },
  postorder: {
    name: 'Post-Order Traversal',
    icon: <Layers size={28} />,
    tagline: 'Left -> Right -> Root',
    description: 'Visits subtrees before their root. Useful for deleting a tree from leaf to root.',
    timeWorst: 'O(N)',
    timeAvg: 'O(N)',
    color: '#f97316'
  }
};

const CODE_SNIPPETS = {
  insert: {
    cpp: `struct Node {
    int value;
    Node* left;
    Node* right;
    Node(int v) : value(v), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int value) {
    if (!root) return new Node(value);
    if (value < root->value) root->left = insert(root->left, value);
    else if (value > root->value) root->right = insert(root->right, value);
    return root;
}`,
    java: `class Node {
    int value;
    Node left, right;
    Node(int value) { this.value = value; }
}

Node insert(Node root, int value) {
    if (root == null) return new Node(value);
    if (value < root.value) root.left = insert(root.left, value);
    else if (value > root.value) root.right = insert(root.right, value);
    return root;
}`
  },
  delete: {
    cpp: `Node* findMin(Node* node) {
    while (node && node->left) node = node->left;
    return node;
}

Node* removeNode(Node* root, int value) {
    if (!root) return nullptr;
    if (value < root->value) root->left = removeNode(root->left, value);
    else if (value > root->value) root->right = removeNode(root->right, value);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        Node* temp = findMin(root->right);
        root->value = temp->value;
        root->right = removeNode(root->right, temp->value);
    }
    return root;
}`,
    java: `Node findMin(Node node) {
    while (node != null && node.left != null) node = node.left;
    return node;
}

Node delete(Node root, int value) {
    if (root == null) return null;
    if (value < root.value) root.left = delete(root.left, value);
    else if (value > root.value) root.right = delete(root.right, value);
    else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        Node temp = findMin(root.right);
        root.value = temp.value;
        root.right = delete(root.right, temp.value);
    }
    return root;
}`
  },
  search_bst: {
    cpp: `Node* search(Node* root, int target) {
    Node* curr = root;
    while (curr) {
        if (curr->value == target) return curr;
        curr = target < curr->value ? curr->left : curr->right;
    }
    return nullptr;
}`,
    java: `Node search(Node root, int target) {
    Node curr = root;
    while (curr != null) {
        if (curr.value == target) return curr;
        curr = target < curr.value ? curr.left : curr.right;
    }
    return null;
}`
  },
  preorder: {
    cpp: `void preorder(Node* root) {
    if (!root) return;
    visit(root);
    preorder(root->left);
    preorder(root->right);
}`,
    java: `void preorder(Node root) {
    if (root == null) return;
    visit(root);
    preorder(root.left);
    preorder(root.right);
}`
  },
  inorder: {
    cpp: `void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    visit(root);
    inorder(root->right);
}`,
    java: `void inorder(Node root) {
    if (root == null) return;
    inorder(root.left);
    visit(root);
    inorder(root.right);
}`
  },
  postorder: {
    cpp: `void postorder(Node* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    visit(root);
}`,
    java: `void postorder(Node root) {
    if (root == null) return;
    postorder(root.left);
    postorder(root.right);
    visit(root);
}`
  }
};

function formatVariableValue(value) {
  if (value === null || value === undefined) return 'null';
  return String(value);
}

function formatVariableBadge(variable) {
  return `${variable.name}: ${formatVariableValue(variable.value)}`;
}

export default function TreeVisualizer({ user, onNavigate }) {
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [treeRoot, setTreeRoot] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [inputValue, setInputValue] = useState(50);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [viewData, setViewData] = useState({ nodes: [], edges: [] });
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [activeVariables, setActiveVariables] = useState([]);
  // Used for status messages across complex animations
  const [statusMessage, setStatusMessage] = useState('');

  const isPausedRef = useRef(false);
  const cancelRef = useRef(false);
  const speedRef = useRef(speedMultiplier);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    if (selectedAlgo) {
      if (isAnimating) cancelAnimation();
      generateInitialTree();
      setShowCodePanel(true);
      setCodeLanguage('cpp');
    }
  }, [selectedAlgo]);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  // Derive SVG layout whenever treeRoot changes
  useEffect(() => {
    if (treeRoot) {
      // Setup coordinates
      // Assume canvas width ~1000px, start X at 500, start Y at 40
      // initial horizontal spread (dx) is 250, vertical spread (dy) is 80
      treeAlgorithms.calculateCoordinates(treeRoot, 500, 40, 250, 80);
      const parsed = treeAlgorithms.getNodesAndEdges(treeRoot);
      setViewData(parsed);
    }
  }, [treeRoot]);

  const generateInitialTree = () => {
    if (isAnimating) return;
    setStatusMessage('');
    setActiveVariables([]);
    const root = treeAlgorithms.generateRandomTree(12);
    setTreeRoot(root);
  };

  const cancelAnimation = () => {
    cancelRef.current = true;
    setIsAnimating(false);
    setIsPaused(false);
    setStatusMessage('');
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    setActiveVariables([]);
    clearAllGlows();
  };

  const handleCodeToggle = () => {
    setShowCodePanel((prev) => !prev);
  };

  const clearAllGlows = () => {
    const circles = document.querySelectorAll('.tree-node');
    circles.forEach(c => {
      c.classList.remove('tree-scanning', 'tree-found', 'tree-error', 'tree-succ', 'tree-hidden');
    });
    const edges = document.querySelectorAll('.tree-edge-line');
    edges.forEach(e => e.classList.remove('tree-hidden'));
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runAnimation = async (animations, newRootState = null, rootTiming = 'before') => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    setIsAnimating(true);
    setIsPaused(false);
    isPausedRef.current = false;
    cancelRef.current = false;
    setStatusMessage('');
    setActiveVariables([]);

    if (newRootState && rootTiming === 'before') {
        setTreeRoot(newRootState);
        // Wait for React to mount the new SVG nodes (they might be hidden by CSS)
        await sleep(50); 
    }

    // Base speed config (slower mapping than flat arrays)
    const getDelay = () => (2000 / speedRef.current);

    for (let i = 0; i < animations.length; i++) {
        if (cancelRef.current) break;
        while (isPausedRef.current && !cancelRef.current) {
            await sleep(50);
        }
        if (cancelRef.current) break;

        const anim = animations[i];
        const delay = getDelay();
        if (Object.prototype.hasOwnProperty.call(anim, 'vars')) {
          setActiveVariables(anim.vars || []);
        } else {
          setActiveVariables([]);
        }

        if (anim.type === 'info') {
            setStatusMessage(anim.text);
        }
        else if (anim.type === 'visit') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) el.classList.add('tree-scanning');
            await sleep(delay);
        }
        else if (anim.type === 'unvisit') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) el.classList.remove('tree-scanning', 'tree-found', 'tree-error');
            await sleep(delay / 2);
        }
        else if (anim.type === 'found') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) el.classList.add('tree-found');
            await sleep(delay * 1.5); // linger logic
        }
        else if (anim.type === 'error_flash') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) el.classList.add('tree-error');
            setStatusMessage('Value already exists!');
            await sleep(delay * 2);
            if(el) el.classList.remove('tree-error');
        }
        else if (anim.type === 'reveal') {
            // Unhides a previously hidden node and its edge
            const el = document.getElementById(`node-${anim.id}`);
            if(el) el.classList.remove('tree-hidden');
            // Edge removal logic would need searching for it, skip edge CSS hide for now since node hide handles visual pop well enough.
            await sleep(delay);
        }
        else if (anim.type === 'fade_out') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) {
                el.classList.add('tree-hidden'); // fade it completely
                el.style.transform = 'scale(0.1)';
            }
            await sleep(delay);
        }
        else if (anim.type === 'visit_succ') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) el.classList.add('tree-succ');
            await sleep(delay);
        }
        else if (anim.type === 'unvisit_succ') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) el.classList.remove('tree-succ');
        }
        else if (anim.type === 'found_succ') {
            const el = document.getElementById(`node-${anim.id}`);
            if(el) {
                el.classList.remove('tree-succ');
                el.classList.add('tree-found');
            }
            setStatusMessage('Found Successor!');
            await sleep(delay * 1.5);
        }
        else if (anim.type === 'swap_values') {
            setStatusMessage('Swapping Values...');
            // Visually swap using DOM text
            const t1 = document.getElementById(`text-${anim.node1Id}`);
            const t2 = document.getElementById(`text-${anim.node2Id}`);
            if(t1) t1.textContent = anim.val1;
            if(t2) t2.textContent = anim.val2;
            
            const n1 = document.getElementById(`node-${anim.node1Id}`);
            const n2 = document.getElementById(`node-${anim.node2Id}`);
            if(n1) n1.classList.add('tree-found');
            if(n2) n2.classList.add('tree-error'); // highlight swap target in red
            
            await sleep(delay * 2);
        }
    }

    if (!cancelRef.current) {
      if (newRootState && rootTiming === 'after') {
        setTreeRoot(newRootState);
        await sleep(50);
      }
        setIsAnimating(false);
        setIsPaused(false);
        setActiveVariables([]);
        if (selectedAlgo === 'delete' && newRootState) {
            // Apply hard react-state remount if we had a deletion that dropped nodes. 
            // The earlier state update already built it, but we might need cleanup
        }
        clearAllGlows();
        setStatusMessage('Complete!');
        if (statusTimerRef.current) {
          clearTimeout(statusTimerRef.current);
        }
        statusTimerRef.current = setTimeout(() => {
          setStatusMessage('');
          statusTimerRef.current = null;
        }, 3000);
    }
  };

  const handleAction = () => {
    if (isAnimating) {
        setIsPaused(!isPaused);
        return;
    }

    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    
    setStatusMessage('');
    clearAllGlows();
    const val = parseInt(inputValue, 10);
    
    try {
        if (selectedAlgo === 'insert') {
            if (isNaN(val)) return;
            const depth = treeAlgorithms.getMaxDepth(treeRoot);
            if (depth >= 6) {
                setStatusMessage('Tree is too deep to safely visualize!');
                return;
            }
            const { newRoot, animations } = treeAlgorithms.getInsertAnimations(treeRoot, val);
            runAnimation(animations, newRoot);
        } 
        else if (selectedAlgo === 'delete') {
            if (isNaN(val)) return;
            const { newRoot, animations } = treeAlgorithms.getDeleteAnimations(treeRoot, val);
          runAnimation(animations, newRoot, 'after');
        } 
        else if (selectedAlgo === 'search_bst') {
            if (isNaN(val)) return;
            const animations = treeAlgorithms.getSearchAnimations(treeRoot, val);
            runAnimation(animations);
        } 
        else if (selectedAlgo === 'preorder') {
            const animations = treeAlgorithms.getPreOrderAnimations(treeRoot);
            runAnimation(animations);
        } 
        else if (selectedAlgo === 'inorder') {
            const animations = treeAlgorithms.getInOrderAnimations(treeRoot);
            runAnimation(animations);
        } 
        else if (selectedAlgo === 'postorder') {
            const animations = treeAlgorithms.getPostOrderAnimations(treeRoot);
            runAnimation(animations);
        }
    } catch (e) {
        console.error(e);
        setStatusMessage('Error executing action.');
        if (statusTimerRef.current) {
          clearTimeout(statusTimerRef.current);
          statusTimerRef.current = null;
        }
        setIsAnimating(false);
    }
  };

  const requiresInput = ['insert', 'delete', 'search_bst'].includes(selectedAlgo);
  const currentCode = selectedAlgo ? CODE_SNIPPETS[selectedAlgo]?.[codeLanguage] : '';
  const nodeVariablesById = activeVariables.reduce((acc, variable) => {
    if (!variable.nodeId) return acc;
    if (!acc[variable.nodeId]) acc[variable.nodeId] = [];
    acc[variable.nodeId].push(variable);
    return acc;
  }, {});

  /* ─── Render View ─── */
  if (!selectedAlgo) {
    return (
      <div className="sorting-page">
        <div className="sorting-page-header">
          <h2>Tree Algorithms</h2>
          <p>Explore Binary Search Trees (BST) insertions, restructuring, and traversals.</p>
        </div>

        <div className="algo-cards-grid">
          {Object.entries(ALGO_DATA).map(([key, data]) => (
            <div
              key={key}
              className={`algo-card ${hoveredCard === key ? 'hovered' : ''}`}
              onClick={() => {
                if (!user) {
                  onNavigate('auth', 'You have to login first before starting visualization.');
                } else {
                  setSelectedAlgo(key);
                }
              }}
              onMouseEnter={() => setHoveredCard(key)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ '--card-accent': data.color }}
            >
              <div className="algo-card-glow" />
              <div className="algo-card-head">
                <div className="algo-card-icon" style={{ color: data.color }}>{data.icon}</div>
                <span className="algo-card-name">{data.name}</span>
              </div>
              <p className="algo-card-tagline">{data.tagline}</p>
              <p className="algo-card-desc">{data.description}</p>
              <div className="algo-card-stats">
                <div className="stat-row">
                  <span className="stat-key"><Clock size={12} /> Avg/Worst Time</span>
                  <span className="stat-val">{data.timeWorst}</span>
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

  const currentAlgo = ALGO_DATA[selectedAlgo];

  // SVG parameters
  const viewWidth = 1000;
  const viewHeight = 450;
  const nodeRadius = 20;

  return (
    <div className="tree-container" style={{ marginTop: '2rem' }}>
      
      {/* Target/Status HUD floating at the top of the canvas */}
      {statusMessage && (
          <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(5,5,5,0.8)', padding: '10px 20px', borderRadius: '20px', border: '1px solid var(--accent-base)', color: '#fff', zIndex: 100, fontWeight: 600 }}>
              {statusMessage}
          </div>
      )}

      <div className="vis-top-bar">
        <button className="back-btn" onClick={() => { if(isAnimating) cancelAnimation(); setSelectedAlgo(null); }} disabled={isAnimating}>
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

      <div className={`tree-workbench ${showCodePanel ? 'tree-workbench-with-code' : ''}`}>
        <div className="tree-main-column">
          <div className="panel controls-panel">
        
        {requiresInput && (
            <div className="control-group">
                <label className="control-label">Value</label>
                <input 
                    type="number" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    disabled={isAnimating}
                    style={{ width: '100px' }}
                />
            </div>
        )}

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
            <span className="speed-delay">{Math.round(2000 / speedMultiplier)}ms/frame</span>
          </div>
        </div>

            <div className="control-group" style={{ flexDirection: 'row', gap: '0.8rem', alignItems: 'flex-end', height: '100%', marginLeft: 'auto' }}>
              <button onClick={generateInitialTree} disabled={isAnimating} className="icon-btn" title="Generate New Balanced Tree">
                <Shuffle size={18} />
              </button>
          
              <button 
                className="primary play-btn" 
                onClick={handleAction}
                style={{ minWidth: '130px', background: currentAlgo.color }}
              >
                {isAnimating ? (
                  isPaused ? <><Play size={18} /> Resume</> : <><Pause size={18} /> Pause</>
                ) : (
                  <><Play size={18} /> {requiresInput ? selectedAlgo.replace('_bst', '').charAt(0).toUpperCase() + selectedAlgo.replace('_bst', '').slice(1) : 'Traverse'}</>
                )}
              </button>

              <button 
                className="danger-btn" 
                onClick={cancelAnimation} 
                disabled={!isAnimating}
                title="Cancel"
              >
                <Square size={18} /> Cancel
              </button>
            </div>
          </div>

          <div className="panel tree-canvas-panel">
             <svg className="tree-svg" viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="xMidYMid meet">
                {/* Draw Edges first so they are behind nodes */}
                {viewData.edges.map(edge => (
                    <line 
                       key={edge.id}
                       id={edge.id}
                       className={`tree-edge-line tree-edge ${edge.isHidden ? 'tree-hidden' : ''}`}
                       x1={edge.fromX} y1={edge.fromY}
                       x2={edge.toX} y2={edge.toY}
                    />
                ))}
                {/* Draw Nodes */}
                {viewData.nodes.map(node => {
                    const nodeVars = nodeVariablesById[node.id] || [];
                    return (
                      <g 
                         key={node.id} 
                         id={`node-${node.id}`} 
                         className={`tree-node ${node.isHidden ? 'tree-hidden' : ''}`}
                         transform={`translate(${node.x}, ${node.y})`}
                      >
                          {nodeVars.map((variable, index) => {
                              const badgeText = formatVariableBadge(variable);
                              const badgeWidth = Math.max(48, badgeText.length * 6.5 + 18);
                              const badgeX = -badgeWidth / 2;
                              const badgeY = -(nodeRadius + 18 + index * 20);
                              return (
                                <g key={`${variable.name}-${index}`} transform={`translate(0, ${badgeY})`}>
                                  <rect className="tree-var-badge" x={badgeX} y="-10" width={badgeWidth} height="20" rx="10" />
                                  <text className="tree-var-text" x="0" y="0">{badgeText}</text>
                                </g>
                              );
                          })}
                          <circle 
                              className="tree-node-circle" 
                              r={nodeRadius} 
                              cx="0" cy="0" 
                          />
                          <text 
                              id={`text-${node.id}`}
                              className="tree-node-text"
                          >
                              {node.value}
                          </text>
                      </g>
                    );
                })}
             </svg>
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
