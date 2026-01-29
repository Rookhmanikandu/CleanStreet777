import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { removeAdminToken } from '../../services/adminApi';
import './AdminNavbar.css';

const AdminNavbar = ({ user, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAdminToken();
    setIsAuthenticated(false);
    setUser(null);
    toast.info('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛡️</span>
        <span className="brand-text">CleanStreet Admin</span>
      </div>
      <div className="navbar-links">
        <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/admin/complaints" className="nav-link">Complaints</Link>
        <Link to="/admin/volunteers" className="nav-link">Volunteers</Link>
        <Link to="/admin/users" className="nav-link">Users</Link>
        <Link to="/admin/settings" className="nav-link">Settings</Link>
      </div>
      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user?.name || 'Admin'}</span>
          <span className="user-role">Admin</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
