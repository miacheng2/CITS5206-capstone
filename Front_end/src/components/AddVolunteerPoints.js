import React, { useState, useEffect } from "react";
import "./stylesAdd.css";

function AddVolunteerPoints() {
  const [adminsAndLeaders, setAdminsAndLeaders] = useState([]); // To store users data
  const [members, setMembers] = useState([]); // To store members data
  const [maintenanceTeams, setTeams] = useState([]); // To store teams data
  const [maintenanceEvents, setEvents] = useState([]); // To store events data
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(""); // For team filtering
  const [message, setMessage] = useState(""); // For displaying messages

  useEffect(() => {
    // Fetch users
    fetch("http://localhost:8000/api/users/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched user data:", data);
        setAdminsAndLeaders(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    // Fetch members
    fetch("http://localhost:8000/api/team-members/")
      .then((response) => response.json())
      .then((data) => {
        setMembers(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    // Fetch teams and events
    fetch("http://localhost:8000/api/teams/")
      .then((response) => response.json())
      .then((data) => {
        setTeams(data);
      })
      .catch((error) => console.error("Error fetching teams:", error));

    fetch("http://localhost:8000/api/events/")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  useEffect(() => {
    const filtered = members.filter((member) => {
      const nameMatches = member.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const idMatches = member.australian_sailing_number
        .toString()
        .includes(searchQuery);

      const teamMatches =
        selectedTeam === "" ||
        member.teams.some((team) => team.name === selectedTeam);

      return (nameMatches || idMatches) && teamMatches;
    });
    setFilteredMembers(filtered);
  }, [searchQuery, members, selectedTeam]);

  const handleSelectMember = (member) => {
    setSelectedMember({
      ...member,
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
    setSelectedMember((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    if (field === "startTime" || field === "endTime") {
      const start = new Date(`1970-01-01T${selectedMember.startTime}`);
      const end = new Date(`1970-01-01T${selectedMember.endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      const points = Math.floor(hours * (20 / 3)); // Example: 20 points for 3 hours
      setSelectedMember((prevState) => ({
        ...prevState,
        volunteerHours: hours,
        volunteerPoints: points,
      }));
    }
  };

  const handleSave = () => {
    if (selectedMember) {
      const confirmationMessage = `${selectedMember.firstName} ${selectedMember.lastName} worked ${selectedMember.volunteerHours} hours and earned ${selectedMember.volunteerPoints} points.`;
      if (
        window.confirm(
          `${confirmationMessage} Do you want to save these details?`
        )
      ) {
        setMessage("Details saved successfully!");
        console.log("Saving details for:", selectedMember);

        setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds

        setSelectedMember(null);
      } else {
        setMessage("Save action was cancelled.");
        setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
      }
    } else {
      setMessage("Please select a member.");
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  const handleEdit = (member) => {
    console.log("Editing:", member);
  };

  const handleDelete = () => {
    if (selectedMember) {
      if (
        window.confirm(
          "Are you sure you want to delete the entered data for this member?"
        )
      ) {
        setSelectedMember((prevState) => ({
          ...prevState,
          volunteerDate: "",
          maintenanceTeam: selectedMember.team,
          maintenanceEvent: "",
          startTime: "",
          endTime: "",
          volunteerHours: "",
          volunteerPoints: "",
          comments: "",
          editorName: "",
        }));
        setMessage("Entry cleared for the selected member.");
        setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
        console.log("Cleared entry for member with ID:", selectedMember.id);
      }
    } else {
      setMessage("No member selected to delete data.");
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  const handleTeamFilter = (team) => {
    setSelectedTeam(team);
  };

  return (
    <div className="add-volunteer-container">
      {/* Message Display */}
      {message && <div className="message">{message}</div>}

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
                <button onClick={() => handleEdit(member)}>Edit</button>
                <button
                  onClick={handleSave}
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                >
                  Save
                </button>
                <button
                  onClick={() => handleDelete(member.australian_sailing_number)}
                >
                  Delete
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
