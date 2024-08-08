import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './styles/Navbar.module.css';


function Navbar({ setToken }) {

    const [showDropdown, setShowDropdown] = useState(false);


    const handleMouseEnter = () => {
        setShowDropdown(true);
    };

    const handleMouseLeave = () => {
        setShowDropdown(false);
    };

    return (
        <div className={styles.navbarOutter}>
            <div className={styles.rightDiv}>
                <img src="/pic/NYC.jpg" className={styles.logo} alt="Yacht Club Logo" />
                <h2>(08) 9386 5496</h2>
            </div>
            <nav className={styles.navbar}>

                <ul className={styles.navList}>
                    <li><Link className={styles.navLink} to="/"><b>Home</b></Link></li>
                    <li><Link className={styles.navLink} to="/memberManagement"><b>Member management</b></Link></li>
                    <li><Link className={styles.dropdownItem} to="/WorkTeamManagement"><b>Team Member Management</b></Link></li>
                    <li><Link className={styles.navLink} to="/AdminUserManagement"><b>Admin User Management</b></Link></li>
                    <li><Link className={styles.navLink} to="/volunteer-points"><b>Volunteer Points</b></Link></li>
                    <li><Link className={styles.navLink} to="/events"><b>Events</b></Link></li>
                </ul>
            </nav>
            <div className={styles.leftDiv}>
                <button className={styles.logoutButton} onClick={() => { localStorage.removeItem('token'); setToken(null); }}><b>Logout</b></button>
            </div>
        </div>
    );
}

export default Navbar;

