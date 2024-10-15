import React, { useState, useEffect } from "react";
import "./styles/stylesVolunteerHistory.css";
import { Link, useNavigate } from "react-router-dom";

function VolunteerHistory() {
  const [members, setMembers] = useState([]); // To store members data
  const [maintenanceTeams, setTeams] = useState([]); // To store teams data
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(""); // Default to show all teams

  const navigate = useNavigate();

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        if (!token) {
          console.error('No token found, redirecting to login.');
          navigate('/login'); // Redirect to login page
          return; // Exit the function
        }

        const response = await fetch("http://localhost:8000/api/members-points-all/", {
          headers: {
            'Authorization': `Bearer ${token}`, // Add the Authorization header
          },
        });
        const data = await response.json();
        console.log("Fetched members data:", data);
        setMembers(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          console.error('Unauthorized: Redirecting to login.');
          navigate('/login'); // Redirect to login if unauthorized
        } else {
          alert('Failed to fetch members. Please try again later.');
        }
      }
    };

    fetchMembers();
  }, [navigate]);

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        if (!token) {
          console.error('No token found, redirecting to login.');
          navigate('/login'); // Redirect to login page
          return; // Exit the function
        }

        const response = await fetch("http://localhost:8000/api/teams/", {
          headers: {
            'Authorization': `Bearer ${token}`, // Add the Authorization header
          },
        });
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        if (error.response && error.response.status === 401) {
          console.error('Unauthorized: Redirecting to login.');
          navigate('/login'); // Redirect to login if unauthorized
        } else {
          alert('Failed to fetch teams. Please try again later.');
        }
      }
    };

    fetchTeams();
  }, [navigate]);


  useEffect(() => {
    const uniqueMembers = new Set();
    const filtered = members.filter((member) => {
      const matchesSearchQuery =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.id.toString().includes(searchQuery);
      const matchesTeam =
        selectedTeamId === "" || member.teams === selectedTeamId;

      if (matchesSearchQuery && matchesTeam) {
        if (!uniqueMembers.has(member.id)) {
          uniqueMembers.add(member.id);
          return true;
        }
        return false;
      }
      return false;
    });

    setFilteredMembers(filtered);
  }, [searchQuery, selectedTeamId, members]);

  const handleTeamFilter = (teamId) => {
    setSelectedTeamId(teamId);
  };

  const downloadCSV = () => {
    const csvRows = [];
    const headers = [
      "Member ID",
      "Name",
      "Member Category",
      "Year",
      "Total Volunteering Hours",
      "Total Points",
    ];
    csvRows.push(headers.join(","));

    filteredMembers.forEach((member) => {
      const values = [
        member.id,
        member.name,
        member.membership_category,
        member.year,
        member.total_hours,
        member.total_points,
      ];
      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "volunteer_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="volunteer-history-container">
      {/* Team Buttons */}
      <div className="team-buttons">
        {maintenanceTeams.map((team) => (
          <button key={team.id} onClick={() => handleTeamFilter(team.id)}>
            {team.name}
          </button>
        ))}
        <button onClick={() => handleTeamFilter("")}>All Teams</button>
        {/* <button>Add New Team</button> */}
      </div>

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
            <th>Name</th>
            <th>Member Category</th>
            <th>Year</th>
            <th>Total Volunteering Hours</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => (
            <tr key={member.id}>
              <td>
                <input type="radio" name="selectedMember" />
              </td>
              <td>{member.id}</td>
              <td>{member.name}</td>
              <td>{member.membership_category}</td>
              <td>{member.year}</td>
              <td>{member.total_hours}</td>
              <td>{member.total_points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Download Button */}
      <button className="download-btn" onClick={downloadCSV}>
        Download CSV
      </button>
    </div>
  );
}

export default VolunteerHistory;
