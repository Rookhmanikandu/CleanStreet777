import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminComplaintsAPI } from '../../services/adminApi';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

function AdminDashboard({ user, setIsAuthenticated, setUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    complaints: { total: 0, pending: 0, inReview: 0, assigned: 0, resolved: 0, rejected: 0 },
    priority: { urgent: 0, high: 0, medium: 0, low: 0 },
    users: { total: 0 },
    volunteers: { total: 0, pending: 0, approved: 0, blocked: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch stats if user is authenticated
    if (user) {
      fetchDashboardStats();
      
      // Auto-refresh stats every 30 seconds
      const interval = setInterval(() => {
        fetchDashboardStats();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      navigate('/admin/login', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminComplaintsAPI.getDashboardStats();
      if (response.success) {
        setStats(response.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/admin/login', { replace: true });
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminNavbar user={user} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          {/* Total Complaints */}
          <div className="stat-card primary">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats.complaints.total}</h3>
              <p>Total Complaints</p>
            </div>
          </div>

          {/* Pending */}
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.complaints.pending}</h3>
              <p>Pending</p>
            </div>
          </div>

          {/* In Review */}
          <div className="stat-card info">
            <div className="stat-icon">👁️</div>
            <div className="stat-info">
              <h3>{stats.complaints.inReview}</h3>
              <p>In Review</p>
            </div>
          </div>

          {/* Assigned */}
          <div className="stat-card secondary">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h3>{stats.complaints.assigned}</h3>
              <p>Assigned</p>
            </div>
          </div>

          {/* Resolved */}
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.complaints.resolved}</h3>
              <p>Resolved</p>
            </div>
          </div>

          {/* Rejected */}
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>{stats.complaints.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        {/* Priority & System Stats */}
        <div className="secondary-stats">
          <div className="priority-card card">
            <h3>Priority Breakdown</h3>
            <div className="priority-list">
              <div className="priority-item urgent">
                <span className="priority-label">🔴 Urgent</span>
                <span className="priority-value">{stats.priority.urgent}</span>
              </div>
              <div className="priority-item high">
                <span className="priority-label">🟠 High</span>
                <span className="priority-value">{stats.priority.high}</span>
              </div>
              <div className="priority-item medium">
                <span className="priority-label">🟡 Medium</span>
                <span className="priority-value">{stats.priority.medium}</span>
              </div>
              <div className="priority-item low">
                <span className="priority-label">🟢 Low</span>
                <span className="priority-value">{stats.priority.low}</span>
              </div>
            </div>
          </div>

          <div className="system-card card">
            <h3>System Overview</h3>
            <div className="system-stats">
              <div className="system-stat">
                <span className="system-label">👥 Total Users</span>
                <span className="system-value">{stats.users.total}</span>
              </div>
              <div className="system-stat">
                <span className="system-label">🦸 Total Volunteers</span>
                <span className="system-value">{stats.volunteers.total}</span>
              </div>
              <div className="system-stat">
                <span className="system-label">⏳ Pending Volunteers</span>
                <span className="system-value">{stats.volunteers.pending}</span>
              </div>
              <div className="system-stat">
                <span className="system-label">✅ Approved Volunteers</span>
                <span className="system-value">{stats.volunteers.approved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/admin/complaints" className="action-btn primary">
              <span className="action-icon">📋</span>
              <span>View All Complaints</span>
            </Link>
            <Link to="/admin/volunteers" className="action-btn success">
              <span className="action-icon">🦸</span>
              <span>Manage Volunteers</span>
            </Link>
            <Link to="/admin/users" className="action-btn info">
              <span className="action-icon">👥</span>
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/settings" className="action-btn secondary">
              <span className="action-icon">⚙️</span>
              <span>Admin Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
