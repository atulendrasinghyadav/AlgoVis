import React, { useState } from 'react';
import SortingVisualizer from './components/SortingVisualizer';
import SearchingVisualizer from './components/SearchingVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import CustomAlgoVisualizer from './components/CustomAlgoVisualizer';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import Auth from './components/Auth';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Search, House, BarChart2, GitFork, Network, Code2, UserCircle, LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          
          <div className="capsule-divider"></div>

          {user ? (
            <button className="capsule-link logout" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <button 
              className={`capsule-link get-started ${activeTab === 'auth' ? 'active' : ''}`}
              onClick={() => setActiveTab('auth')}
            >
              <UserCircle size={18} /> Get Started
            </button>
          )}
        </nav>
      </div>

      <main className="main-content">
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'sorting' && <SortingVisualizer />}
        {activeTab === 'searching' && <SearchingVisualizer />}
        {activeTab === 'trees' && <TreeVisualizer />}
        {activeTab === 'graphs' && <GraphVisualizer />}
        {activeTab === 'custom' && <CustomAlgoVisualizer />}
        {activeTab === 'about' && <AboutUs onNavigate={setActiveTab} />}
        {activeTab === 'auth' && <Auth onNavigate={setActiveTab} />}
      </main>
    </div>
  );
}

export default App;
