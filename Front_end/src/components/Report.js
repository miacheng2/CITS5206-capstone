import React, { useState, useEffect, useCallback } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./report.css";

// Register the necessary elements with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function VolunteerHistory() {
  const [members, setMembers] = useState([]);
  const [maintenanceTeams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // State for selected Member Category
  const [selectedYear, setSelectedYear] = useState(""); // State for selected Year
  const [selectedTotalPoints, setSelectedTotalPoints] = useState(""); // State for selected Total Points filter
  const [selectedMembers, setSelectedMembers] = useState(new Set()); // State for selected members
  const [selectAll, setSelectAll] = useState(false); // State for "Select All"
  const [showTeamPerformanceGraph, setShowTeamPerformanceGraph] =
    useState(false);
  const [showVolunteerHoursGraph, setShowVolunteerHoursGraph] = useState(false);
  const [showTopPerformers, setShowTopPerformers] = useState(false);
  const [monthlyVolunteerHours, setMonthlyVolunteerHours] = useState([]);
  const [topPerformers, setTopPerformers] = useState({});

  // Memoized function to calculate top performers by team
  const calculateTopPerformers = useCallback(
    (data) => {
      const performersByTeam = {};

      maintenanceTeams.forEach((team) => {
        const teamPerformers = data
          .filter((member) => member.teams === team.id)
          .sort((a, b) => b.total_hours - a.total_hours) // Sort by total hours descending
          .slice(0, 3); // Get top 3 performers

        performersByTeam[team.id] = teamPerformers;
      });

      console.log("Calculated Top Performers by Team:", performersByTeam);
      setTopPerformers(performersByTeam);
    },
    [maintenanceTeams]
  );

  // Fetch members and calculate initial data
  useEffect(() => {
    fetch("http://localhost:8000/api/members-points-all/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched members data:", data);
        setMembers(data);
        calculateMonthlyVolunteerHours(data);
        calculateTopPerformers(data); // Calculate top performers after fetching data
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [calculateTopPerformers]); // Include calculateTopPerformers as a dependency

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
      console.log("selectedMember", member);
      console.log("selectedYear", selectedYear);
      console.log("selectedPoint", selectedTotalPoints);
      const matchesSearchQuery =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.id.toString().includes(searchQuery);
      const matchesTeam =
        selectedTeamId === "" || member.teams === selectedTeamId;
      const matchesCategory =
        selectedCategory === "" ||
        member.membership_category === selectedCategory;
      const matchesYear =
        selectedYear === "" || member.year.toString() === selectedYear;
      const matchesTotalPoints =
        selectedTotalPoints === "" ||
        (selectedTotalPoints === ">=200" &&
          Number(member.total_points) >= 200) ||
        (selectedTotalPoints === "<200" && Number(member.total_points) < 200);

      if (
        matchesSearchQuery &&
        matchesTeam &&
        matchesCategory &&
        matchesYear &&
        matchesTotalPoints
      ) {
        if (!uniqueMembers.has(member.id)) {
          uniqueMembers.add(member.id);
          return true;
        }
        return false;
      }
      return false;
    });

    setFilteredMembers(filtered);
  }, [
    searchQuery,
    selectedTeamId,
    selectedCategory,
    selectedYear,
    selectedTotalPoints, // Add this dependency
    members,
  ]);

  const handleTeamFilter = (teamId) => {
    setSelectedTeamId(teamId);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleYearFilter = (year) => {
    setSelectedYear(year);
  };

  const handleTotalPointsFilter = (pointsFilter) => {
    setSelectedTotalPoints(pointsFilter);
  };

  const handleMemberSelect = (memberId) => {
    setSelectedMembers((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      if (updatedSelection.has(memberId)) {
        updatedSelection.delete(memberId);
      } else {
        updatedSelection.add(memberId);
      }
      return updatedSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((member) => member.id)));
    }
    setSelectAll(!selectAll);
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

    filteredMembers
      .filter((member) => selectedMembers.has(member.id))
      .forEach((member) => {
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

  // Function to calculate volunteer hours per month
  const calculateMonthlyVolunteerHours = (data) => {
    const monthlyHours = Array(12).fill(0); // Initialize an array for 12 months

    data.forEach((member) => {
      if (member.volunteer_dates) {
        member.volunteer_dates.forEach((entry) => {
          const date = new Date(entry.date); // Assuming each entry has a 'date' field
          const month = date.getMonth(); // Get month (0 = January, 1 = February, etc.)
          monthlyHours[month] += entry.hours; // Sum up hours for each month
        });
      }
    });

    console.log("Calculated Monthly Volunteer Hours:", monthlyHours);
    setMonthlyVolunteerHours(monthlyHours);
  };

  // Prepare data for volunteer hours graph
  const volunteerHoursData = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Total Volunteering Hours",
        data: monthlyVolunteerHours,
        fill: false,
        borderColor: "#4BC0C0",
        backgroundColor: "#4BC0C0",
        tension: 0.1,
      },
    ],
  };

  const teamPerformanceData = {
    labels: maintenanceTeams.map((team) => team.name),
    datasets: [
      {
        label: "Total Points",
        data: maintenanceTeams.map((team) => {
          const teamMembers = members.filter(
            (member) => member.teams === team.id
          );
          return teamMembers.reduce(
            (total, member) => total + member.total_points,
            0
          );
        }),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const teamPerformanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Team Performance Comparison",
      },
    },
  };

  const volunteerHoursOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Volunteer Hours",
      },
    },
  };

  const uniqueCategories = [
    ...new Set(members.map((member) => member.membership_category)),
  ];
  const uniqueYears = [...new Set(members.map((member) => member.year))];

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
      </div>
      {/* Dropdown for Member Category */}
      <div className="filter-dropdowns">
        <label htmlFor="category-filter">Filter by Category:</label>
        <select
          id="category-filter"
          onChange={(e) => handleCategoryFilter(e.target.value)}
          value={selectedCategory}
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Dropdown for Year */}
        <label htmlFor="year-filter">Filter by Year:</label>
        <select
          id="year-filter"
          onChange={(e) => handleYearFilter(e.target.value)}
          value={selectedYear}
        >
          <option value="">All Years</option>
          {uniqueYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Dropdown for Total Points */}
        <label htmlFor="points-filter">Filter by Total Points:</label>
        <select
          id="points-filter"
          onChange={(e) => handleTotalPointsFilter(e.target.value)}
          value={selectedTotalPoints}
        >
          <option value="">All Points</option>
          <option value=">=200">Points &gt;= 200</option>
          <option value="<200">Points &lt; 200</option>
        </select>
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
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
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
                <input
                  type="checkbox"
                  checked={selectedMembers.has(member.id)}
                  onChange={() => handleMemberSelect(member.id)}
                />
              </td>
              <td>{member.uid}</td>
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

      {/* Toggle buttons for graphs and top performers */}
      <div className="toggle-buttons">
        <button
          onClick={() => setShowTeamPerformanceGraph(!showTeamPerformanceGraph)}
        >
          {showTeamPerformanceGraph
            ? "Hide Team Performance Graph"
            : "Show Team Performance Graph"}
        </button>
        <button
          onClick={() => setShowVolunteerHoursGraph(!showVolunteerHoursGraph)}
        >
          {showVolunteerHoursGraph
            ? "Hide Volunteer Hours Graph"
            : "Show Volunteer Hours Graph"}
        </button>
        <button onClick={() => setShowTopPerformers(!showTopPerformers)}>
          {showTopPerformers ? "Hide Top Performers" : "Show Top Performers"}
        </button>
      </div>

      {/* Section for top performers by team in table format */}
      {showTopPerformers && (
        <div className="grouped-volunteers-section">
          <h2 style={{ color: "#333" }}>Top Volunteers by Team</h2>
          {Object.keys(topPerformers).map((teamId) => (
            <div key={teamId}>
              <h3 style={{ color: "#333" }}>
                {
                  maintenanceTeams.find((team) => team.id === parseInt(teamId))
                    ?.name
                }
              </h3>
              <table className="volunteer-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Total Hours</th>
                    <th>Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformers[teamId]?.map((volunteer) => (
                    <tr key={volunteer.id}>
                      <td>{volunteer.uid}</td>
                      <td>{volunteer.name}</td>
                      <td>{volunteer.total_hours}</td>
                      <td>{volunteer.total_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Section for graphs */}
      <div className="chart-section">
        {showVolunteerHoursGraph && (
          <div className="chart-container">
            <Line data={volunteerHoursData} options={volunteerHoursOptions} />
          </div>
        )}
        {showTeamPerformanceGraph && (
          <div className="chart-container">
            <Bar data={teamPerformanceData} options={teamPerformanceOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerHistory;
