import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Square, ArrowLeft, Clock, Route, Waypoints, Waves, Mountain, Eraser, Brush, Flag, LocateFixed, ChevronRight, RotateCcw, Trash2, Shuffle, Code2, CheckCircle2 } from 'lucide-react';
import { markAlgoAsCompleted } from '../firebase/progressService';
import { runAStar, runBFS, runDFS, runDijkstra } from '../graphAlgorithms/pathfindingAlgorithms';
import './GraphVisualizer.css';

const ROWS = 20;
const COLS = 40;

const ALGO_DATA = {
  bfs: {
    name: 'Breadth-First Search (BFS)',
    icon: <Route size={28} />,
    tagline: 'Expands level by level and guarantees shortest path on unweighted grids.',
    description: 'Best for equal-cost movement. Explores all neighbors first, producing very predictable wave-like exploration.',
    complexity: 'O(V + E)',
    weighted: 'No',
    shortest: 'Yes (Unweighted)',
    color: '#22c55e'
  },
  dfs: {
    name: 'Depth-First Search (DFS)',
    icon: <Waypoints size={28} />,
    tagline: 'Dives deep along one branch before backtracking.',
    description: 'Great for traversal demonstrations and maze-like behavior, but not guaranteed to find the shortest route.',
    complexity: 'O(V + E)',
    weighted: 'No',
    shortest: 'No',
    color: '#f97316'
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    icon: <Waves size={28} />,
    tagline: 'Weighted shortest path with provable optimality.',
    description: 'Handles weighted terrain like mud/water and computes minimum total cost from start to destination.',
    complexity: 'O((V + E) log V)',
    weighted: 'Yes',
    shortest: 'Yes',
    color: '#3b82f6'
  },
  astar: {
    name: 'A* Search',
    icon: <Mountain size={28} />,
    tagline: 'Dijkstra + heuristic for faster target-directed routing.',
    description: 'Uses Manhattan distance heuristic to bias exploration toward the goal while preserving optimality on admissible heuristics.',
    complexity: 'O((V + E) log V)',
    weighted: 'Yes',
    shortest: 'Yes',
    color: '#a855f7'
  }
};

  const CODE_SNIPPETS = {
    bfs: {
    cpp: `#include <iostream>
  #include <vector>
  #include <queue>
  #include <string>
  using namespace std;

  struct Cell {
    int r, c;
  };

  int main() {
    // Input format:
    // n m
    // n lines of grid with chars: S(start), E(end), #(wall), .(free)
    int n, m;
    cin >> n >> m;
    vector<string> grid(n);
    for (int i = 0; i < n; i++) cin >> grid[i];

    Cell start{-1, -1}, end{-1, -1};
    for (int r = 0; r < n; r++) {
      for (int c = 0; c < m; c++) {
        if (grid[r][c] == 'S') start = {r, c};
        if (grid[r][c] == 'E') end = {r, c};
      }
    }

    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<Cell> q;
    q.push(start);
    dist[start.r][start.c] = 0;

    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};

    while (!q.empty()) {
      Cell cur = q.front();
      q.pop();

      if (cur.r == end.r && cur.c == end.c) break;

      for (int k = 0; k < 4; k++) {
        int nr = cur.r + dr[k];
        int nc = cur.c + dc[k];

        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        if (grid[nr][nc] == '#') continue;
        if (dist[nr][nc] != -1) continue;

        dist[nr][nc] = dist[cur.r][cur.c] + 1;
        q.push({nr, nc});
      }
    }

    cout << "Shortest steps (BFS): " << dist[end.r][end.c] << "\n";
    return 0;
  }`,
    java: `import java.util.*;

  public class Main {
    static class Cell {
      int r, c;
      Cell(int r, int c) { this.r = r; this.c = c; }
    }

    public static void main(String[] args) {
      // Input format:
      // n m
      // n lines of grid with chars: S(start), E(end), #(wall), .(free)
      Scanner sc = new Scanner(System.in);
      int n = sc.nextInt();
      int m = sc.nextInt();

      char[][] grid = new char[n][m];
      Cell start = null, end = null;

      for (int i = 0; i < n; i++) {
        String line = sc.next();
        for (int j = 0; j < m; j++) {
          grid[i][j] = line.charAt(j);
          if (grid[i][j] == 'S') start = new Cell(i, j);
          if (grid[i][j] == 'E') end = new Cell(i, j);
        }
      }

      int[][] dist = new int[n][m];
      for (int[] row : dist) Arrays.fill(row, -1);

      Queue<Cell> q = new LinkedList<>();
      q.offer(start);
      dist[start.r][start.c] = 0;

      int[] dr = {1, -1, 0, 0};
      int[] dc = {0, 0, 1, -1};

      while (!q.isEmpty()) {
        Cell cur = q.poll();
        if (cur.r == end.r && cur.c == end.c) break;

        for (int k = 0; k < 4; k++) {
          int nr = cur.r + dr[k];
          int nc = cur.c + dc[k];

          if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
          if (grid[nr][nc] == '#') continue;
          if (dist[nr][nc] != -1) continue;

          dist[nr][nc] = dist[cur.r][cur.c] + 1;
          q.offer(new Cell(nr, nc));
        }
      }

      System.out.println("Shortest steps (BFS): " + dist[end.r][end.c]);
    }
  }`
    },
    dfs: {
    cpp: `#include <iostream>
  #include <vector>
  #include <stack>
  #include <string>
  using namespace std;

  struct Cell {
    int r, c;
  };

  int main() {
    // Input format:
    // n m
    // n lines of grid with chars: S(start), E(end), #(wall), .(free)
    int n, m;
    cin >> n >> m;
    vector<string> grid(n);
    for (int i = 0; i < n; i++) cin >> grid[i];

    Cell start{-1, -1}, end{-1, -1};
    for (int r = 0; r < n; r++) {
      for (int c = 0; c < m; c++) {
        if (grid[r][c] == 'S') start = {r, c};
        if (grid[r][c] == 'E') end = {r, c};
      }
    }

    vector<vector<int>> visited(n, vector<int>(m, 0));
    stack<Cell> st;
    st.push(start);

    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};

    bool found = false;
    while (!st.empty()) {
      Cell cur = st.top();
      st.pop();

      if (visited[cur.r][cur.c]) continue;
      visited[cur.r][cur.c] = 1;

      if (cur.r == end.r && cur.c == end.c) {
        found = true;
        break;
      }

      for (int k = 0; k < 4; k++) {
        int nr = cur.r + dr[k];
        int nc = cur.c + dc[k];
        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        if (grid[nr][nc] == '#' || visited[nr][nc]) continue;
        st.push({nr, nc});
      }
    }

    cout << (found ? "Path exists (DFS)" : "No path (DFS)") << "\n";
    return 0;
  }`,
    java: `import java.util.*;

  public class Main {
    static class Cell {
      int r, c;
      Cell(int r, int c) { this.r = r; this.c = c; }
    }

    public static void main(String[] args) {
      // Input format:
      // n m
      // n lines of grid with chars: S(start), E(end), #(wall), .(free)
      Scanner sc = new Scanner(System.in);
      int n = sc.nextInt();
      int m = sc.nextInt();

      char[][] grid = new char[n][m];
      Cell start = null, end = null;

      for (int i = 0; i < n; i++) {
        String line = sc.next();
        for (int j = 0; j < m; j++) {
          grid[i][j] = line.charAt(j);
          if (grid[i][j] == 'S') start = new Cell(i, j);
          if (grid[i][j] == 'E') end = new Cell(i, j);
        }
      }

      boolean[][] visited = new boolean[n][m];
      Deque<Cell> stack = new ArrayDeque<>();
      stack.push(start);

      int[] dr = {1, -1, 0, 0};
      int[] dc = {0, 0, 1, -1};

      boolean found = false;
      while (!stack.isEmpty()) {
        Cell cur = stack.pop();
        if (visited[cur.r][cur.c]) continue;
        visited[cur.r][cur.c] = true;

        if (cur.r == end.r && cur.c == end.c) {
          found = true;
          break;
        }

        for (int k = 0; k < 4; k++) {
          int nr = cur.r + dr[k];
          int nc = cur.c + dc[k];
          if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
          if (grid[nr][nc] == '#' || visited[nr][nc]) continue;
          stack.push(new Cell(nr, nc));
        }
      }

      System.out.println(found ? "Path exists (DFS)" : "No path (DFS)");
    }
  }`
    },
    dijkstra: {
    cpp: `#include <iostream>
  #include <vector>
  #include <queue>
  #include <climits>
  using namespace std;

  struct Node {
    int cost, r, c;
    bool operator>(const Node& other) const {
      return cost > other.cost;
    }
  };

  int main() {
    // Input format:
    // n m
    // n rows of weights:
    //   -1 means wall, any positive number means cost of entering that cell
    // sr sc
    // er ec
    int n, m;
    cin >> n >> m;

    vector<vector<int>> w(n, vector<int>(m));
    for (int i = 0; i < n; i++) {
      for (int j = 0; j < m; j++) {
        cin >> w[i][j];
      }
    }

    int sr, sc, er, ec;
    cin >> sr >> sc >> er >> ec;

    vector<vector<int>> dist(n, vector<int>(m, INT_MAX));
    priority_queue<Node, vector<Node>, greater<Node>> pq;
    dist[sr][sc] = 0;
    pq.push({0, sr, sc});

    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};

    while (!pq.empty()) {
      Node cur = pq.top();
      pq.pop();
      if (cur.cost != dist[cur.r][cur.c]) continue;
      if (cur.r == er && cur.c == ec) break;

      for (int k = 0; k < 4; k++) {
        int nr = cur.r + dr[k];
        int nc = cur.c + dc[k];
        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        if (w[nr][nc] == -1) continue;

        int nextCost = cur.cost + w[nr][nc];
        if (nextCost < dist[nr][nc]) {
          dist[nr][nc] = nextCost;
          pq.push({nextCost, nr, nc});
        }
      }
    }

    if (dist[er][ec] == INT_MAX) cout << "No path\n";
    else cout << "Minimum cost (Dijkstra): " << dist[er][ec] << "\n";
    return 0;
  }`,
    java: `import java.util.*;

  public class Main {
    static class Node {
      int cost, r, c;
      Node(int cost, int r, int c) {
        this.cost = cost; this.r = r; this.c = c;
      }
    }

    public static void main(String[] args) {
      // Input format:
      // n m
      // n rows of weights:
      //   -1 means wall, any positive number means cost of entering that cell
      // sr sc
      // er ec
      Scanner sc = new Scanner(System.in);
      int n = sc.nextInt(), m = sc.nextInt();

      int[][] w = new int[n][m];
      for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
          w[i][j] = sc.nextInt();
        }
      }

      int sr = sc.nextInt(), sCol = sc.nextInt();
      int er = sc.nextInt(), eCol = sc.nextInt();

      int[][] dist = new int[n][m];
      for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);

      PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a.cost));
      dist[sr][sCol] = 0;
      pq.offer(new Node(0, sr, sCol));

      int[] dr = {1, -1, 0, 0};
      int[] dc = {0, 0, 1, -1};

      while (!pq.isEmpty()) {
        Node cur = pq.poll();
        if (cur.cost != dist[cur.r][cur.c]) continue;
        if (cur.r == er && cur.c == eCol) break;

        for (int k = 0; k < 4; k++) {
          int nr = cur.r + dr[k];
          int nc = cur.c + dc[k];
          if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
          if (w[nr][nc] == -1) continue;

          int nextCost = cur.cost + w[nr][nc];
          if (nextCost < dist[nr][nc]) {
            dist[nr][nc] = nextCost;
            pq.offer(new Node(nextCost, nr, nc));
          }
        }
      }

      if (dist[er][eCol] == Integer.MAX_VALUE) System.out.println("No path");
      else System.out.println("Minimum cost (Dijkstra): " + dist[er][eCol]);
    }
  }`
    },
    astar: {
    cpp: `#include <iostream>
  #include <vector>
  #include <queue>
  #include <climits>
  using namespace std;

  struct Node {
    int f, g, r, c;
    bool operator>(const Node& other) const {
      return f > other.f;
    }
  };

  int h(int r, int c, int er, int ec) {
    return abs(r - er) + abs(c - ec); // Manhattan distance
  }

  int main() {
    // Input format:
    // n m
    // n rows of weights:
    //   -1 means wall, any positive number means cost of entering that cell
    // sr sc
    // er ec
    int n, m;
    cin >> n >> m;

    vector<vector<int>> w(n, vector<int>(m));
    for (int i = 0; i < n; i++) {
      for (int j = 0; j < m; j++) {
        cin >> w[i][j];
      }
    }

    int sr, sc, er, ec;
    cin >> sr >> sc >> er >> ec;

    vector<vector<int>> gScore(n, vector<int>(m, INT_MAX));
    priority_queue<Node, vector<Node>, greater<Node>> pq;

    gScore[sr][sc] = 0;
    pq.push({h(sr, sc, er, ec), 0, sr, sc});

    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};

    while (!pq.empty()) {
      Node cur = pq.top();
      pq.pop();

      if (cur.g != gScore[cur.r][cur.c]) continue;
      if (cur.r == er && cur.c == ec) break;

      for (int k = 0; k < 4; k++) {
        int nr = cur.r + dr[k];
        int nc = cur.c + dc[k];
        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        if (w[nr][nc] == -1) continue;

        int nextG = cur.g + w[nr][nc];
        if (nextG < gScore[nr][nc]) {
          gScore[nr][nc] = nextG;
          int nextF = nextG + h(nr, nc, er, ec);
          pq.push({nextF, nextG, nr, nc});
        }
      }
    }

    if (gScore[er][ec] == INT_MAX) cout << "No path\n";
    else cout << "Minimum cost (A*): " << gScore[er][ec] << "\n";
    return 0;
  }`,
    java: `import java.util.*;

  public class Main {
    static class Node {
      int f, g, r, c;
      Node(int f, int g, int r, int c) {
        this.f = f; this.g = g; this.r = r; this.c = c;
      }
    }

    static int h(int r, int c, int er, int ec) {
      return Math.abs(r - er) + Math.abs(c - ec);
    }

    public static void main(String[] args) {
      // Input format:
      // n m
      // n rows of weights:
      //   -1 means wall, any positive number means cost of entering that cell
      // sr sc
      // er ec
      Scanner sc = new Scanner(System.in);
      int n = sc.nextInt(), m = sc.nextInt();

      int[][] w = new int[n][m];
      for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
          w[i][j] = sc.nextInt();
        }
      }

      int sr = sc.nextInt(), sCol = sc.nextInt();
      int er = sc.nextInt(), eCol = sc.nextInt();

      int[][] gScore = new int[n][m];
      for (int[] row : gScore) Arrays.fill(row, Integer.MAX_VALUE);

      PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a.f));
      gScore[sr][sCol] = 0;
      pq.offer(new Node(h(sr, sCol, er, eCol), 0, sr, sCol));

      int[] dr = {1, -1, 0, 0};
      int[] dc = {0, 0, 1, -1};

      while (!pq.isEmpty()) {
        Node cur = pq.poll();
        if (cur.g != gScore[cur.r][cur.c]) continue;
        if (cur.r == er && cur.c == eCol) break;

        for (int k = 0; k < 4; k++) {
          int nr = cur.r + dr[k];
          int nc = cur.c + dc[k];
          if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
          if (w[nr][nc] == -1) continue;

          int nextG = cur.g + w[nr][nc];
          if (nextG < gScore[nr][nc]) {
            gScore[nr][nc] = nextG;
            int nextF = nextG + h(nr, nc, er, eCol);
            pq.offer(new Node(nextF, nextG, nr, nc));
          }
        }
      }

      if (gScore[er][eCol] == Integer.MAX_VALUE) System.out.println("No path");
      else System.out.println("Minimum cost (A*): " + gScore[er][eCol]);
    }
  }`
    }
  };

