import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import styles from './styles/Navbar.module.css';

function Navbar({ logout }) {
    const navigate = useNavigate();

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    // Helper function to determine the class name based on the active state
    const getNavLinkClass = (isActive) => isActive ? `${styles.active} ${styles.navLink}` : styles.navLink;

    return (
        <div className={styles.navbarOutter}>
            <div className={styles.rightDiv}>
                <img src="/pic/NYC.jpg" className={styles.logo} alt="Yacht Club Logo" />
                <h2>Nedlands Yacht Club</h2>
            </div>
            <nav className={styles.navbar}>
                <ul className={styles.navList}>
                    <li><NavLink to="/" className={({ isActive }) => getNavLinkClass(isActive)}><b>Home</b></NavLink></li>
                    <li><NavLink to="/memberManagement" className={({ isActive }) => getNavLinkClass(isActive)}><b>Member Management</b></NavLink></li>
                    <li><NavLink to="/WorkTeamManagement" className={({ isActive }) => getNavLinkClass(isActive)}><b>Team Member Management</b></NavLink></li>
                    <li><NavLink to="/AdminUserManagement" className={({ isActive }) => getNavLinkClass(isActive)}><b>Admin Management</b></NavLink></li>
                    <li><NavLink to="/add-points" className={({ isActive }) => getNavLinkClass(isActive)}><b>Volunteer Points</b></NavLink></li>
                    <li><NavLink to="/events" className={({ isActive }) => getNavLinkClass(isActive)}><b>Events</b></NavLink></li>
                    <li><NavLink to="/reports" className={({ isActive }) => getNavLinkClass(isActive)}><b>Reports</b></NavLink></li>
                </ul>
            </nav>
            <div className={styles.leftDiv}>
                <button onClick={handleChangePassword}><b>Change Password</b></button>
                <button onClick={logout}><b>Logout</b></button>
            </div>
        </div>
    );
}

export default Navbar;