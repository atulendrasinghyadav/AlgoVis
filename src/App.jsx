import React, { useState } from 'react';
import SortingVisualizer from './components/SortingVisualizer';
import SearchingVisualizer from './components/SearchingVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import CustomAlgoVisualizer from './components/CustomAlgoVisualizer';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import Auth from './components/Auth';
import Premium from './components/Premium';
import Profile from './components/Profile';
import { auth, db } from './firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { listenToProgress } from './firebase/progressService';
import { Search, House, BarChart2, GitFork, Network, Code2, UserCircle, LogOut, Crown } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [progress, setProgress] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [intendedTab, setIntendedTab] = useState(null);

  React.useEffect(() => {
    let progressUnsubscribe = () => {};
    let userUnsubscribe = () => {};

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Clean up previous listeners
      progressUnsubscribe();
      userUnsubscribe();
      
      setUser(currentUser);

      if (currentUser) {
        // Listen to progress
        progressUnsubscribe = listenToProgress(currentUser.uid, (data) => {
          setProgress(data);
        });

        // Listen to user document for premium status
        const userRef = doc(db, 'users', currentUser.uid);
        userUnsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log('User document updated:', userData);
            setIsPremium(userData.isPremium === true);
          } else {
            console.log('User document does not exist yet.');
            setIsPremium(false);
          }
        }, (error) => {
          console.error('Firestore onSnapshot error:', error);
        });
      } else {
        setIsPremium(false);
        setProgress(null);
      }
    });

    return () => {
      unsubscribe();
      progressUnsubscribe();
      userUnsubscribe();
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

  const handleTabChange = (tab, message = '', nextTab = null) => {
    setActiveTab(tab);
    setAuthMessage(message);
    setIntendedTab(nextTab);
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
            onClick={() => {
              if (!user) {
                handleTabChange('auth', 'You have to login first to access Custom Algorithms.', 'premium');
              } else if (!isPremium) {
                handleTabChange('premium');
              } else {
                handleTabChange('custom');
              }
            }}
          >
            <Crown size={18} className="premium-crown-icon" style={{ color: '#fbbf24' }} /> Custom Algo
          </button>
          
          <div className="capsule-divider"></div>

          {user ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!isPremium && (
                <button 
                  className={`capsule-link upgrade-btn ${activeTab === 'premium' ? 'active' : ''}`}
                  onClick={() => handleTabChange('premium')}
                  style={{ color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}
                >
                  <Crown size={18} /> Upgrade
                </button>
              )}
              <button 
                className={`capsule-link profile-btn ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => handleTabChange('profile')}
              >
                <UserCircle size={18} /> Profile
              </button>
            </div>
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
        {activeTab === 'sorting' && <SortingVisualizer user={user} isPremium={isPremium} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'searching' && <SearchingVisualizer user={user} isPremium={isPremium} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'trees' && <TreeVisualizer user={user} isPremium={isPremium} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'graphs' && <GraphVisualizer user={user} isPremium={isPremium} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'custom' && <CustomAlgoVisualizer user={user} isPremium={isPremium} onNavigate={handleTabChange} progress={progress} />}
        {activeTab === 'about' && <AboutUs onNavigate={handleTabChange} />}
        {activeTab === 'auth' && <Auth onNavigate={handleTabChange} authMessage={authMessage} intendedTab={intendedTab} />}
        {activeTab === 'premium' && <Premium user={user} isPremium={isPremium} onNavigate={handleTabChange} />}
        {activeTab === 'profile' && <Profile user={user} isPremium={isPremium} progress={progress} onNavigate={handleTabChange} />}
      </main>
    </div>
  );
}

export default App;
