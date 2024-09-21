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
import ChangePassword from './components/ChangePassword';
import MemberVolunteerHistory from "./components/MemberVolunteerHistory";

import "./assets/fonts/fonts.css";

function App() {
  // Bug:
  // This doesn't appear to do any validation of the token which causes issues if the token expires
  // At the moment the tokens expire in an hour after logging in
  // We should either check that we have a valid token, or remove the expiry if possible
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Info:
  // Having the userProfile here might cause issues with rendering as the entire app will be rerendered
  // whenever the userProfile changes. For example if somebody updates their email.
  // Feel free to ignore this advice though if you're not seeing any issues.

  // Suggestion:
  // We seem to be missing role information here, which might be helpful with conditionally rendering
  // components that users can see. For example a team leader not being able to see admin components.

  // Suggestion:
  // If userProfile isn't being used, it can probably be deleted
  const [userProfile, setUserProfile] = useState({ username: "", email: "" });

  // Info:
  // This might not be doing what you expect.
  // At the moment, a dependency array of [] means that it only runs on component mount
  // This effectively sets the token twice on mount as it is already being set in the state definition

  // Suggestion:
  // If that is not what you're expecting, you can delete this useEffect
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
              // Info:
              // setUserProfile doesn't seem to be used
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
              // Info:
              // userProfile and setToken don't seem to be used
              element={<Home setToken={setToken} userProfile={userProfile} />}
            />
            <Route path="/memberManagement" element={<TeamMemberList />} />
            <Route
              path="/WorkTeamManagement"
              element={<WorkTeamManagement />}
            />
            <Route
              path="/AdminUserManagement"
              // Info:
              // userProfile doesn't seem to be used
              element={<AdminUserManagement userProfile={userProfile} />}
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
