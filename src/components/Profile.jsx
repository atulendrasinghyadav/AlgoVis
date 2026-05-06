import React from 'react';
import { User, Mail, Crown, BarChart2, CheckCircle2, LogOut, History, Zap, ShieldCheck } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import './Profile.css';

const CATEGORY_LABELS = {
  sorting: 'Sorting',
  searching: 'Searching',
  trees: 'Trees',
  graphs: 'Graphs',
  custom: 'Custom Algo'
};

const ALGO_LABELS = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  insertion: 'Insertion Sort',
  merge: 'Merge Sort',
  quick: 'Quick Sort',
  linear: 'Linear Search',
  binary: 'Binary Search',
  insert: 'BST Insertion',
  delete: 'BST Deletion',
  search_bst: 'BST Search',
  preorder: 'Pre-Order Traversal',
  inorder: 'In-Order Traversal',
  postorder: 'Post-Order Traversal',
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
  dijkstra: "Dijkstra's Algorithm",
  astar: 'A* Search',
  javascript: 'JS Custom Algo',
  cpp: 'C++ Custom Algo',
  java: 'Java Custom Algo'
};

export default function Profile({ user, isPremium, progress, onNavigate }) {
  if (!user) {
    onNavigate('auth');
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Process progress to get a flat list of completed algos
  const getCompletedAlgos = () => {
    if (!progress) return [];
    const completed = [];
    Object.entries(progress).forEach(([category, algos]) => {
      Object.entries(algos).forEach(([algoKey, status]) => {
        if (status === true) {
          completed.push({
            category: CATEGORY_LABELS[category] || category,
            name: ALGO_LABELS[algoKey] || algoKey,
            key: `${category}-${algoKey}`
          });
        }
      });
    });
    return completed;
  };

  const completedAlgos = getCompletedAlgos();
  const totalCompleted = completedAlgos.length;

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-glow" />
        <div className="profile-avatar-wrapper">
          <div className={`profile-avatar ${isPremium ? 'premium-border' : ''}`}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: '100%', borderRadius: '50%' }} />
            ) : (
              <User size={48} />
            )}
          </div>
          {isPremium && (
            <div className="premium-badge-icon">
              <Crown size={16} />
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1>{user.displayName || 'AlgoVis User'}</h1>
          <p className="profile-email"><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {user.email}</p>
          
          <div className="status-pills">
            {isPremium ? (
              <div className="status-pill premium">
                <Crown size={14} />
                <span>Premium Member</span>
              </div>
            ) : (
              <div className="status-pill free">
                <Zap size={14} />
                <span>Free Tier</span>
              </div>
            )}
            <div className="status-pill">
              <ShieldCheck size={14} />
              <span>Verified Account</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card">
          <span className="stat-value">{totalCompleted}</span>
          <span className="stat-label">Algos Mastered</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{isPremium ? 'Lifetime' : 'Standard'}</span>
          <span className="stat-label">Access Level</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Object.keys(progress || {}).length}</span>
          <span className="stat-label">Categories</span>
        </div>
      </div>

      <div className="recent-learnings-section">
        <div className="section-title">
          <History size={20} color="#fbbf24" />
          <h3>Recent Learnings</h3>
        </div>

        {completedAlgos.length > 0 ? (
          <div className="learning-grid">
            {completedAlgos.slice().reverse().map((algo) => (
              <div key={algo.key} className="learning-item">
                <div className="learning-icon">
                  <BarChart2 size={20} />
                </div>
                <div className="learning-info">
                  <h4>{algo.name}</h4>
                  <span>{algo.category}</span>
                </div>
                <CheckCircle2 size={18} color="#10b981" style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Zap size={48} color="#334155" />
            <p>You haven't visualized any algorithms yet.<br />Start your journey today!</p>
            <button 
              className="h-btn-primary" 
              style={{ marginTop: '1.5rem' }}
              onClick={() => onNavigate('sorting')}
            >
              Explore Algorithms
            </button>
          </div>
        )}
      </div>

      <button className="profile-logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        Logout from Account
      </button>
    </div>
  );
}
