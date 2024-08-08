import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TeamMemberList from './components/TeamMemberList';
import WorkTeamManagement from './components/WorkTeamManagement';
import AdminUserManagement from './components/AdminUserManagement';
import EventList from './components/EventList';
import VolunteerPointsList from './components/VolunteerPointsList';
import Login from './components/Login';
import styles from './Navbar.module.css'; // 确保CSS模块被使用

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [showDropdown, setShowDropdown] = useState(false);  // 新状态用于控制下拉菜单的显示

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleMouseEnter = () => {
        setShowDropdown(true);
    };

    const handleMouseLeave = () => {
        setShowDropdown(false);
    };

    if (!token) {
        return <Login setToken={setToken} />;
    }

    return (
        <Router>
            <nav className={styles.navbar}>
                <img src="/pic/NYC.jpg" className={styles.logo} alt="Yacht Club Logo" />
                <ul className={styles.navList}>
                    <li><Link className={styles.navLink} to="/">Home</Link></li>
                    <li><Link className={styles.navLink} to="/memberManagement">Member management</Link></li>
                    <li
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Link className={styles.navLink} to="/WorkTeamManagement">Work Team Management</Link>
                        {showDropdown && (
                            <div className={styles.dropdownContent}>
                                <Link className={styles.dropdownItem} to="/viewTeamMember">View team member</Link>
                                <Link className={styles.dropdownItem} to="/editTeamMember">Edit team member</Link>
                            </div>
                        )}
                    </li>
                    <li><Link className={styles.navLink} to="/AdminUserManagement">Admin User Management</Link></li>
                    <li><Link className={styles.navLink} to="/volunteer-points">Volunteer Points</Link></li>
                    <li><Link className={styles.navLink} to="/events">Events</Link></li>
                    <li><button className={styles.logoutButton} onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button></li>
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={<TeamMemberList />} />
                <Route path="/memberManagement" element={<TeamMemberList />} />
                <Route path="/WorkTeamManagement" element={<WorkTeamManagement />} />
                <Route path="/AdminUserManagement" element={<AdminUserManagement />} />
                <Route path="/events" element={<EventList />} />
                <Route path="/volunteer-points" element={<VolunteerPointsList />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
            </Routes>
        </Router>
    );
}

export default App;