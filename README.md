# AlgoVis - Advanced Algorithm Visualizer

![AlgoVis Logo](./public/AlgoVis.png)

AlgoVis is a comprehensive, interactive web application designed to help students and developers visualize and understand complex algorithms and data structures. Built with a modern tech stack, it provides a step-by-step visual representation of how algorithms operate in real-time.

## 🚀 Live Demo
[https://algo-vis-kappa.vercel.app/]

## ✨ Features

### 📊 Sorting Algorithms
Visualize how different sorting techniques rearrange data.
- **Bubble Sort**: The simplest comparison-based sort.
- **Selection Sort**: Repeatedly finding the minimum element.
- **Insertion Sort**: Building a sorted array one element at a time.
- **Quick Sort**: Efficient divide-and-conquer using a pivot.
- **Merge Sort**: Stable divide-and-conquer using merging.

### 🔍 Searching Algorithms
See how algorithms find specific data within a collection.
- **Linear Search**: Sequential scan of the array.
- **Binary Search**: Fast searching in sorted arrays using division.

### 🌳 Tree Visualizer *(Premium)*
Interactive Binary Search Tree (BST) operations.
- **Traversals**: In-order, Pre-order, and Post-order visualizations.
- **BST Operations**: Step-by-step Search, Insert, and Delete (with successor logic).
- **Dynamic Layout**: Node positions are recomputed live as the tree grows or shrinks.

### 🕸️ Graph Visualizer *(Premium)*
Pathfinding and traversal on a grid-based graph.
- **BFS (Breadth-First Search)**: Shortest path in unweighted graphs.
- **DFS (Depth-First Search)**: Explores as far as possible along each branch.
- **Dijkstra's Algorithm**: Shortest path in weighted graphs.
- **A* Search**: Heuristic-based efficient pathfinding.
- **Interactive Grid**: Add walls, adjust weights, and set start/end points.

### 💎 Premium Features
- **Tree Algorithms**: All BST operations and traversals.
- **Graph Algorithms**: BFS, DFS, Dijkstra, and A* on the interactive grid.
- **Custom Algorithm Visualizer**: Write and test your own logic using our visualization engine.
- **Profile & Progress Tracking**: Account profile with access level, badges, and per-algorithm completion history in Firestore.

## 🛠️ Tech Stack

- **Frontend**: React 19 SPA built with Vite
- **Styling**: Vanilla CSS (Custom UI components)
- **Icons**: Lucide React
- **Backend Services**: Firebase BaaS (Authentication, Firestore for progress & premium flags)
- **Payments**: Razorpay Checkout (one-time lifetime upgrade)
- **State Management**: React Hooks (useState, useEffect)

## 📁 Project Structure

```text
AlgoVis/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and SVGs
│   ├── components/         # React UI Components and Styles
│   ├── firebase/           # Firebase configuration and services
│   ├── sortingAlgorithms/  # Sorting logic and animation generators
│   ├── searchingAlgorithms/# Searching logic
│   ├── treeAlgorithms/     # Tree data structures and logic
│   ├── graphAlgorithms/    # Pathfinding algorithms
│   ├── App.jsx             # Main application entry and routing
│   └── main.jsx            # React root
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/atulendrasinghyadav/AlgoVis.git
   cd AlgoVis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a project in [Firebase Console](https://console.firebase.google.com/).
   - Add a web app to your Firebase project.
   - Copy your config and replace the placeholders in `src/firebase/firebaseConfig.js`.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---
Built with ❤️ by Atulendra & Vidushi
