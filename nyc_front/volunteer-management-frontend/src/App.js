import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VolunteerPointsDashboard from './components/VolunteerPointsDashboard';
import AddVolunteerPoints from './components/AddVolunteerPoints';
import CheckVolunteerHistory from './components/CheckVolunteerHistory';
import WorkTeamManagement from './components/WorkTeamManagement';
import Home from './components/home';
import MemberManagement from './components/TeamMemberList';
import AdminUserManagement from './components/AdminUserManagement';
import Event from './components/Event';
import Report from './components/Report';
import RewardCheckin from './components/RewardCheckin';
import Login from './components/login';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route exact path="/login" element={<Login/>} />
          <Route exact path="/membermanagement" element={<MemberManagement />} />
          <Route exact path="/Admin" element={<AdminUserManagement />} />
          <Route exact path="/VolunteerPoint" element={<VolunteerPointsDashboard />} />
          <Route path="/WorkTeamManagement" element={<WorkTeamManagement />} />
          <Route path="/add-points" element={<AddVolunteerPoints />} />
          <Route path="/check-history" element={<CheckVolunteerHistory />} />
          <Route path="/reward-checkin" element={<RewardCheckin />} />
          <Route path="/events" element={<Event/>} />
          <Route path="/reports" element={<Report />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
