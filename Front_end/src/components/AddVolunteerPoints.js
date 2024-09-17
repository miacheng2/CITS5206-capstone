import React, { useState, useEffect } from "react";
import "./stylesAdd.css";

function AddVolunteerPoints() {
  const [adminsAndLeaders, setUser] = useState([]); // To store users data
  const [members, setMembers] = useState([]); // To store members data
  const [maintenanceTeams, setTeams] = useState([]); // To store teams data
  const [maintenanceEvents, setEvents] = useState([]); // To store events data
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(""); // For team filtering

  // Fetch users
  useEffect(() => {
    fetch("http://localhost:8000/api/users/")
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Fetch members
  useEffect(() => {
    fetch("http://localhost:8000/api/team-members/")
      .then((response) => response.json())
      .then((data) => {
        setMembers(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Fetch teams and events
  useEffect(() => {
    // Fetch teams
    fetch("http://localhost:8000/api/teams/")
      .then((response) => response.json())
      .then((data) => {
        setTeams(data);
      })
      .catch((error) => console.error("Error fetching teams:", error));

    // Fetch events
    fetch("http://localhost:8000/api/events/")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  // fliter user by search query
  useEffect(() => {
    const filtered = members.filter((member) => {
      const nameMatches = member.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const idMatches = member.australian_sailing_number
        .toString()
        .includes(searchQuery);

      // Check if selected team is among the member's teams
      const teamMatches =
        selectedTeam === "" ||
        member.teams.some((team) => team.name === selectedTeam);

      // Return true if name or id matches, and if team matches
      return (nameMatches || idMatches) && teamMatches;
    });
    setFilteredMembers(filtered);
  }, [searchQuery, members, selectedTeam]);

  const handleSelectMember = (member) => {
    setSelectedMember({
      ...member,
      // volunteerDate: latestEvent.date || "",
      volunteerDate: "",
      maintenanceTeam: member.team,
      maintenanceEvent: "",
      startTime: "",
      endTime: "",
      volunteerHours: "",
      volunteerPoints: "",
      comments: "",
      editorName: "",
    });
  };

  const handleInputChange = (field, value) => {
    if (field === "startTime" || field === "endTime") {
      const start = new Date(`1970-01-01T${selectedMember.startTime}`);
      const end = new Date(`1970-01-01T${selectedMember.endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      const points = Math.floor(hours * (20 / 3)); // Example: 20 points for 3 hours
      setSelectedMember((prevState) => ({
        ...prevState,
        [field]: value,
        volunteerHours: hours,
        volunteerPoints: points,
      }));
    } else {
      setSelectedMember((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const handleSave = () => {
    if (selectedMember) {
      setSelectedMember((prevState) => ({
        ...prevState,
        editTime: new Date().toLocaleString(),
      }));
      const editorName = selectedMember.editorName.replace(/\s+/g, " ").trim();
      const selectedAdmin = adminsAndLeaders.find(
        (user) => user.username.trim().toLowerCase() == editorName.toLowerCase()
      );

      if (!selectedAdmin) {
        console.error(
          "Error: No matching admin found for editorName:",
          editorName
        );
        alert("Error: No matching admin found for editorName.");
        return;
      }

      const data = {
        member: selectedMember.australian_sailing_number,
        event: maintenanceEvents.find(
          (event) => event.name === selectedMember.maintenanceEvent
        ).id,
        points: selectedMember.volunteerPoints,
        hours: selectedMember.volunteerHours,
        created_by: selectedAdmin.id,
      };

      console.log("data:", data);

      fetch("http://localhost:8000/api/save-volunteer-points/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Saved details:", data);
          alert("Volunteer points saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving data:", error);
          alert("Failed to save volunteer points.");
        });
    } else {
      console.log("Please select a member");
    }
  };

  const handleTeamFilter = (team) => {
    setSelectedTeam(team);
  };

  return (
    <div className="add-volunteer-container">
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
      <table className="volunteer-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Member ID</th>
            <th>Name</th>
            <th>Date</th>
            <th>Maintenance Team</th>
            <th>Maintenance Event</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Volunteering Hours</th>
            <th>Points</th>
            <th>Comments</th>
            <th>Edited By</th>
            <th>Edit Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => (
            <tr key={member.australian_sailing_number}>
              <td>
                <input
                  type="radio"
                  name="selectedMember"
                  onChange={() => handleSelectMember(member)}
                />
              </td>
              <td>{member.australian_sailing_number}</td>
              <td>{member.name}</td>
              <td>
                <input
                  type="date"
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.volunteerDate
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("volunteerDate", e.target.value)
                  }
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                />
              </td>
              <td>
                <select
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.maintenanceTeam
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("maintenanceTeam", e.target.value)
                  }
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                >
                  <option value="">Select Team</option>
                  {maintenanceTeams.map((team) => (
                    <option key={team.name} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.maintenanceEvent
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("maintenanceEvent", e.target.value)
                  }
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                >
                  <option value="">Select Event</option>
                  {maintenanceEvents.map((event) => (
                    <option key={event.name} value={event.name}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="time"
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.startTime
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                />
              </td>
              <td>
                <input
                  type="time"
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.endTime
                      : ""
                  }
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                />
              </td>
              <td>
                {selectedMember?.australian_sailing_number ===
                member.australian_sailing_number
                  ? selectedMember.volunteerHours
                  : ""}
              </td>
              <td>
                {selectedMember?.australian_sailing_number ===
                member.australian_sailing_number
                  ? selectedMember.volunteerPoints
                  : ""}
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Comments"
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.comments
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("comments", e.target.value)
                  }
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                />
              </td>
              <td>
                <select
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.editorName
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("editorName", e.target.value)
                  }
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                >
                  <option value="">Select Name</option>
                  {adminsAndLeaders.map((user) => (
                    <option key={user.username} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {selectedMember?.australian_sailing_number ===
                member.australian_sailing_number
                  ? selectedMember.editTime
                  : ""}
              </td>
              <td>
                <button
                  onClick={handleSave}
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AddVolunteerPoints;
