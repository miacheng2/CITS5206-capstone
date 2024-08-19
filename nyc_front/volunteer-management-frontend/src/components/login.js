import React from 'react';
import { Link } from 'react-router-dom';
import './login.css';  

function Login() {
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
        
        </ul>
      </nav>
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back!</h2>
        <form>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="signup-text">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
    </div>
  );
}

export default Login;
