import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAuthAPI } from '../../services/adminApi';
import '../Admin/AdminLogin.css';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAuthAPI.forgotPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <h1>🔐 Forgot Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cleanstreet.com"
                required
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="login-links">
              <Link to="/admin/login">← Back to Login</Link>
            </div>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✉️</div>
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <p>Please check your inbox and follow the instructions.</p>
            <Link to="/admin/login" className="btn-login">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminForgotPassword;
