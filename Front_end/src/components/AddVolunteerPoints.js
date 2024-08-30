import React, { useState, useEffect } from "react";
import "./stylesAdd.css";
import { Link } from "react-router-dom";

function AddVolunteerPoints() {
  const [adminsAndLeaders, setUser] = useState([]); // To store users data
  const [members, setMembers] = useState([]); // To store members data
  const [maintenanceTeams, setTeams] = useState([]); // To store teams data
  const [maintenanceEvents, setEvents] = useState([]); // To store events data
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(""); // For team filtering

  // // Simulated list of admins and leaders
  // const adminsAndLeaders = ["Admin1", "Leader1", "Admin2", "Leader2"];

  // // List of maintenance teams and events
  // const maintenanceTeams = [
  //   "Grounds and Gardens",
  //   "Support Boat Maintenance",
  //   "Storage Maintenance",
  //   "Sail Training Boat Maintenance",
  // ];
  // const maintenanceEvents = [
  //   "Busy Bee",
  //   "Repairs",
  //   "Cleaning",
  //   "F Shed Drain repairs",
  // ];

  // useEffect(() => {
  //   // Simulated data for the demo
  //   const demoMembers = [
  //     { id: 1, firstName: 'John', lastName: 'Doe', team: 'Grounds and Gardens' },
  //     { id: 2, firstName: 'Jane', lastName: 'Smith', team: 'Support Boat Maintenance' },
  //     { id: 3, firstName: 'Bob', lastName: 'Brown', team: 'Storage Maintenance' },
  //   ];
  //   setMembers(demoMembers);
  // }, []);
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
        console.log("Fetched members data:", data);
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

      // Check if the selected team is among the member's teams
      const teamMatches =
        selectedTeam === "" || member.team.includes(selectedTeam);

      // Return true if name or id matches, and if team matches
      return (nameMatches || idMatches) && teamMatches;
    });
    setFilteredMembers(filtered);
  }, [searchQuery, members, selectedTeam]);

  const handleSelectMember = (member) => {
    // Find the latest event or set a default date
    // const latestEvent = maintenanceEvents.reduce((latest, event) => {
    //   return new Date(event.date) > new Date(latest.date) ? event : latest;
    // }, maintenanceEvents[0] || { date: "" });

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
      console.log("Saving details for:", selectedMember);
      // Here, you'd typically send this data to your backend for saving
    } else {
      console.log("Please select a member");
    }
  };

  const handleEdit = (member) => {
    console.log("Editing:", member);
    // Logic to handle edit, populate fields with member's data
  };

  const handleDelete = (memberId) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setFilteredMembers(
        filteredMembers.filter(
          (member) => member.australian_sailing_number !== memberId
        )
      );
      console.log("Deleted member with ID:", memberId);
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
        <button>Add New Team</button>
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
                    <option key={user.name} value={user.name}>
                      {user.name}
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
