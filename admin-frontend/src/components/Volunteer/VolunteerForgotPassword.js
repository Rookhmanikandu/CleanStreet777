import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { volunteerAuthAPI } from '../../services/adminApi';
import './VolunteerLogin.css';

const VolunteerForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await volunteerAuthAPI.forgotPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volunteer-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔐 Forgot Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="volunteer@example.com"
                required
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="auth-links">
              <Link to="/volunteer/login">← Back to Login</Link>
            </div>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✉️</div>
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <Link to="/volunteer/login" className="btn-auth">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerForgotPassword;
