import React, { useState } from 'react';
import { Shield, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('zoo_token', data.access_token);
      
      // Notify parent app
      onLogin(data.access_token);
      
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 🎬 HIGH-FIDELITY VIDEO BACKGROUND (EXCLUSIVELY FOR LOGIN) */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="login-bg-video"
      >
        <source src="/assets/login_video.mp4" type="video/mp4" />
      </video>
      <div className="login-video-overlay"></div>

      <div className="login-glass-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={64} strokeWidth={1.5} />
            <h1 className="login-title">
              Indian Zoo<br/>
              <span className="accent-text">Inventory Management</span><br/>
              System
            </h1>
          </div>
          <span className="login-subtitle">Strategic Asset & Ecosystem Control</span>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">IDENTIFICATION</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                id="username"
                type="text"
                className={`login-input ${error ? 'input-error' : ''}`}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">AUTHORIZATION KEY</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                className={`login-input ${error ? 'input-error' : ''}`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" size={20} />
                AUTHENTICATING...
              </>
            ) : (
              'INITIALIZE SESSION'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
