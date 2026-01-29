import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../services/api';
import './Navigation.css';

function Navigation({ isAuthenticated, setIsAuthenticated, setUser, activeLink = '' }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="nav-logo">
          <span className="logo-icon">🌆</span>
          <span className="logo-text">CleanStreet</span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${activeLink === 'dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/report-issue" 
                className={`nav-link ${activeLink === 'report-issue' ? 'active' : ''}`}
              >
                Report Issue
              </Link>
              <Link 
                to="/view-complaints" 
                className={`nav-link ${activeLink === 'view-complaints' ? 'active' : ''}`}
              >
                View Complaints
              </Link>
              <Link 
                to="/issues-map" 
                className={`nav-link ${activeLink === 'issues-map' ? 'active' : ''}`}
              >
                Issues Map
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${activeLink === 'profile' ? 'active' : ''}`}
              >
                Profile
              </Link>
            </>
          ) : (
            <Link 
              to="/about" 
              className={`nav-link ${activeLink === 'about' ? 'active' : ''}`}
            >
              About
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
