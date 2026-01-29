import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { volunteerComplaintsAPI } from '../../services/adminApi';
import VolunteerNavbar from './VolunteerNavbar';
import './VolunteerDashboard.css';

const VolunteerComplaints = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initComplaints = async () => {
      const volunteerData = JSON.parse(localStorage.getItem('volunteer'));
      if (!volunteerData) {
        navigate('/volunteer/login');
        return;
      }
      setVolunteer(volunteerData);
      await fetchComplaints();
    };
    
    initComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await volunteerComplaintsAPI.getAll();
      setComplaints(data.complaints || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/volunteer/login');
      } else {
        toast.error('Failed to load complaints');
      }
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await volunteerComplaintsAPI.updateStatus(complaintId, newStatus);
      toast.success('Status updated successfully');
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: '#8b5cf6',
      in_review: '#f59e0b',
      resolved: '#10b981'
    };
    return colors[status] || '#64748b';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[priority] || '#64748b';
  };

  if (loading) {
    return (
      <div className="volunteer-complaints">
        <VolunteerNavbar volunteer={volunteer} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
        <div className="loading">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="volunteer-complaints">
      <VolunteerNavbar volunteer={volunteer} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
      <div className="complaints-content">
      <div className="complaints-header">
        <div>
          <h1>My Assigned Issues</h1>
          <p>Manage issues assigned to you</p>
        </div>
        <button onClick={() => navigate('/volunteer/dashboard')} className="btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="no-complaints-card">
          <div className="no-complaints-icon">📋</div>
          <h2>No Issues Assigned</h2>
          <p>You don't have any assigned issues at the moment.</p>
          <p>Check back later or contact the admin.</p>
        </div>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <div key={complaint._id} className="complaint-card">
              <div className="complaint-header">
                <div>
                  <h3>{complaint.title}</h3>
                  <div className="complaint-badges">
                    <span 
                      className="badge status-badge"
                      style={{backgroundColor: getStatusColor(complaint.status)}}
                    >
                      {complaint.status?.replace('_', ' ')}
                    </span>
                    <span 
                      className="badge priority-badge"
                      style={{backgroundColor: getPriorityColor(complaint.priority)}}
                    >
                      {complaint.priority}
                    </span>
                  </div>
                </div>
                <div className="status-update">
                  <label>Update Status:</label>
                  <select
                    value={complaint.status}
                    onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="assigned">Assigned</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="complaint-body">
                <p className="complaint-description">{complaint.description}</p>
                
                <div className="complaint-info">
                  <div className="info-item">
                    <span className="info-label">📍 Location:</span>
                    <span>{complaint.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📅 Reported:</span>
                    <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">👤 Reported By:</span>
                    <span>{complaint.user?.name || 'Anonymous'}</span>
                  </div>
                </div>

                {complaint.images && complaint.images.length > 0 && (
                  <div className="complaint-images">
                    {complaint.images.map((image, index) => (
                      <img key={index} src={image} alt={`Complaint ${index + 1}`} />
                    ))}
                  </div>
                )}

                {complaint.comments && complaint.comments.length > 0 && (
                  <div className="complaint-comments">
                    <h4>Comments ({complaint.comments.length})</h4>
                    {complaint.comments.map(comment => (
                      <div key={comment._id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user?.name || 'User'}</span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default VolunteerComplaints;
