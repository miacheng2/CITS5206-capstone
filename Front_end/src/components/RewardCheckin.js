import React, { useState, useEffect } from 'react';
import './stylesRewardCheckin.css';

function RewardCheckin() {
  const [members, setMembers] = useState([]); // To store members data
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(""); // For team filtering
  const [maintenanceTeams, setTeams] = useState([]); // To store teams data
  const currentYear = new Date().getFullYear(); // Get the current year

  useEffect(() => {
    // Fetch members
    fetch("http://localhost:8000/api/team-members/")
      .then((response) => response.json())
      .then((data) => {
        setMembers(data);
      })
      .catch((error) => console.error("Error fetching members data:", error));
  }, []);

  useEffect(() => {
    // Fetch teams
    fetch("http://localhost:8000/api/teams/")
      .then((response) => response.json())
      .then((data) => {
        setTeams(data);
      })
      .catch((error) => console.error("Error fetching teams:", error));
  }, []);

  useEffect(() => {
    setFilteredMembers(
      members.filter(member =>
        (member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || // Safe check with optional chaining
        member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) || // Safe check with optional chaining
        member.id?.toString().includes(searchQuery)) && // Safe check with optional chaining
        (selectedTeam === "" || member.teams?.some((team) => team.name === selectedTeam)) && // Safe check with optional chaining
        member.totalPoints > 100 && // Check for total points above 100
        member.year === currentYear // Check if the year matches the current year
      )
    );
  }, [searchQuery, members, selectedTeam, currentYear]);

  const handleNotify = (member) => {
    console.log(`Sending notification to ${member.firstName} ${member.lastName}.`);
    // Logic for sending notification
  };

  const handleDownload = () => {
    console.log('Downloading CSV file.');
    // Logic to download the table as a CSV file
  };

  const handleTeamFilter = (team) => {
    setSelectedTeam(team);
  };

  return (
    <div className="reward-checkin-container">
      {/* Team Buttons */}
      <div className="team-buttons">
        {maintenanceTeams.map((team) => (
          <button key={team.name} onClick={() => handleTeamFilter(team.name)}>
            {team.name}
          </button>
        ))}
        <button onClick={() => handleTeamFilter("")}>All Teams</button>
      </div>

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
  );
}

export default RewardCheckin;
