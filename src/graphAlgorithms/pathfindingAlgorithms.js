export function keyOf(row, col) {
  return `${row}-${col}`;
}

function reconstructPath(parents, endKey) {
  const path = [];
  let curr = endKey;
  while (curr && parents.has(curr)) {
    const [row, col] = curr.split('-').map(Number);
    path.push({ row, col });
    curr = parents.get(curr);
  }
  path.reverse();
  return path;
}

function getNeighbors(node, rows, cols) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  const out = [];
  for (const [dr, dc] of dirs) {
    const nr = node.row + dr;
    const nc = node.col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      out.push({ row: nr, col: nc });
    }
  }
  return out;
}

export function runBFS(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const q = [{ row: start.row, col: start.col }];
  const seen = new Set([keyOf(start.row, start.col)]);
  const parents = new Map([[keyOf(start.row, start.col), null]]);
  const visitedOrder = [];

  while (q.length) {
    const curr = q.shift();
    const currKey = keyOf(curr.row, curr.col);
    visitedOrder.push(curr);
    if (curr.row === end.row && curr.col === end.col) {
      return {
        visitedOrder,
        path: reconstructPath(parents, currKey),
        found: true
      };
    }

    for (const n of getNeighbors(curr, rows, cols)) {
      const nKey = keyOf(n.row, n.col);
      if (seen.has(nKey)) continue;
      if (grid[n.row][n.col].isWall) continue;
      seen.add(nKey);
      parents.set(nKey, currKey);
      q.push(n);
    }
  }

  return { visitedOrder, path: [], found: false };
}

export function runDFS(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const stack = [{ row: start.row, col: start.col }];
  const seen = new Set();
  const parents = new Map([[keyOf(start.row, start.col), null]]);
  const visitedOrder = [];

  while (stack.length) {
    const curr = stack.pop();
    const currKey = keyOf(curr.row, curr.col);
    if (seen.has(currKey)) continue;
    seen.add(currKey);
    visitedOrder.push(curr);

    if (curr.row === end.row && curr.col === end.col) {
      return {
        visitedOrder,
        path: reconstructPath(parents, currKey),
        found: true
      };
    }

    const neighbors = getNeighbors(curr, rows, cols).reverse();
    for (const n of neighbors) {
      const nKey = keyOf(n.row, n.col);
      if (seen.has(nKey)) continue;
      if (grid[n.row][n.col].isWall) continue;
      if (!parents.has(nKey)) parents.set(nKey, currKey);
      stack.push(n);
    }
  }

  return { visitedOrder, path: [], found: false };
}

function extractMin(openArr, scoreMap) {
  let bestIdx = 0;
  let bestScore = Infinity;
  for (let i = 0; i < openArr.length; i++) {
    const k = keyOf(openArr[i].row, openArr[i].col);
    const s = scoreMap.get(k) ?? Infinity;
    if (s < bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }
  return openArr.splice(bestIdx, 1)[0];
}

export function runDijkstra(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const dist = new Map();
  const parents = new Map([[keyOf(start.row, start.col), null]]);
  const open = [{ row: start.row, col: start.col }];
  const inOpen = new Set([keyOf(start.row, start.col)]);
  const visited = new Set();
  const visitedOrder = [];
  dist.set(keyOf(start.row, start.col), 0);

  while (open.length) {
    const curr = extractMin(open, dist);
    const currKey = keyOf(curr.row, curr.col);
    inOpen.delete(currKey);
    if (visited.has(currKey)) continue;
    visited.add(currKey);
    visitedOrder.push(curr);

    if (curr.row === end.row && curr.col === end.col) {
      return {
        visitedOrder,
        path: reconstructPath(parents, currKey),
        found: true
      };
    }

    for (const n of getNeighbors(curr, rows, cols)) {
      const nKey = keyOf(n.row, n.col);
      if (visited.has(nKey)) continue;
      const cell = grid[n.row][n.col];
      if (cell.isWall) continue;
      const moveCost = Math.max(1, cell.weight || 1);
      const nextDist = (dist.get(currKey) ?? Infinity) + moveCost;
      if (nextDist < (dist.get(nKey) ?? Infinity)) {
        dist.set(nKey, nextDist);
        parents.set(nKey, currKey);
        if (!inOpen.has(nKey)) {
          open.push(n);
          inOpen.add(nKey);
        }
      }
    }
  }

  return { visitedOrder, path: [], found: false };
}

function manhattan(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function runAStar(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const gScore = new Map([[keyOf(start.row, start.col), 0]]);
  const fScore = new Map([[keyOf(start.row, start.col), manhattan(start, end)]]);
  const parents = new Map([[keyOf(start.row, start.col), null]]);
  const open = [{ row: start.row, col: start.col }];
  const inOpen = new Set([keyOf(start.row, start.col)]);
  const closed = new Set();
  const visitedOrder = [];

  while (open.length) {
    const curr = extractMin(open, fScore);
    const currKey = keyOf(curr.row, curr.col);
    inOpen.delete(currKey);
    if (closed.has(currKey)) continue;

    closed.add(currKey);
    visitedOrder.push(curr);

    if (curr.row === end.row && curr.col === end.col) {
      return {
        visitedOrder,
        path: reconstructPath(parents, currKey),
        found: true
      };
    }

    for (const n of getNeighbors(curr, rows, cols)) {
      const nKey = keyOf(n.row, n.col);
      if (closed.has(nKey)) continue;
      const cell = grid[n.row][n.col];
      if (cell.isWall) continue;

      const moveCost = Math.max(1, cell.weight || 1);
      const tentativeG = (gScore.get(currKey) ?? Infinity) + moveCost;

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        parents.set(nKey, currKey);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + manhattan(n, end));
        if (!inOpen.has(nKey)) {
          open.push(n);
          inOpen.add(nKey);
        }
      }
    }
  }

  return { visitedOrder, path: [], found: false };
}
