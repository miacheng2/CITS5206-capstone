import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './home.css'; 

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/login'); 
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Additional logic for logout can be added here 
  };

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
          {isLoggedIn ? (
            <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
          ) : (
            <li><Link to="/login" onClick={handleLogin}>Login</Link></li>
          )}
        </ul>
      </nav>

      {/* Main Section */}
      <header className="home-section">
        <div className="overlay">
          <div className="text-container">
            <h2>Nedlands Yacht Club Volunteer Management</h2>
            <p>Empowering the community, one volunteer at a time.</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Home;
