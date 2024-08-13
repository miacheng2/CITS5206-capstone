import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TeamMemberList from './components/TeamMemberList';
import WorkTeamManagement from './components/WorkTeamManagement';
import AdminUserManagement from './components/AdminUserManagement';
import EventList from './components/EventList';
import VolunteerPointsList from './components/VolunteerPointsList';
import Login from './components/Login';
<<<<<<< HEAD
import Navbar from './components/Navbar';
import './assets/fonts/fonts.css';

=======
import ChangePassword from './components/ChangePassword';
import EditProfile from './components/EditProfile';
import CreateLeader from './components/CreateLeader';
>>>>>>> origin/main

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    if (!token) {
        return <>
            <Login setToken={setToken} />
        </>;
    }

    return (
        <Router>
            <Navbar setToken={setToken} />
            <Routes>
                <Route path="/" element={<TeamMemberList />} />
                <Route path="/memberManagement" element={<TeamMemberList />} />
                <Route path="/WorkTeamManagement" element={<WorkTeamManagement />} />
                <Route path="/AdminUserManagement" element={<AdminUserManagement />} />
                <Route path="/events" element={<EventList />} />
                <Route path="/volunteer-points" element={<VolunteerPointsList />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/create-leader" element={<CreateLeader />} /> {/* New route for creating leader */}
                <Route path="/login" element={<Login setToken={setToken} />} />
            </Routes>
        </Router >
    );
}

export default App;