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
import { listenToProgress } from './firebase/progressService';
import { Search, House, BarChart2, GitFork, Network, Code2, UserCircle, LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [authMessage, setAuthMessage] = useState('');

  React.useEffect(() => {
    let progressUnsubscribe = () => {};

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Clean up previous progress listener
      progressUnsubscribe();
      
      if (currentUser) {
        // Start listening to progress for the new user
        progressUnsubscribe = listenToProgress(currentUser.uid, (data) => {
          setProgress(data);
        });
      } else {
        setProgress(null);
      }
    });

    return () => {
      unsubscribe();
      progressUnsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTabChange = (tab, message = '') => {
    setActiveTab(tab);
    setAuthMessage(message);
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <nav className="capsule-nav">
          <button 
            className={`capsule-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabChange('home')}
          >
            <House size={18} /> Home
          </button>
          <button 
            className={`capsule-link ${activeTab === 'sorting' ? 'active' : ''}`}
            onClick={() => handleTabChange('sorting')}
          >
            <BarChart2 size={18} /> Sorting
          </button>
          <button 
            className={`capsule-link ${activeTab === 'searching' ? 'active' : ''}`}
            onClick={() => handleTabChange('searching')}
          >
            <Search size={18} /> Searching
          </button>
          <button 
            className={`capsule-link ${activeTab === 'trees' ? 'active' : ''}`}
            onClick={() => handleTabChange('trees')}
          >
            <GitFork size={18} /> Trees
          </button>
          <button 
            className={`capsule-link ${activeTab === 'graphs' ? 'active' : ''}`}
            onClick={() => handleTabChange('graphs')}
          >
            <Network size={18} /> Graphs
          </button>
          <button 
            className={`capsule-link ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => handleTabChange('custom')}
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
              onClick={() => handleTabChange('auth')}
            >
              <UserCircle size={18} /> Get Started
            </button>
          )}
        </nav>
      </div>

      <main className="main-content">
        {activeTab === 'home' && <Home onNavigate={handleTabChange} />}
        {activeTab === 'sorting' && <SortingVisualizer user={user} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'searching' && <SearchingVisualizer user={user} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'trees' && <TreeVisualizer user={user} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'graphs' && <GraphVisualizer user={user} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'custom' && <CustomAlgoVisualizer user={user} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'about' && <AboutUs onNavigate={handleTabChange} />}
        {activeTab === 'auth' && <Auth onNavigate={handleTabChange} authMessage={authMessage} />}
      </main>
    </div>
  );
}

export default App;
