import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrected import statement
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
import ChangePassword from "./components/ChangePassword";
import MemberVolunteerHistory from "./components/MemberVolunteerHistory";
import PasswordResetConfirm from "./components/PasswordResetConfirm";
import PasswordResetRequest from "./components/PasswordResetRequest";
import EventVolunteerHistory from "./components/EventVolunteerJHistory";

import "./assets/fonts/fonts.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
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
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
          <Route
            path="/password-reset-confirm/:uidb64/:token"
            element={<PasswordResetConfirm />}
          />
          <Route
            path="/password-reset-request"
            element={<PasswordResetRequest />}
          />
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
                  <Home />
                </PrivateRoute>
              }
            />
            <Route path="/memberManagement" element={<TeamMemberList />} />
            <Route
              path="/WorkTeamManagement"
              element={<WorkTeamManagement />}
            />
            <Route
              path="/AdminUserManagement"
              element={
                <PrivateRoute>
                  <AdminUserManagement />
                </PrivateRoute>
              }
            />

            <Route path="/add-points" element={<AddVolunteerPoints />} />
            <Route path="/check-history" element={<CheckVolunteerHistory />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/reward-checkin" element={<RewardCheckin />} />
            <Route path="/volunteer-points" element={<VolunteerPointsList />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/logout" element={<Navigate replace to="/login" />} />
            <Route path="/event-history" element={<CheckEventHistory />} />
            <Route
              path="/event-volunteer-history/:eventId"
              element={<EventVolunteerHistory />}
            />
            <Route path="*" element={<Navigate replace to="/" />} />

            <Route
              path="/volunteer-history/:uid"
              element={<MemberVolunteerHistory />}
            />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;
