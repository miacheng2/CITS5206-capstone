import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import styles from './styles/Navbar.module.css';

function Navbar({ logout }) {
    const navigate = useNavigate();

    // Define the handleChangePassword function
    const handleChangePassword = () => {
        navigate('/change-password');
    };

    return (
        <div className={styles.navbarOutter}>
            <div className={styles.rightDiv}>
                <img src="/pic/NYC.jpg" className={styles.logo} alt="Yacht Club Logo" />
                <h2>Nedlands Yacht Club</h2>
            </div>
            <nav className={styles.navbar}>
                <ul className={styles.navList}>
                    {/* Bug: */}
                    {/* activeClassName has been removed from React router, and it shows an error in the console */}
                    {/* Updating this to just className should resolve the error */}
                    {/* Bug: */}
                    {/* Exact seems to cause a console error */}
                    {/* Info :*/}
                    {/* Clicking on these can be difficult as only clicking on the text works, not the entire yellow button */}
                    <li><NavLink exact to="/" activeClassName={styles.active}><b>Home</b></NavLink></li>
                    <li><NavLink to="/memberManagement" activeClassName={styles.active}><b>Member Management</b></NavLink></li>
                    <li><NavLink to="/WorkTeamManagement" activeClassName={styles.active}><b>Team Member Management</b></NavLink></li>
                    <li><NavLink to="/AdminUserManagement" activeClassName={styles.active}><b>Admin Management</b></NavLink></li>
                    <li><NavLink to="/volunteer-points" activeClassName={styles.active}><b>Volunteer Points</b></NavLink></li>
                    <li><NavLink to="/events" activeClassName={styles.active}><b>Events</b></NavLink></li>
                    <li><NavLink to="/reports" activeClassName={styles.active}><b>Reports</b></NavLink></li>
                </ul>
            </nav>
            <div className={styles.leftDiv}>
                {/* Info: */}
                {/* These class names don't appear to be defined in css anywhere */}
                <button
                    className={styles.passwordButton}
                    onClick={handleChangePassword}
                >
                    <b>Change Password</b>
                </button>

                <button
                    className={styles.logoutButton}
                    onClick={logout}
                >
                    <b>Logout</b>
                </button>
            </div>
        </div>
    );
}

export default Navbar;
