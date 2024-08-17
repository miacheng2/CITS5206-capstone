import React, { useState, useEffect } from 'react';
import './stylesVolunteerHistory.css'; 
import { Link } from 'react-router-dom';

function VolunteerHistory() {
  const [members, setMembers] = useState([]); // To store members data
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    // Simulated data for the demo
    const demoMembers = [
      { id: 1, firstName: 'John', lastName: 'Doe', maintenanceTeam: 'Grounds and Gardens', maintenanceEvent: 'Busy Bee', year: 2024, totalHours: 12, totalPoints: 80 },
      { id: 2, firstName: 'Jane', lastName: 'Smith', maintenanceTeam: 'Support Boat Maintenance', maintenanceEvent: 'Repairs', year: 2024, totalHours: 15, totalPoints: 100 },
      { id: 3, firstName: 'Bob', lastName: 'Brown', maintenanceTeam: 'Storage Maintenance', maintenanceEvent: 'Cleaning', year: 2024, totalHours: 8, totalPoints: 50 },
    ];
    setMembers(demoMembers);
  }, []);

  useEffect(() => {
    setFilteredMembers(
      members.filter(member => 
        member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.id.toString().includes(searchQuery)
      )
    );
  }, [searchQuery, members]);

  const downloadCSV = () => {
    const csvRows = [];
    const headers = ['Member ID', 'First Name', 'Last Name', 'Maintenance Team', 'Maintenance Event', 'Year', 'Total Volunteering Hours', 'Total Points'];
    csvRows.push(headers.join(','));

    filteredMembers.forEach(member => {
      const values = [
        member.id,
        member.firstName,
        member.lastName,
        member.maintenanceTeam,
        member.maintenanceEvent,
        member.year,
        member.totalHours,
        member.totalPoints
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'volunteer_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <li><Link to="/membermangement">Member Management</Link></li>
          <li><Link to="/events">Event</Link></li>
          <li><Link to="/VolunteerPoint">Volunteer Point</Link></li>
          <li><Link to="/reports">Report</Link></li>
          <li><Link to="/Admin">Admin</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </nav>

      <div className="volunteer-history-container">
        {/* Search Bar */}
        <input 
          type="text" 
          placeholder="Search by ID or Name" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        {/* Volunteer History Table */}
        <table className="volunteer-history-table">
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
                <td>{member.maintenanceTeam}</td>
                <td>{member.maintenanceEvent}</td>
                <td>{member.year}</td>
                <td>{member.totalHours}</td>
                <td>{member.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Download Button */}
        <button className="download-btn" onClick={downloadCSV}>Download CSV</button>
      </div>
    </div>
  );
}

export default VolunteerHistory;
