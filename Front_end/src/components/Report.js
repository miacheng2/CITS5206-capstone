// import React, { useEffect, useState } from "react";
// import { Bar, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import "./report.css"; // Import the CSS file

// // Register the necessary elements with Chart.js
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const Report = () => {
//   const [volunteers, setVolunteers] = useState([]);
//   const [filteredVolunteers, setFilteredVolunteers] = useState([]);
//   const [groupedVolunteers, setGroupedVolunteers] = useState({});
//   const [selectedTeam, setSelectedTeam] = useState("All Teams");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showTeamPerformanceGraph, setShowTeamPerformanceGraph] =
//     useState(false);
//   const [showVolunteerHoursGraph, setShowVolunteerHoursGraph] = useState(false);
//   const [showTopPerformers, setShowTopPerformers] = useState(false);

//   // Data for team performance comparison graph
//   const teamPerformanceData = {
//     labels: [
//       "Grounds and Gardens",
//       "Support Boat Maintenance",
//       "Storage Maintenance",
//       "Sail Training Boat Maintenance",
//     ],
//     datasets: [
//       {
//         label: "Total Points",
//         data: [300, 450, 200, 350],
//         backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
//       },
//     ],
//   };

//   // Data for monthly volunteer hours graph
//   const volunteerHoursData = {
//     labels: ["January", "February", "March", "April", "May", "June", "July"],
//     datasets: [
//       {
//         label: "Total Volunteering Hours",
//         data: [100, 150, 200, 250, 300, 400, 450],
//         fill: false,
//         borderColor: "#4BC0C0",
//       },
//     ],
//   };

//   // Options for team performance graph
//   const teamPerformanceOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: "top",
//       },
//       title: {
//         display: true,
//         text: "Team Performance Comparison",
//       },
//     },
//   };

//   // Options for volunteer hours graph
//   const volunteerHoursOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: "top",
//       },
//       title: {
//         display: true,
//         text: "Monthly Volunteer Hours",
//       },
//     },
//   };

//   useEffect(() => {
//     const fetchVolunteers = async () => {
//       // Simulated data fetch (replace with actual API call)
//       const data = [
//         {
//           id: 1,
//           name: "John Doe",
//           team: "Grounds and Gardens",
//           totalHours: 40,
//           totalPoints: 150,
//         },
//         {
//           id: 2,
//           name: "Jane Smith",
//           team: "Support Boat Maintenance",
//           totalHours: 35,
//           totalPoints: 120,
//         },
//         {
//           id: 3,
//           name: "Bob Brown",
//           team: "Storage Maintenance",
//           totalHours: 30,
//           totalPoints: 100,
//         },
//         {
//           id: 4,
//           name: "Alice Johnson",
//           team: "Sail Training Boat Maintenance",
//           totalHours: 50,
//           totalPoints: 200,
//         },
//         {
//           id: 5,
//           name: "Eve Davis",
//           team: "Grounds and Gardens",
//           totalHours: 20,
//           totalPoints: 70,
//         },
//       ];

//       setVolunteers(data);
//       setFilteredVolunteers(data);

//       // Group volunteers by team
//       const grouped = data.reduce((acc, curr) => {
//         if (!acc[curr.team]) {
//           acc[curr.team] = [];
//         }
//         acc[curr.team].push(curr);
//         return acc;
//       }, {});

//       // Sort volunteers within each team by total hours
//       for (const team in grouped) {
//         grouped[team].sort((a, b) => b.totalHours - a.totalHours);
//       }

//       setGroupedVolunteers(grouped);
//     };

//     fetchVolunteers();
//   }, []);

//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value);
//     filterVolunteers(e.target.value, selectedTeam);
//   };

//   const handleTeamSelection = (team) => {
//     setSelectedTeam(team);
//     filterVolunteers(searchQuery, team);
//   };

//   const filterVolunteers = (query, team) => {
//     let filtered = volunteers.filter(
//       (volunteer) =>
//         volunteer.name.toLowerCase().includes(query.toLowerCase()) &&
//         (team === "All Teams" || volunteer.team === team)
//     );
//     setFilteredVolunteers(filtered);
//   };

//   return (
//     <div className="report-container">
//       <h1 style={{ color: "#333" }}>Volunteer Reports</h1>

//       {/* Search Bar and Team Selection Buttons */}
//       <div className="filter-section">
//         <input
//           type="text"
//           placeholder="Search by Name"
//           value={searchQuery}
//           onChange={handleSearch}
//           className="search-bar"
//         />

//         <div className="team-buttons">
//           {[
//             "Grounds and Gardens",
//             "Support Boat Maintenance",
//             "Storage Maintenance",
//             "Sail Training Boat Maintenance",
//             "All Teams",
//           ].map((team) => (
//             <button
//               key={team}
//               className={`team-button ${selectedTeam === team ? "active" : ""}`}
//               onClick={() => handleTeamSelection(team)}
//             >
//               {team}
//             </button>
//           ))}
//           <button className="add-team-button">Add New Team</button>
//         </div>
//       </div>

//       {/* Volunteer Data Table */}
//       <div className="table-section">
//         <h2 style={{ color: "#333" }}>All Volunteer Data</h2>
//         <table className="volunteer-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Team</th>
//               <th>Total Hours</th>
//               <th>Total Points</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredVolunteers.map((volunteer) => (
//               <tr key={volunteer.id}>
//                 <td>{volunteer.id}</td>
//                 <td>{volunteer.name}</td>
//                 <td>{volunteer.team}</td>
//                 <td>{volunteer.totalHours}</td>
//                 <td>{volunteer.totalPoints}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Toggle buttons for graphs and top performers */}
//       <div className="toggle-buttons">
//         <button
//           onClick={() => setShowTeamPerformanceGraph(!showTeamPerformanceGraph)}
//         >
//           {showTeamPerformanceGraph
//             ? "Hide Team Performance Graph"
//             : "Show Team Performance Graph"}
//         </button>
//         <button
//           onClick={() => setShowVolunteerHoursGraph(!showVolunteerHoursGraph)}
//         >
//           {showVolunteerHoursGraph
//             ? "Hide Volunteer Hours Graph"
//             : "Show Volunteer Hours Graph"}
//         </button>
//         <button onClick={() => setShowTopPerformers(!showTopPerformers)}>
//           {showTopPerformers ? "Hide Top Performers" : "Show Top Performers"}
//         </button>
//       </div>

//       {/* Section for top performers by team in table format */}
//       {showTopPerformers && (
//         <div className="grouped-volunteers-section">
//           <h2 style={{ color: "#333" }}>Top Volunteers by Team</h2>
//           {Object.keys(groupedVolunteers).map((team) => (
//             <div key={team}>
//               <h3 style={{ color: "#333" }}>{team}</h3>
//               <table className="volunteer-table">
//                 <thead>
//                   <tr>
//                     <th>ID</th>
//                     <th>Name</th>
//                     <th>Total Hours</th>
//                     <th>Total Points</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupedVolunteers[team].slice(0, 3).map((volunteer) => (
//                     <tr key={volunteer.id}>
//                       <td>{volunteer.id}</td>
//                       <td>{volunteer.name}</td>
//                       <td>{volunteer.totalHours}</td>
//                       <td>{volunteer.totalPoints}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Section for graphs */}
//       <div className="chart-section">
//         {showVolunteerHoursGraph && (
//           <div className="chart-container">
//             <Line data={volunteerHoursData} options={volunteerHoursOptions} />
//           </div>
//         )}
//         {showTeamPerformanceGraph && (
//           <div className="chart-container">
//             <Bar data={teamPerformanceData} options={teamPerformanceOptions} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Report;

import React, { useState, useEffect } from "react";
import "./stylesVolunteerHistory.css";
import { Link } from "react-router-dom";

function VolunteerHistory() {
  const [members, setMembers] = useState([]); // To store members data
  const [maintenanceTeams, setTeams] = useState([]); // To store teams data
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(""); // Default to show all teams

  // Fetch members
  useEffect(() => {
    fetch("http://localhost:8000/api/members-points-all/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched members data:", data);
        setMembers(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Fetch teams
  useEffect(() => {
    fetch("http://localhost:8000/api/teams/")
      .then((response) => response.json())
      .then((data) => {
        setTeams(data);
      })
      .catch((error) => console.error("Error fetching teams:", error));
  }, []);

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
