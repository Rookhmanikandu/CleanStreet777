import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { removeVolunteerToken } from '../../services/adminApi';
import './VolunteerNavbar.css';

const VolunteerNavbar = ({ volunteer, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeVolunteerToken();
    if (setIsAuthenticated) setIsAuthenticated(false);
    if (setUser) setUser(null);
    toast.success('Logged out successfully');
    navigate('/volunteer/login', { replace: true });
  };

  return (
    <nav className="volunteer-navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🎯</span>
        <span className="brand-text">Volunteer Portal</span>
      </div>
      <div className="navbar-links">
        <Link to="/volunteer/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/volunteer/complaints" className="nav-link">My Tasks</Link>
        <Link to="/volunteer/profile" className="nav-link">Profile</Link>
      </div>
      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{volunteer?.name || 'Volunteer'}</span>
          <span className="user-role">Volunteer</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default VolunteerNavbar;