function createCell(row, col, startPos, endPos) {
  return {
    row,
    col,
    isStart: row === startPos.row && col === startPos.col,
    isEnd: row === endPos.row && col === endPos.col,
    isWall: false,
    weight: 1,
    state: 'idle'
  };
}

function buildGrid(startPos, endPos) {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => createCell(row, col, startPos, endPos))
  );
}
function cloneGrid(grid) {
  return grid.map((r) => r.map((c) => ({ ...c })));
}

export default function GraphVisualizer({ user, onNavigate, progress }) {
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(6);
  const [tool, setTool] = useState('wall');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [showCodePanel, setShowCodePanel] = useState(true);

  const [startPos, setStartPos] = useState({ row: 10, col: 8 });
  const [endPos, setEndPos] = useState({ row: 10, col: 31 });
  const [grid, setGrid] = useState(() => buildGrid({ row: 10, col: 8 }, { row: 10, col: 31 }));

  const isPausedRef = useRef(false);
  const cancelRef = useRef(false);
  const speedRef = useRef(speedMultiplier);
  const interactionRef = useRef({
    mouseDown: false,
    mode: null
  });
  const statusTimerRef = useRef(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    if (selectedAlgo) {
      setCodeLanguage('cpp');
    }
  }, [selectedAlgo]);

  useEffect(() => {
    const onMouseUp = () => {
      interactionRef.current.mouseDown = false;
      interactionRef.current.mode = null;
    };
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  const currentAlgo = selectedAlgo ? ALGO_DATA[selectedAlgo] : null;
  const currentCode = selectedAlgo ? CODE_SNIPPETS[selectedAlgo]?.[codeLanguage] : '';

  const getDelay = () => 140 / speedRef.current;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const showStatus = (message) => {
    setStatusMessage(message);
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }
    statusTimerRef.current = setTimeout(() => {
      setStatusMessage('');
      statusTimerRef.current = null;
    }, 3000);
  };

  const clearPath = () => {
    if (isRunning) return;
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          state: 'idle'
        }))
      )
    );
    showStatus('Path and visited cells cleared.');
  };

  const clearBoard = () => {
    if (isRunning) return;
    const next = buildGrid(startPos, endPos);
    setGrid(next);
    showStatus('Board reset.');
  };

  const randomWalls = () => {
    if (isRunning) return;
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => {
          if (cell.isStart || cell.isEnd) return { ...cell, isWall: false, state: 'idle' };
          const wall = Math.random() < 0.23;
          return { ...cell, isWall: wall, weight: wall ? 1 : cell.weight, state: 'idle' };
        })
      )
    );
    showStatus('Random obstacle field generated.');
  };

  const updateCellWithTool = (baseGrid, row, col, activeTool) => {
    const next = cloneGrid(baseGrid);
    const cell = { ...next[row][col] };
    if (cell.isStart || cell.isEnd) return baseGrid;

    if (activeTool === 'wall') {
      cell.isWall = true;
      cell.weight = 1;
    } else if (activeTool === 'erase') {
      cell.isWall = false;
      cell.weight = 1;
    } else if (activeTool === 'mud') {
      cell.isWall = false;
      cell.weight = 3;
    } else if (activeTool === 'water') {
      cell.isWall = false;
      cell.weight = 7;
    }

    cell.state = 'idle';
    next[row][col] = cell;
    return next;
  };

  const moveSpecialNode = (type, row, col) => {
    setGrid((prev) => {
      const next = cloneGrid(prev);
      if (type === 'start') {
        next[startPos.row][startPos.col] = {
          ...next[startPos.row][startPos.col],
          isStart: false,
          state: 'idle'
        };
        next[row][col] = {
          ...next[row][col],
          isStart: true,
          isWall: false,
          weight: 1,
          state: 'idle'
        };
      } else {
        next[endPos.row][endPos.col] = {
          ...next[endPos.row][endPos.col],
          isEnd: false,
          state: 'idle'
        };
        next[row][col] = {
          ...next[row][col],
          isEnd: true,
          isWall: false,
          weight: 1,
          state: 'idle'
        };
      }
      return next;
    });

    if (type === 'start') setStartPos({ row, col });
    if (type === 'end') setEndPos({ row, col });
  };

  const handleCellMouseDown = (row, col) => {
    if (isRunning) return;
    const cell = grid[row][col];
    interactionRef.current.mouseDown = true;

    if (cell.isStart) {
      interactionRef.current.mode = 'drag-start';
      return;
    }
    if (cell.isEnd) {
      interactionRef.current.mode = 'drag-end';
      return;
    }

    interactionRef.current.mode = 'paint';
    setGrid((prev) => updateCellWithTool(prev, row, col, tool));
  };

  const handleCellMouseEnter = (row, col) => {
    if (isRunning) return;
    if (!interactionRef.current.mouseDown) return;

    if (interactionRef.current.mode === 'drag-start') {
      if (grid[row][col].isEnd) return;
      moveSpecialNode('start', row, col);
      return;
    }

    if (interactionRef.current.mode === 'drag-end') {
      if (grid[row][col].isStart) return;
      moveSpecialNode('end', row, col);
      return;
    }

    if (interactionRef.current.mode === 'paint') {
      setGrid((prev) => updateCellWithTool(prev, row, col, tool));
    }
  };

  const handleCellMouseUp = () => {
    interactionRef.current.mouseDown = false;
    interactionRef.current.mode = null;
  };

  const runSelectedAlgorithm = useMemo(() => {
    if (selectedAlgo === 'bfs') return runBFS;
    if (selectedAlgo === 'dfs') return runDFS;
    if (selectedAlgo === 'dijkstra') return runDijkstra;
    return runAStar;
  }, [selectedAlgo]);

  const stopRun = () => {
    cancelRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
  };

  const animateRun = async () => {
    if (!selectedAlgo) return;

    // Mark as completed in Firebase
    if (user) {
      markAlgoAsCompleted(user.uid, 'graphs', selectedAlgo);
    }

    setGrid((prev) =>
      prev.map((row) => row.map((cell) => ({ ...cell, state: 'idle' })))
    );

    const result = runSelectedAlgorithm(grid, startPos, endPos);

    setIsRunning(true);
    setIsPaused(false);
    isPausedRef.current = false;
    cancelRef.current = false;

    for (const step of result.visitedOrder) {
      if (cancelRef.current) break;
      while (isPausedRef.current && !cancelRef.current) {
        await sleep(50);
      }
      if (cancelRef.current) break;

      setGrid((prev) => {
        const next = cloneGrid(prev);
        const cell = next[step.row][step.col];
        if (!cell.isStart && !cell.isEnd && !cell.isWall && cell.state === 'idle') {
          next[step.row][step.col] = { ...cell, state: 'visited' };
        }
        return next;
      });
      await sleep(getDelay());
    }

    if (!cancelRef.current && result.found) {
      for (const step of result.path) {
        if (cancelRef.current) break;
        while (isPausedRef.current && !cancelRef.current) {
          await sleep(50);
        }
        if (cancelRef.current) break;

        setGrid((prev) => {
          const next = cloneGrid(prev);
          const cell = next[step.row][step.col];
          if (!cell.isStart && !cell.isEnd && !cell.isWall) {
            next[step.row][step.col] = { ...cell, state: 'path' };
          }
          return next;
        });
        await sleep(Math.max(15, getDelay() / 1.7));
      }
    }

    if (!cancelRef.current) {
      showStatus(result.found ? 'Path found.' : 'No path found for current board.');
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const handleRunClick = () => {
    if (isRunning) {
      setIsPaused((prev) => !prev);
      return;
    }
    animateRun();
  };

  if (!selectedAlgo) {
    return (
      <div className="sorting-page graph-page">
        <div className="sorting-page-header">
          <h2>Graph & Pathfinding Algorithms</h2>
          <p>Use a 2D grid like a map. Build walls, paint weighted terrain, and watch how each strategy explores.</p>
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
                {progress?.graphs?.[key] && (
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
                  <span className="stat-key"><Clock size={12} /> Time</span>
                  <span className="stat-val">{data.complexity}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key">Weighted Graph</span>
                  <span className="stat-val">{data.weighted}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-key">Shortest Path</span>
                  <span className="stat-val">{data.shortest}</span>
                </div>
              </div>

              <div className="algo-card-cta">
                <span>Open Grid Lab</span> <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const speedDelay = Math.round(140 / speedMultiplier);

  return (
    <div className="searching-container graph-container" style={{ marginTop: '2rem' }}>
      <div className="vis-top-bar">
        <button
          className="back-btn"
          onClick={() => {
            if (isRunning) stopRun();
            setSelectedAlgo(null);
            setStatusMessage('');
            if (statusTimerRef.current) {
              clearTimeout(statusTimerRef.current);
              statusTimerRef.current = null;
            }
          }}
          disabled={isRunning}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="vis-algo-badge" style={{ '--card-accent': currentAlgo.color }}>
          <span className="vis-algo-icon" style={{ color: currentAlgo.color }}>{currentAlgo.icon}</span>
          <span>{currentAlgo.name}</span>
        </div>
        <button
          className={`graph-code-toggle-btn ${showCodePanel ? 'active' : ''}`}
          onClick={() => setShowCodePanel((prev) => !prev)}
        >
          <Code2 size={16} /> {showCodePanel ? 'Hide Code' : 'Show Code'}
        </button>
      </div>

      {statusMessage && (
        <div className="graph-toast">{statusMessage}</div>
      )}

      <div className={`graph-workbench ${showCodePanel ? 'graph-workbench-with-code' : ''}`}>
        <div className="graph-lab-column">
          <div className="panel controls-panel graph-controls-panel">
            <div className="control-group">
              <label className="control-label">Paint Tool</label>
              <div className="graph-tool-grid">
                <button className={`graph-tool-btn ${tool === 'wall' ? 'active' : ''}`} onClick={() => setTool('wall')} disabled={isRunning}>
                  <Brush size={14} /> Walls
                </button>
                <button className={`graph-tool-btn ${tool === 'mud' ? 'active' : ''}`} onClick={() => setTool('mud')} disabled={isRunning}>
                  <Waves size={14} /> Mud x3
                </button>
                <button className={`graph-tool-btn ${tool === 'water' ? 'active' : ''}`} onClick={() => setTool('water')} disabled={isRunning}>
                  <Mountain size={14} /> Water x7
                </button>
                <button className={`graph-tool-btn ${tool === 'erase' ? 'active' : ''}`} onClick={() => setTool('erase')} disabled={isRunning}>
                  <Eraser size={14} /> Erase
                </button>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Speed</label>
              <input
                type="range"
                min="1"
                max="12"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              />
              <div className="speed-indicator">
                <span className="speed-label">{speedMultiplier}x</span>
                <span className="speed-delay">{speedDelay}ms/step</span>
              </div>
            </div>

            <div className="control-group graph-actions">
              <button onClick={randomWalls} disabled={isRunning} className="icon-btn" title="Random walls">
                <Shuffle size={18} />
              </button>
              <button onClick={clearPath} disabled={isRunning} className="icon-btn" title="Clear path">
                <RotateCcw size={18} />
              </button>
              <button onClick={clearBoard} disabled={isRunning} className="icon-btn" title="Clear board">
                <Trash2 size={18} />
              </button>
              <button className="primary play-btn" onClick={handleRunClick} style={{ minWidth: '120px', background: currentAlgo.color }}>
                {isRunning ? (isPaused ? <><Play size={18} /> Resume</> : <><Pause size={18} /> Pause</>) : <><Play size={18} /> Run</>}
              </button>
              <button className="danger-btn" onClick={stopRun} disabled={!isRunning}>
                <Square size={18} /> Cancel
              </button>
            </div>
          </div>

          <div className="panel graph-board-panel">
            <div className="graph-legend">
              <span><LocateFixed size={12} /> Drag Start</span>
              <span><Flag size={12} /> Drag End</span>
              <span><Brush size={12} /> Click + Drag to paint</span>
            </div>

            <div className="graph-grid" onMouseLeave={handleCellMouseUp}>
              {grid.map((row, rIdx) => (
                <div key={rIdx} className="graph-row">
                  {row.map((cell) => {
                    let cls = 'graph-cell';
                    if (cell.isStart) cls += ' cell-start';
                    else if (cell.isEnd) cls += ' cell-end';
                    else if (cell.isWall) cls += ' cell-wall';
                    else if (cell.state === 'path') cls += ' cell-path';
                    else if (cell.state === 'visited') cls += ' cell-visited';
                    else if (cell.weight >= 7) cls += ' cell-water';
                    else if (cell.weight >= 3) cls += ' cell-mud';

                    return (
                      <div
                        key={`${cell.row}-${cell.col}`}
                        className={cls}
                        onMouseDown={() => handleCellMouseDown(cell.row, cell.col)}
                        onMouseEnter={() => handleCellMouseEnter(cell.row, cell.col)}
                        onMouseUp={handleCellMouseUp}
                      >
                        {cell.isStart ? 'S' : cell.isEnd ? 'E' : cell.weight > 1 && !cell.isWall ? cell.weight : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
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
            <pre className="graph-code-block"><code>{currentCode}</code></pre>
          </div>
        </aside>
        )}
      </div>
    </div>
  );
}
