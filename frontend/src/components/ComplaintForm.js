import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../services/api';
import LocationPicker from './LocationPicker';
import './ComplaintForm.css';

function ComplaintForm({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    priority: 'medium',
    location_coords: null
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLocationChange = (location) => {
    // Only update if location is valid and different
    if (location && location !== formData.address) {
      setFormData(prev => ({
        ...prev,
        address: location
      }));
    }
  };

  const handleLocationCoordsChange = (coords) => {
    if (coords && coords.coordinates) {
      setFormData(prev => ({
        ...prev,
        location_coords: coords
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + photos.length > 5) {
      setError('You can upload maximum 5 images');
      return;
    }
    
    const validFiles = [];
    const previews = [];
    let hasError = false;
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError('Each photo must be less than 10MB');
        hasError = true;
        return;
      }
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target.result);
        if (previews.length === validFiles.length) {
          setPhotoPreviews([...photoPreviews, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (!hasError) {
      setPhotos([...photos, ...validFiles]);
      setError('');
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.title.trim()) {
      setError('Please enter a title for the issue.');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description for the issue.');
      setLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setError('Please select a location on the map.');
      setLoading(false);
      return;
    }

    // Validate location coordinates
    if (!formData.location_coords || 
        !formData.location_coords.coordinates || 
        formData.location_coords.coordinates[0] === 0 || 
        formData.location_coords.coordinates[1] === 0) {
      setError('Please click on the map to select the exact location of the complaint.');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Submitting complaint with data:', {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        priority: formData.priority,
        location_coords: formData.location_coords,
        photos: photos.length
      });

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('address', formData.address.trim());
      submitData.append('priority', formData.priority);
      
      if (formData.location_coords) {
        submitData.append('location_coords', JSON.stringify(formData.location_coords));
      }
      
      // Append multiple photos
      if (photos && photos.length > 0) {
        photos.forEach((photo) => {
          submitData.append('photos', photo);
        });
        console.log('📸 Uploading', photos.length, 'photos');
      }

      console.log('🚀 Sending request to server...');
      const response = await complaintsAPI.create(submitData);
      console.log('✅ Response from server:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
        console.log('✅ Complaint created successfully:', response.data.complaint);
        setFormData({
          title: '',
          description: '',
          address: '',
          priority: 'medium',
          location_coords: null
        });
        setPhotos([]);
        setPhotoPreviews([]);
        
        setTimeout(() => {
          setSuccess(false);
          navigate('/view-complaints');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Complaint submission error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-page">
      <div className="complaint-form-header">
        <h2>Report a Street Cleaning Issue</h2>
      </div>
      
      {success && (
        <div className="success-message">
          ✓ Your complaint has been submitted successfully! Redirecting to complaints list...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="complaint-form-content">
        <div className="form-section">
          <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label htmlFor="title">Issue Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Brief description of the issue"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Please describe the issue in detail..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority Level *</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

            <div className="form-group">
              <label htmlFor="photos">Photos (Optional - Max 5)</label>
              <input
                type="file"
                id="photos"
                name="photos"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="photo-input"
              />
              {photoPreviews.length > 0 && (
                <div className="photos-preview-grid">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="photo-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button" 
                        onClick={() => removePhoto(index)}
                        className="remove-photo-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <div className="map-section">
          <div className="map-container">
            <h3>� Select Location</h3>
            <p className="map-description">Click on the map to select the exact location of the issue</p>
            <div className="map-wrapper">
              <LocationPicker 
                location={formData.address}
                setLocation={handleLocationChange}
                setLocationCoords={handleLocationCoordsChange}
              />
            </div>
            {formData.address && (
              <div className="selected-location">
                <strong>Selected Location:</strong>
                <p>{formData.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintForm;
