import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import './Auth.css';

export default function Auth({ onNavigate, authMessage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      onNavigate('home');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onNavigate('home');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // Helper to render common form parts
  const renderForm = (mode) => (
    <form onSubmit={handleSubmit} className="auth-form">
      {mode === 'register' && (
        <div className="input-group">
          <label><User size={16} /> Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required={mode === 'register'}
          />
        </div>
      )}

      <div className="input-group">
        <label><Mail size={16} /> Email Address</label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label><Lock size={16} /> Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : (
          <>
            {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <button type="button" onClick={handleGoogleSignIn} className="google-btn" disabled={loading}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8l4 4-4 4" /></svg> Continue with Google
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p className="auth-toggle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="auth-container">
      <div className={`auth-flip-card ${isLogin ? '' : 'flipped'}`}>
        <div className="auth-card-inner">
          {/* LOGIN FACE */}
          <div className="auth-card-face auth-card-front">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Enter your details to continue</p>
            </div>
            {authMessage && <div className="auth-warning">{authMessage}</div>}
            {isLogin && error && <div className="auth-error">{error}</div>}
            {renderForm('login')}
          </div>

          {/* REGISTER FACE */}
          <div className="auth-card-face auth-card-back">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Join the community and start learning</p>
            </div>
            {authMessage && <div className="auth-warning">{authMessage}</div>}
            {!isLogin && error && <div className="auth-error">{error}</div>}
            {renderForm('register')}
          </div>
        </div>
      </div>
    </div>
  );
}
