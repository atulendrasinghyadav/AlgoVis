# AlgoVis - Advanced Algorithm Visualizer

![AlgoVis Logo](./public/AlgoVis.png)

AlgoVis is a comprehensive, interactive web application designed to help students and developers visualize and understand complex algorithms and data structures. Built with a modern tech stack, it provides a step-by-step visual representation of how algorithms operate in real-time.

## 🚀 Live Demo
[Insert Live Link Here - e.g., https://algovis-pro.web.app]

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

### 🌳 Tree Visualizer
Interactive Binary Search Tree (BST) operations.
- **Traversals**: In-order, Pre-order, and Post-order visualizations.
- **BST Operations**: Step-by-step Search, Insert, and Delete (with successor logic).
- **Auto-Balancing Logic**: Visualizes tree structure dynamically.

### 🕸️ Graph Visualizer
Pathfinding and traversal on a grid-based graph.
- **BFS (Breadth-First Search)**: Shortest path in unweighted graphs.
- **DFS (Depth-First Search)**: Explores as far as possible along each branch.
- **Dijkstra's Algorithm**: Shortest path in weighted graphs.
- **A* Search**: Heuristic-based efficient pathfinding.
- **Interactive Grid**: Add walls, adjust weights, and set start/end points.

### 💎 Premium Features
- **Custom Algorithm Visualizer**: Write and test your own logic using our visualization engine.
- **Progress Tracking**: Save your learning journey and track completed algorithms.
- **Ad-free Experience**: Focus entirely on learning.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Vanilla CSS (Custom UI components)
- **Icons**: Lucide React
- **Backend/Database**: Firebase (Authentication, Firestore)
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
   git clone https://github.com/your-username/AlgoVis.git
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
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by [Your Name/Team]
