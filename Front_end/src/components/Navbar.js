import React from 'react';
import { NavLink } from 'react-router-dom';

import styles from './styles/Navbar.module.css';

function Navbar({ setToken }) {

  
    return (
        <div className={styles.navbarOutter}>
            <div className={styles.rightDiv}>
                <img src="/pic/NYC.jpg" className={styles.logo} alt="Yacht Club Logo" />
                <h2>Nedlands Yacht Club</h2>
            </div>
            <nav className={styles.navbar}>
                <ul className={styles.navList}>
                    <li><NavLink exact to="/" activeClassName={styles.active}><b>Home</b></NavLink></li>
                    <li><NavLink to="/memberManagement" activeClassName={styles.active}><b>Member Management</b></NavLink></li>
                    <li><NavLink to="/WorkTeamManagement" activeClassName={styles.active}><b>Team Member Management</b></NavLink></li>
                    <li><NavLink to="/AdminUserManagement" activeClassName={styles.active}><b>Admin User Management</b></NavLink></li>
                    <li><NavLink to="/volunteer-points" activeClassName={styles.active}><b>Volunteer Points</b></NavLink></li>
                    <li><NavLink to="/events" activeClassName={styles.active}><b>Events</b></NavLink></li>
                </ul>
            </nav>
            <div className={styles.leftDiv}>
                <button className={styles.logoutButton} onClick={() => { localStorage.removeItem('token'); setToken(null); }}><b>Logout</b></button>
            </div>
        </div>
    );
}

export default Navbar;

