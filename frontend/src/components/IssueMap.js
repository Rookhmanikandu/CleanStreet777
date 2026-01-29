import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './IssueMap.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function FitBounds({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;
    if (coordinates.length === 1) {
      map.setView(coordinates[0], 14);
      return;
    }
    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [coordinates, map]);

  return null;
}

function IssueMap() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getAll();
      if (response.data.success) {
        const list = response.data.complaints || [];
        console.log('[IssueMap] fetched complaints:', list.length);
        if (list.length > 0) {
          console.log('[IssueMap] Sample complaint structure:', {
            title: list[0].title,
            location_coords: list[0].location_coords,
            latitude: list[0].latitude,
            longitude: list[0].longitude
          });
        }
        setComplaints(list);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const points = useMemo(() => {
    return complaints
      .map(c => {
        let lat, lng;
        
       
        if (c.location_coords?.coordinates && Array.isArray(c.location_coords.coordinates) && c.location_coords.coordinates.length === 2) {
       
          lng = parseFloat(c.location_coords.coordinates[0]);
          lat = parseFloat(c.location_coords.coordinates[1]);
        } else {
      
          lat = parseFloat(c.latitude ?? c.lat ?? c.location?.lat);
          lng = parseFloat(c.longitude ?? c.lng ?? c.location?.lng);
        }
        
      
        if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
          console.log(`[IssueMap] Valid coordinates for ${c.title}: [${lat}, ${lng}]`);
          return { ...c, lat, lng };
        }
        return null;
      })
      .filter(Boolean);
  }, [complaints]);

  const coordinates = useMemo(() => points.map(p => [p.lat, p.lng]), [points]);

  useEffect(() => {
    if (!loading) {
      console.log('[IssueMap] valid points to render:', points.length);
      if (points.length === 0) {
        console.warn('[IssueMap] No complaints with valid latitude/longitude.');
      }
    }
  }, [loading, points]);


  useEffect(() => {
    const interval = setInterval(() => {
      fetchComplaints();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'received':
        return 'Received';
      case 'in_review':
        return 'In Review';
      case 'resolved':
        return 'Resolved';
      default:
        return status || 'Unknown';
    }
  };

  return (
    <div className="issue-map-page">
      <div className="issue-map-header">
        <h1>Issue Map</h1>
        <div className="issue-map-actions">
          <button className="refresh-btn" onClick={fetchComplaints}>Refresh</button>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="issue-map-container">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="issue-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds coordinates={coordinates} />

          {!loading && points.map((c) => (
            <Marker key={c._id} position={[c.lat, c.lng]}>
              <Popup>
                <div className="popup-content">
                  <h3 className="popup-title">{c.title}</h3>
                  <p className="popup-desc">{c.description}</p>
                  <div className="popup-meta">
                    <span>🕒 {c.created_at ? new Date(c.created_at).toLocaleString() : '—'}</span>
                    <span>•</span>
                    <span>Status: {getStatusLabel(c.status)}</span>
                  </div>
                  {Array.isArray(c.photo) && c.photo.length > 0 && (
                    <div className="popup-image-wrap">
                      <img src={c.photo[0]} alt="Complaint" className="popup-image" />
                    </div>
                  )}
                  <button className="popup-link" onClick={() => navigate(`/complaint/${c._id}`)}>View Details</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {!loading && points.length === 0 && !error && (
          <div className="no-points-hint">No complaints with valid coordinates to display.</div>
        )}
      </div>
    </div>
  );
}

export default IssueMap;


