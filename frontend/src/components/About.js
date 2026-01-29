import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <h2>About Clean Street</h2>
      
      <div className="about-content">
        <section className="about-section">
          <h3>Our Mission</h3>
          <p>
            Clean Street is a citizen-driven initiative designed to empower communities 
            to report and track street cleaning issues. We believe that everyone deserves 
            to live in a clean, safe, and well-maintained environment.
          </p>
        </section>

        <section className="about-section">
          <h3>What We Do</h3>
          <ul>
            <li>Provide an easy-to-use platform for reporting street cleaning issues</li>
            <li>Track and manage complaints efficiently</li>
            <li>Connect citizens with municipal authorities</li>
            <li>Monitor resolution progress in real-time</li>
            <li>Build a cleaner, healthier community together</li>
          </ul>
        </section>

        <section className="about-section">
          <h3>How It Benefits You</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h4>🚀 Quick Response</h4>
              <p>Fast processing of complaints with priority-based handling</p>
            </div>
            <div className="benefit-item">
              <h4>📊 Transparency</h4>
              <p>Track the status of your complaints from submission to resolution</p>
            </div>
            <div className="benefit-item">
              <h4>🤝 Community Impact</h4>
              <p>Join thousands of citizens making a real difference</p>
            </div>
            <div className="benefit-item">
              <h4>💚 Cleaner Environment</h4>
              <p>Contribute to a healthier and more sustainable city</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h3>Contact Us</h3>
          <p>Have questions or feedback? We'd love to hear from you!</p>
          <div className="contact-info">
            <p>📧 Email: support@cleanstreet.com</p>
            <p>📞 Phone: +1 (555) 123-4567</p>
            <p>🏢 Address: 123 Main Street, City Center, CA 12345</p>
          </div>
        </section>

        <section className="about-section">
          <h3>Get Involved</h3>
          <p>
            Together, we can create cleaner streets and better neighborhoods. 
            Start by reporting an issue today, and be part of the solution!
          </p>
          <a href="/report" className="cta-button">Report an Issue Now</a>
        </section>
      </div>
    </div>
  );
}

export default About;
