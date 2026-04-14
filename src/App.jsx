import React, { useState } from 'react';
import SortingVisualizer from './components/SortingVisualizer';
import SearchingVisualizer from './components/SearchingVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import Home from './components/Home';
import { Search, House, BarChart2, GitFork, Network, Code2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-container">
      <div className="header-container">
        <nav className="capsule-nav">
          <button 
            className={`capsule-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <House size={18} /> Home
          </button>
          <button 
            className={`capsule-link ${activeTab === 'sorting' ? 'active' : ''}`}
            onClick={() => setActiveTab('sorting')}
          >
            <BarChart2 size={18} /> Sorting
          </button>
          <button 
            className={`capsule-link ${activeTab === 'searching' ? 'active' : ''}`}
            onClick={() => setActiveTab('searching')}
          >
            <Search size={18} /> Searching
          </button>
          <button 
            className={`capsule-link ${activeTab === 'trees' ? 'active' : ''}`}
            onClick={() => setActiveTab('trees')}
          >
            <GitFork size={18} /> Trees
          </button>
          <button 
            className={`capsule-link ${activeTab === 'graphs' ? 'active' : ''}`}
            onClick={() => setActiveTab('graphs')}
          >
            <Network size={18} /> Graphs
          </button>
          <button 
            className={`capsule-link ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <Code2 size={18} /> Custom Algo
          </button>
        </nav>
      </div>

      <main className="main-content">
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'sorting' && <SortingVisualizer />}
        {activeTab === 'searching' && <SearchingVisualizer />}
        {activeTab === 'trees' && <TreeVisualizer />}
        {activeTab === 'graphs' && <GraphVisualizer />}
        {activeTab === 'custom' && (
          <div className="placeholder-panel">
            <h2>Custom Algorithm</h2>
            <p>Create and visualize your own algorithm in this tab.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
