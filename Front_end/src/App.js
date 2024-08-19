import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TeamMemberList from './components/TeamMemberList';
import WorkTeamManagement from './components/WorkTeamManagement';
import AdminUserManagement from './components/AdminUserManagement';
import EventList from './components/EventList';
import VolunteerPointsList from './components/VolunteerPointsList';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Home from './components/Home';

import './assets/fonts/fonts.css';


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
                <Route path="/" element={<Home setToken={setToken} />} />

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