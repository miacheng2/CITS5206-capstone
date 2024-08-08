import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TeamMemberList from './components/TeamMemberList';
import EventList from './components/EventList';
import VolunteerPointsList from './components/VolunteerPointsList';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import EditProfile from './components/EditProfile';
import CreateLeader from './components/CreateLeader';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    if (!token) {
        return <Login setToken={setToken} />;
    }

    return (
        <Router>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/team-members">Team Members</Link></li>
                    <li><Link to="/events">Events</Link></li>
                    <li><Link to="/volunteer-points">Volunteer Points</Link></li>
                    <li><Link to="/edit-profile">Edit Profile</Link></li>
                    <li><Link to="/change-password">Change Password</Link></li>
                    <li><Link to="/create-leader">Create Leader</Link></li> {/* New link for creating leader */}
                    <li><button onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button></li>
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={<TeamMemberList />} />
                <Route path="/team-members" element={<TeamMemberList />} />
                <Route path="/events" element={<EventList />} />
                <Route path="/volunteer-points" element={<VolunteerPointsList />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/create-leader" element={<CreateLeader />} /> {/* New route for creating leader */}
                <Route path="/login" element={<Login setToken={setToken} />} />
            </Routes>
        </Router>
    );
}

export default App;
