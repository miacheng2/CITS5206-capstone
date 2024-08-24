import React, { useState, useEffect } from 'react';
import './stylesRewardCheckin.css'; 
import { Link } from 'react-router-dom';

function RewardCheckin() {
  const [members, setMembers] = useState([]); // To store members data
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    // Simulated data for the demo, including total points
    const demoMembers = [
      { id: 1, firstName: 'John', lastName: 'Doe', team: 'Support Boat Maintenance', event: 'Repairs', year: 2023, totalHours: 100, totalPoints: 120 },
      { id: 2, firstName: 'Jane', lastName: 'Smith', team: 'Support Boat Maintenance', event: 'Repairs', year: 2024, totalHours: 80, totalPoints: 80 },
      { id: 3, firstName: 'Bob', lastName: 'Brown', team: 'Storage Maintenance', event: 'Cleaning', year: 2024, totalHours: 100, totalPoints: 210 },
    ];
    setMembers(demoMembers);
  }, []);

  useEffect(() => {
    setFilteredMembers(
      members.filter(member =>
        (member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.id.toString().includes(searchQuery)) &&
        member.totalPoints >= 100 
      )
    );
  }, [searchQuery, members]);

  const handleNotify = (member) => {
    console.log(`Sending notification to ${member.firstName} ${member.lastName}.`);
    // Logic for sending notification
  };

  const handleDownload = () => {
    console.log('Downloading CSV file.');
    // Logic to download the table as a CSV file
  };

  const calculateReward = (points) => {
    return `$${Math.floor(points / 100) * 200}`;
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <img src="nyclogo.jpg" alt="Nedlands Yacht Club Logo" className="logo" />
        <h1>Nedlands Yacht Club</h1>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/WorkTeamManagement">Team Management</Link></li>
          <li><Link to="/membermanagement">Member Management</Link></li>
          <li><Link to="/events">Event</Link></li>
          <li><Link to="/VolunteerPoint">Volunteer Point</Link></li>
          <li><Link to="/reports">Report</Link></li>
          <li><Link to="/Admin">Admin</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </nav>

      <div className="reward-checkin-container">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by ID or Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        {/* Members Table */}
        <table className="reward-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Member ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Maintenance Team</th>
              <th>Maintenance Event</th>
              <th>Year</th>
              <th>Total Volunteering Hours</th>
              <th>Total Points</th>
              <th>Reward</th>
              <th>Notification</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td>
                  <input
                    type="radio"
                    name="selectedMember"
                  />
                </td>
                <td>{member.id}</td>
                <td>{member.firstName}</td>
                <td>{member.lastName}</td>
                <td>{member.team}</td>
                <td>{member.event}</td>
                <td>{member.year}</td>
                <td>{member.totalHours}</td>
                <td>{member.totalPoints}</td>
                <td>{calculateReward(member.totalPoints)}</td>
                <td>
                  <button className="notify-button" onClick={() => handleNotify(member)}>Notify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Download Button */}
        
        <button className="download-btn" onClick={handleDownload}>Download CSV</button>
       
      </div>
    </div>
  );
}

export default RewardCheckin;
