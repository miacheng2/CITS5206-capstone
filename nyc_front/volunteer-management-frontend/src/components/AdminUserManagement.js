import React from 'react';
import styles from './AdminUserManagement.module.css';
import {Link } from 'react-router-dom';

const AdminUserManagement = () => {
    const handleActionClick = (message) => {
        alert(message);
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
            <li><Link to="/">Logout</Link></li>
          </ul>
        </nav>
        <div className={styles.container}>
            <h2>Admin User Management</h2>
            <div className={styles.feature}>
                <h2>Create</h2>
                <button className={styles.button} onClick={() => handleActionClick('Admin creates users')}>
                    Admin creates users
                </button>
            </div>
            <div className={styles.feature}>
                <h2>Edit Profile</h2>
                <button className={styles.button} onClick={() => handleActionClick('User edits their profile')}>
                    Edits profile
                </button>
            </div>
            <div className={styles.feature}>
                <h2>Change Password</h2>
                <button className={styles.button} onClick={() => handleActionClick('User changes their password')}>
                    User changes their password
                </button>
            </div>
        </div>
        </div>
    );
};

export default AdminUserManagement;