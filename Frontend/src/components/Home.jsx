import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, User, Mail, Shield, Calendar, Key, AlertCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rawToken, setRawToken] = useState('');
  const [error, setError] = useState('');

  // Native function to decode JWT payload safely
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const urlToken = searchParams.get('token');
    let activeToken = urlToken || localStorage.getItem('token');

    if (urlToken) {
      // Save URL token to localStorage
      localStorage.setItem('token', urlToken);
      // Clean query parameters from URL for security and aesthetics
      navigate('/home', { replace: true });
    }

    if (!activeToken) {
      navigate('/login');
      return;
    }

    setRawToken(activeToken);
    const decoded = decodeJWT(activeToken);

    if (!decoded) {
      setError('Invalid authentication token.');
      localStorage.removeItem('token');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Check expiration
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      setError('Session expired. Redirecting to login...');
      localStorage.removeItem('token');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    setUser(decoded);
  }, [searchParams, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) {
    return (
      <div className="home-container error-state">
        <div className="glass-card error-card">
          <AlertCircle size={48} className="error-icon" />
          <h2>Authentication Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="home-container loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Background glowing blobs for high visual quality */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      <div className="glow-blob blob-3"></div>

      <div className="dashboard-wrapper">
        {/* Header */}
        <header className="dashboard-header animate-fade-in">
          <div className="header-logo">
            <span className="logo-accent">AMU</span> Dashboard
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </header>

        {/* Dashboard Content Grid */}
        <main className="dashboard-grid">
          {/* Left Column: User Profile Card */}
          <section className="profile-section animate-slide-up">
            <div className="glass-card profile-card">
              <div className="profile-avatar-wrapper">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} className="profile-avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={40} />
                  </div>
                )}
                <div className="status-indicator online"></div>
              </div>
              <h1 className="user-name">{user.displayName}</h1>
              <p className="user-badge">Authenticated via Google</p>

              <div className="profile-details-list">
                <div className="detail-item">
                  <Mail size={18} className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{user.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <Shield size={18} className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">User ID</span>
                    <span className="detail-value monospace">{user.id}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <Calendar size={18} className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Session Expires</span>
                    <span className="detail-value">
                      {user.exp ? new Date(user.exp * 1000).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: JWT Token inspector */}
          <section className="token-section animate-slide-up delay-1">
            <div className="glass-card token-card">
              <div className="card-header">
                <Key size={20} className="header-icon" />
                <h2>Secure JSON Web Token</h2>
              </div>
              <p className="card-description">
                This token is generated by the Node.js backend upon successful Google OAuth callback and stored in your browser's localStorage.
              </p>

              <div className="token-display-box">
                <div className="token-section-header">Token Payload</div>
                <pre className="json-output">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>

              <div className="token-display-box raw-token-box">
                <div className="token-section-header">Raw Signature Token</div>
                <div className="raw-token-text monospace">{rawToken}</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;
