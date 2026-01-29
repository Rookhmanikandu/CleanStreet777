import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAuthAPI, setAdminToken } from '../../services/adminApi';
import './AdminLogin.css';

function AdminLogin({ setIsAuthenticated, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await adminAuthAPI.login({ email, password });

      if (response.success) {
        const { token, admin } = response;
        
        // Save token and user data
        setAdminToken(token);
        localStorage.setItem('adminUser', JSON.stringify(admin));
        localStorage.setItem('admin', JSON.stringify(admin));
        
        setIsAuthenticated(true);
        setUser(admin);
        
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="admin-logo">
            <span className="logo-icon">🛡️</span>
            <h1>CleanStreet</h1>
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to manage the system</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="admin@cleanstreet.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <Link to="/admin/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-login-footer">
          <div className="divider">
            <span>OR</span>
          </div>
          <div className="volunteer-links">
            <p>Are you a volunteer?</p>
            <div className="volunteer-actions">
              <Link to="/volunteer/login" className="volunteer-link">
                Volunteer Login
              </Link>
              <span className="separator">•</span>
              <Link to="/volunteer/register" className="volunteer-link">
                Register as Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-login-info">
        <div className="info-card">
          <h3>🔒 Secure Access</h3>
          <p>Admin portal with advanced security features</p>
        </div>
        <div className="info-card">
          <h3>📊 Dashboard</h3>
          <p>Comprehensive analytics and reporting</p>
        </div>
        <div className="info-card">
          <h3>⚡ Real-time</h3>
          <p>Monitor and manage complaints instantly</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
