import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { volunteerComplaintsAPI } from '../../services/adminApi';
import VolunteerNavbar from './VolunteerNavbar';
import './VolunteerDashboard.css';

const VolunteerDashboard = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      const volunteerData = JSON.parse(localStorage.getItem('volunteer'));
      if (!volunteerData) {
        navigate('/volunteer/login');
        return;
      }
      setVolunteer(volunteerData);
      await fetchStats();
    };
    
    initDashboard();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const data = await volunteerComplaintsAPI.getDashboardStats();
      setStats(data.stats || data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('volunteerToken');
        localStorage.removeItem('volunteer');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/volunteer/login', { replace: true });
      } else {
        toast.error('Failed to load dashboard statistics');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="volunteer-dashboard">
        <VolunteerNavbar volunteer={volunteer} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="volunteer-dashboard">
      <VolunteerNavbar volunteer={volunteer} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome back, {volunteer?.name}! 👋</h1>
          <p>Here's an overview of your assigned issues</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats?.total || 0}</h3>
              <p>Total Assigned</p>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats?.assigned || 0}</h3>
              <p>In Progress</p>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats?.resolved || 0}</h3>
              <p>Resolved</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/volunteer/complaints" className="action-btn primary">
              <span className="action-icon">📋</span>
              View Assigned Issues
            </Link>
          </div>
        </div>

        {/* Info Card */}
        {stats?.total === 0 && (
          <div className="info-card">
            <h3>🎯 No Issues Assigned Yet</h3>
            <p>You don't have any assigned issues at the moment.</p>
            <p>The admin will assign issues to you when available. You'll receive an email notification.</p>
          </div>
        )}

        {stats?.total > 0 && (
          <div className="status-breakdown">
            <h3>Status Breakdown</h3>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <div className="breakdown-bar" style={{width: '100%', backgroundColor: '#8b5cf6'}}></div>
                <div className="breakdown-info">
                  <span className="breakdown-label">Assigned</span>
                  <span className="breakdown-value">{stats?.assigned || 0}</span>
                </div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-bar" style={{width: stats?.resolved ? `${(stats.resolved / stats.total) * 100}%` : '0%', backgroundColor: '#10b981'}}></div>
                <div className="breakdown-info">
                  <span className="breakdown-label">Resolved</span>
                  <span className="breakdown-value">{stats?.resolved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
