import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './event.css'; 

const Event = () => {
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
          <header className="event-section">
            <div className="overlay">
              <div className="text-container">
                <h2>Events</h2>
              </div>
            </div>
          </header>
    
          {/* Cards Section */}
          <section className="cards-section">
          <div className="card" onClick={() => navigate('/events')}>
              <img src="nycimg4.jpg" alt="Event 1" />
              <h3>Off Water events</h3>
              <button className="learn-more">Learn more</button>
            </div>
            <div className="card" onClick={() => navigate('/events')}>
              <img src="nycimg3.jpg" alt="Event 1" />
              <h3>On water events</h3>
              <button className="learn-more">Learn more</button>
            </div>
            <div className="card" onClick={() => navigate('/events')}>
              <img src="nycimg2.jpg" alt="Event 1" />
              <h3>Functions</h3>
              <button className="learn-more">Learn more</button>
            </div>
           
          </section>
        </div>
      );
    }
    

export default Event;
