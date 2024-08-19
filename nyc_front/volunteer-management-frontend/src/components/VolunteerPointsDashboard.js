import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styles.css'; 

function VolunteerPointsDashboard() {
  const navigate = useNavigate();

  return (
    <div>
    {/* Navbar */}
    <nav className="navbar">
      <img src="nyclogo.jpg" alt="Nedlands Yacht Club Logo" className="logo" />
      <h1>Nedlands Yacht Club</h1>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/WorkTeamManagement">Team Management</Link></li>
        <li><Link to="/membermanagement">Member Management</Link></li>
        <li><Link to="/events">Event</Link></li>
        <li><Link to="/VolunteerPoint">Volunteer Point</Link></li>
        <li><Link to="/reports">Report</Link></li>
        <li><Link to="/Admin">Admin</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </nav>

      {/* Main Section */}
      <header className="mainsection">
        <div className="overlay">
          <div className="text-container">
            <h2>Volunteer Point Management</h2>
            <p>Every Hour Matters: Log It, Celebrate It, Reward It</p>
          </div>
        </div>
      </header>

      {/* Cards Section */}
      <section className="cards-section">
      <div className="card" onClick={() => navigate('/add-points')}>
          <h3>Add Volunteer Points</h3>
          <p>Log the volunteer hours and assign points.</p>
          <button className="learn-more">Learn more</button>
        </div>
        <div className="card" onClick={() => navigate('/check-history')}>
          <h3>Check Volunteer History</h3>
          <p>View the detailed history of volunteer activities.</p>
          <button className="learn-more">Learn more</button>
        </div>
        <div className="card" onClick={() => navigate('/reward-checkin')}>
          <h3>Reward Check-In</h3>
          <p>Check eligibility for rewards based on accumulated points.</p>
          <button className="learn-more">Learn more</button>
        </div>
       
      </section>
    </div>
  );
}

export default VolunteerPointsDashboard;
