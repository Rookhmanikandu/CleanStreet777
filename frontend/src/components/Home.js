import React from 'react';
import './Home.css';

function Home({ complaintCount }) {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Clean Street</h1>
          <p className="hero-subtitle">
            Your Voice for a Cleaner Community
          </p>
          <p className="hero-description">
            Report street cleaning issues, track complaints, and help make our city a better place to live.
          </p>
          <div className="hero-stats">
            <div className="stat-card">
              <h3>{complaintCount}</h3>
              <p>Total Complaints</p>
            </div>
            <div className="stat-card">
              <h3>85%</h3>
              <p>Resolution Rate</p>
            </div>
            <div className="stat-card">
              <h3>24h</h3>
              <p>Avg Response Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Report Issues</h3>
            <p>Easily report street cleaning problems in your area with our simple form.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👀</div>
            <h3>Track Status</h3>
            <p>Monitor the progress of your complaints and see real-time updates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Get Results</h3>
            <p>Watch as our team resolves issues and keeps our streets clean.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Community Driven</h3>
            <p>Join thousands of citizens working together for a cleaner city.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Make a Difference?</h2>
        <p>Report an issue today and help us keep our streets clean!</p>
        <a href="/report" className="cta-button">Report an Issue</a>
      </div>
    </div>
  );
}

export default Home;
