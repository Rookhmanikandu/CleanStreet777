import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { complaintsAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './IssuesMap.css';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons based on priority
const getMarkerIcon = (priority) => {
  const colors = {
    urgent: '#dc3545',
    high: '#fd7e14',
    medium: '#ffc107',
    low: '#28a745'
  };

  const color = colors[priority] || colors.medium;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 16px;
      ">
        📍
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Component to fit map bounds to show all markers
function MapBounds({ complaints }) {
  const map = useMap();

  useEffect(() => {
    if (complaints && complaints.length > 0) {
      const validComplaints = complaints.filter(
        c => c.location_coords && 
             c.location_coords.coordinates && 
             c.location_coords.coordinates[0] !== 0 && 
             c.location_coords.coordinates[1] !== 0
      );

      if (validComplaints.length > 0) {
        const bounds = validComplaints.map(complaint => [
          complaint.location_coords.coordinates[1],
          complaint.location_coords.coordinates[0]
        ]);
        
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [complaints, map]);

  return null;
}

function IssuesMap() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintsAPI.getAll();
      if (response.data.success) {
        const allComplaints = response.data.complaints;
        
        // Filter complaints with valid coordinates
        const validComplaints = allComplaints.filter(
          c => c.location_coords && 
               c.location_coords.coordinates && 
               c.location_coords.coordinates[0] !== 0 && 
               c.location_coords.coordinates[1] !== 0
        );
        
        setComplaints(validComplaints);
        
        // Calculate statistics
        const stats = {
          total: validComplaints.length,
          urgent: validComplaints.filter(c => c.priority === 'urgent').length,
          high: validComplaints.filter(c => c.priority === 'high').length,
          medium: validComplaints.filter(c => c.priority === 'medium').length,
          low: validComplaints.filter(c => c.priority === 'low').length
        };
        setStats(stats);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredComplaints = () => {
    return complaints.filter(complaint => {
      const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
      return matchesPriority && matchesStatus;
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (complaintId) => {
    navigate(`/complaint/${complaintId}`);
  };

  const getPriorityBadgeClass = (priority) => {
    return `priority-badge priority-${priority}`;
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status?.replace('_', '-')}`;
  };

  const filteredComplaints = getFilteredComplaints();

  if (loading) {
    return (
      <div className="issues-map-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading issues map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="issues-map-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Default center of India
  const indiaCenter = [20.5937, 78.9629];

  return (
    <div className="issues-map-container">
      {/* Header */}
      <div className="issues-map-header">
        <div className="header-content">
          <h1>🗺️ Issues Map</h1>
          <p className="subtitle">View all reported complaints across India</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

      {/* Statistics Bar */}
      <div className="stats-bar">
        <div className="stat-card total">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-label">Total Issues</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card urgent">
          <span className="stat-icon">🔴</span>
          <div className="stat-info">
            <span className="stat-label">Urgent</span>
            <span className="stat-value">{stats.urgent}</span>
          </div>
        </div>
        <div className="stat-card high">
          <span className="stat-icon">🟠</span>
          <div className="stat-info">
            <span className="stat-label">High</span>
            <span className="stat-value">{stats.high}</span>
          </div>
        </div>
        <div className="stat-card medium">
          <span className="stat-icon">🟡</span>
          <div className="stat-info">
            <span className="stat-label">Medium</span>
            <span className="stat-value">{stats.medium}</span>
          </div>
        </div>
        <div className="stat-card low">
          <span className="stat-icon">🟢</span>
          <div className="stat-info">
            <span className="stat-label">Low</span>
            <span className="stat-value">{stats.low}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="map-filters">
        <div className="filter-group">
          <label>Priority:</label>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="showing-info">
          Showing {filteredComplaints.length} of {complaints.length} issues
        </div>
      </div>

      {/* Map */}
      <div className="map-wrapper">
        {filteredComplaints.length === 0 ? (
          <div className="no-complaints">
            <p>No complaints found with valid locations matching the selected filters.</p>
          </div>
        ) : (
          <MapContainer
            center={indiaCenter}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBounds complaints={filteredComplaints} />

            {filteredComplaints.map((complaint) => (
              <Marker
                key={complaint._id}
                position={[
                  complaint.location_coords.coordinates[1],
                  complaint.location_coords.coordinates[0]
                ]}
                icon={getMarkerIcon(complaint.priority)}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="popup-content">
                    <div className="popup-header">
                      <h3>{complaint.title}</h3>
                      <div className="popup-badges">
                        <span className={getPriorityBadgeClass(complaint.priority)}>
                          {complaint.priority?.toUpperCase()}
                        </span>
                        <span className={getStatusBadgeClass(complaint.status)}>
                          {complaint.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="popup-body">
                      <p className="popup-description">
                        {complaint.description?.substring(0, 100)}
                        {complaint.description?.length > 100 ? '...' : ''}
                      </p>
                      
                      <div className="popup-meta">
                        <div className="meta-item">
                          <span className="meta-icon">📍</span>
                          <span className="meta-text">{complaint.address}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">📅</span>
                          <span className="meta-text">{formatDate(complaint.created_at)}</span>
                        </div>
                        {complaint.user_id && (
                          <div className="meta-item">
                            <span className="meta-icon">👤</span>
                            <span className="meta-text">{complaint.user_id.name}</span>
                          </div>
                        )}
                        <div className="meta-item">
                          <span className="meta-icon">👍</span>
                          <span className="meta-text">{complaint.upvotes || 0} upvotes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="popup-footer">
                      <button
                        onClick={() => handleViewDetails(complaint._id)}
                        className="details-btn"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <h4>Priority Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#dc3545' }}>📍</span>
            <span>Urgent</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#fd7e14' }}>📍</span>
            <span>High</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#ffc107' }}>📍</span>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#28a745' }}>📍</span>
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssuesMap;
