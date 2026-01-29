import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { volunteerAuthAPI } from '../../services/adminApi';
import './VolunteerLogin.css';

const VolunteerLogin = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await volunteerAuthAPI.login(credentials);
      localStorage.setItem('volunteerToken', data.token);
      localStorage.setItem('volunteer', JSON.stringify(data.volunteer));
      
      // Update authentication state
      if (setIsAuthenticated) setIsAuthenticated(true);
      if (setUser) setUser(data.volunteer);
      
      toast.success('Login successful!');
      navigate('/volunteer/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volunteer-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎯 Volunteer Login</h1>
          <p>Login to manage assigned issues</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              placeholder="volunteer@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/volunteer/forgot-password">Forgot Password?</Link>
          <p>New volunteer? <Link to="/volunteer/register">Register here</Link></p>
          <p><Link to="/admin/login">Admin Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerLogin;
