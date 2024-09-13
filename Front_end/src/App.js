import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import TeamMemberList from "./components/TeamMemberList";
import WorkTeamManagement from "./components/WorkTeamManagement";
import AdminUserManagement from "./components/AdminUserManagement";
import EventList from "./components/EventList";
import VolunteerPointsList from "./components/VolunteerPointsList";
import AddVolunteerPoints from "./components/AddVolunteerPoints";
import CheckVolunteerHistory from "./components/CheckVolunteerHistory";
import RewardCheckin from "./components/RewardCheckin";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Report from "./components/Report";
import Home from "./components/Home";
import CheckEventHistory from "./components/CheckEventHistory";

import "./assets/fonts/fonts.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userProfile, setUserProfile] = useState({ username: "", email: "" });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    setToken(null);
    setUserProfile({ username: "", email: "" });
    localStorage.removeItem("token");
  };

  return (
    <Router>
      {!token ? (
        <Routes>
          <Route
            path="/login"
            element={
              <Login setToken={setToken} setUserProfile={setUserProfile} />
            }
          />
          <Route path="/register" element={<Register setToken={setToken} />} />
          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      ) : (
        <>
          <Navbar setToken={setToken} logout={logout} />
          <Routes>
            <Route
              path="/"
              element={<Home setToken={setToken} userProfile={userProfile} />}
            />
            <Route path="/memberManagement" element={<TeamMemberList />} />
            <Route
              path="/WorkTeamManagement"
              element={<WorkTeamManagement />}
            />
            <Route
              path="/AdminUserManagement"
              element={<AdminUserManagement userProfile={userProfile} />}
            />
            <Route path="/add-points" element={<AddVolunteerPoints />} />
            <Route path="/check-history" element={<CheckVolunteerHistory />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/reward-checkin" element={<RewardCheckin />} />
            <Route path="/volunteer-points" element={<VolunteerPointsList />} />
            <Route path="/reports" element={<Report />} />

            <Route path="/logout" element={<Navigate replace to="/login" />} />
            <Route path="/event-history" element={<CheckEventHistory />} />

            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;
