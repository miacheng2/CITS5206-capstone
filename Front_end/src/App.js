import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";  // Corrected import statement
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
import ChangePassword from './components/ChangePassword';
import MemberVolunteerHistory from "./components/MemberVolunteerHistory";

import "./assets/fonts/fonts.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userProfile, setUserProfile] = useState({ username: "", email: "" });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);  // Updated to use jwtDecode
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          logout();
        } else {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Invalid token", error);
        logout();
      }
    }
  }, []);

  const logout = () => {
    setToken(null);
    setUserProfile({ username: "", email: "" });
    localStorage.removeItem("token");
    // Redirect to login after logout
    window.location.href = "/login";
  };

  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
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
              element={
                <PrivateRoute>
                  <Home setToken={setToken} userProfile={userProfile} />
                </PrivateRoute>
              }
            />
            <Route
              path="/memberManagement"
              element={
                <PrivateRoute>
                  <TeamMemberList />
                </PrivateRoute>
              }
            />
            <Route
              path="/WorkTeamManagement"
              element={
                <PrivateRoute>
                  <WorkTeamManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/AdminUserManagement"
              element={
                <PrivateRoute>
                  <AdminUserManagement userProfile={userProfile} />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-points"
              element={
                <PrivateRoute>
                  <AddVolunteerPoints />
                </PrivateRoute>
              }
            />
            <Route
              path="/check-history"
              element={
                <PrivateRoute>
                  <CheckVolunteerHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <EventList />
                </PrivateRoute>
              }
            />
            <Route
              path="/reward-checkin"
              element={
                <PrivateRoute>
                  <RewardCheckin />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer-points"
              element={
                <PrivateRoute>
                  <VolunteerPointsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Report />
                </PrivateRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              }
            />
            <Route path="/logout" element={<Navigate replace to="/login" />} />
            <Route
              path="/event-history"
              element={
                <PrivateRoute>
                  <CheckEventHistory />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate replace to="/" />} />
            <Route
              path="/volunteer-history/:uid"
              element={
                <PrivateRoute>
                  <MemberVolunteerHistory />
                </PrivateRoute>
              }
            />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;
