import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { volunteerAuthAPI } from '../../services/adminApi';
import './VolunteerLogin.css';

const VolunteerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await volunteerAuthAPI.register(formData);
      toast.success('Registration successful! Please wait for admin approval.');
      setTimeout(() => navigate('/volunteer/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="volunteer-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>👥 Volunteer Registration</h1>
          <p>Join us in making your community cleaner</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="volunteer@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your contact number"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Volunteer'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already registered? <Link to="/volunteer/login">Login here</Link></p>
          <p><Link to="/admin/login">Admin Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegister;
