import React from 'react';
import { Link } from 'react-router-dom';
import './report.css';

const Report = () => {
    
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
          <header className="report-section">
            <div className="overlay">
              <div className="text-container">
              <h1>Report Page</h1>
              <p>This is the Report page.</p>
              </div>
            </div>
          </header>
    
    
        </div>
      );
    }
    
export default Report;
