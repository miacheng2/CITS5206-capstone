import React, { useEffect } from 'react';
import './home.css';

const Home = () => {
  useEffect(() => {
    // Trigger animation for cards on load with staggered delay
    const cards = document.querySelectorAll('.homepage-card');
    cards.forEach((card, index) => {
      card.style.animation = `slideIn 0.6s ease forwards ${index * 0.2}s`;
    });
  }, []);

  return (
    <div className="homepage">
      <header className="home-section">
        <div className="overlay">
          <div className="text-container fade-in">
            <h2>Nedlands Yacht Club Volunteer Management</h2>
            <p>Empowering the community, one volunteer at a time.</p>
          </div>
        </div>
      </header>

      <section className="homepage-card-container">
        <div className="homepage-card yellow-card">
          <div className="homepage-card-content">
            <h2>Volunteer Points</h2>
            <p>Track volunteer hours, assign points, and reward contributions.</p>
          </div>
          <div className="homepage-card-hover">
            <button onClick={() => window.location.href='/volunteer-points'}>Learn More</button>
          </div>
        </div>

        <div className="homepage-card green-card">
          <div className="homepage-card-content">
            <h2>Plan & Manage Events</h2>
            <p>Organize events to engage and mobilize volunteers.</p>
          </div>
          <div className="homepage-card-hover">
            <button onClick={() => window.location.href='/events'}>Learn More</button>
          </div>
        </div>
        
        <div className="homepage-card orange-card">
          <div className="homepage-card-content">
            <h2>Team Overview</h2>
            <p>Organize teams and assign roles for efficient management.</p>
          </div>
          <div className="homepage-card-hover">
            <button onClick={() => window.location.href='/WorkTeamManagement'}>Learn More</button>
          </div>
        </div>
        
        <div className="homepage-card blue-card">
          <div className="homepage-card-content">
            <h2>Performance Reports</h2>
            <p>Generate and analyze volunteer performance and event impact.</p>
          </div>
          <div className="homepage-card-hover">
            <button onClick={() => window.location.href='/reports'}>Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
