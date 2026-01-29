import React, { useState } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ complaints, onUpdateStatus, onDelete }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple authentication (in production, use proper backend authentication)
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password!');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'in-progress': '#2196f3',
      'resolved': '#4caf50',
      'rejected': '#f44336'
    };
    return colors[status] || '#999';
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <button type="submit" className="login-button">Login</button>
            <p className="hint">Hint: admin123</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <button onClick={() => setIsAuthenticated(false)} className="logout-button">
          Logout
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-box">
          <h3>{stats.total}</h3>
          <p>Total Complaints</p>
        </div>
        <div className="stat-box pending-stat">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-box progress-stat">
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-box resolved-stat">
          <h3>{stats.resolved}</h3>
          <p>Resolved</p>
        </div>
        <div className="stat-box rejected-stat">
          <h3>{stats.rejected}</h3>
          <p>Rejected</p>
        </div>
      </div>

      <div className="complaints-table">
        <h3>Manage Complaints</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(complaint => (
              <tr key={complaint.id}>
                <td>#{complaint.id}</td>
                <td>{complaint.name}</td>
                <td>{complaint.location}</td>
                <td>
                  <span className={`priority-tag ${complaint.priority}`}>
                    {complaint.priority}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {complaint.status}
                  </span>
                </td>
                <td>{complaint.date}</td>
                <td>
                  <div className="action-buttons">
                    <select
                      value={complaint.status}
                      onChange={(e) => onUpdateStatus(complaint.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => onDelete(complaint.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
