import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./stylesAdd.css";
import sailImage from "./NYC.jpg";
import { useNavigate } from "react-router-dom";

function AddVolunteerPoints() {
  const [adminsAndLeaders, setUser] = useState([]); // To store users data
  const [members, setMembers] = useState([]); // To store members data
  const [maintenanceTeams, setTeams] = useState([]); // To store teams data
  const [maintenanceEvents, setEvents] = useState([]); // To store events data
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(""); // For team filtering
  const navigate = useNavigate();

  const [modalMessage, setModalMessage] = useState(""); // Modal message state
  const [isModalOpen, setModalOpen] = useState(false); // Modal visibility state

  const fetchWithToken = async (url) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login.");
      // Handle the absence of token (e.g., redirect to login)
      navigate("/login");
      return null;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      console.error("Unauthorized: Redirecting to login.");
      // Handle unauthorized access (e.g., redirect to login)
      navigate("/login");
      return null;
    }

    return response.json();
  };

  // Fetch users, members, teams, and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchWithToken(
          "http://localhost:8000/api/users/"
        );
        if (usersData) setUser(usersData);

        const membersData = await fetchWithToken(
          "http://localhost:8000/api/team-members/"
        );
        if (membersData) setMembers(membersData);

        const teamsData = await fetchWithToken(
          "http://localhost:8000/api/teams/"
        );
        if (teamsData) setTeams(teamsData);

        const eventsData = await fetchWithToken(
          "http://localhost:8000/api/events/"
        );
        if (eventsData) {
          const today = new Date();
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(today.getMonth() - 1); // Get date one month ago

          const filteredEvents = eventsData.filter((event) => {
            const eventDate = new Date(event.date); // Assuming event.date is in a proper format
            return eventDate >= oneMonthAgo && eventDate >= today; // Only past month and upcoming events
          });

          setEvents(filteredEvents);
        }
      } catch (error) {
        setModalMessage("Error fetching data.");
        setModalOpen(true);
      }
    };

    fetchData();
  }, []);

  // Fetch activities for selected event
  const fetchActivitiesForEvent = async (eventId) => {
    const activitiesData = await fetchWithToken(
      `http://localhost:8000/api/events/${eventId}/activities/`
    );
    if (activitiesData) {
      setActivities(activitiesData);
    }
  };

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
      selectedActivity: "",
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
      const start = new Date(
        `1970-01-01T${field === "startTime" ? value : selectedMember.startTime}`
      );
      const end = new Date(
        `1970-01-01T${field === "endTime" ? value : selectedMember.endTime}`
      );
      // Calculate total time difference in milliseconds
      const hours = (end - start) / (1000 * 60 * 60);
      // Get the selected event to determine points and hours
      const selectedEvent = maintenanceEvents.find(
        (event) => event.name === selectedMember.maintenanceEvent
      );

      if (selectedEvent) {
        const isOnWaterEvent = selectedEvent.event_type === "on_water";
        const points = isOnWaterEvent ? 20 : (hours * (20 / 3)).toFixed(2);
        // 20 points for 3 hours for off-water
        const hoursToSet = isOnWaterEvent ? 3 : hours; // Set hours to 0 for on-water events

        setSelectedMember((prevState) => ({
          ...prevState,
          [field]: value,
          volunteerHours:
            field === "startTime" || field === "endTime"
              ? hoursToSet
              : prevState.volunteerHours,
          volunteerPoints: points,
        }));
      } else {
        setModalMessage("No event selected or event not found");
        setModalOpen(true);
      }
    } else if (field === "maintenanceEvent") {
      const selectedEvent = maintenanceEvents.find(
        (event) => event.name === value
      );
      fetchActivitiesForEvent(selectedEvent.id);

      // Reset activity, points, and hours when event changes
      setSelectedMember((prevState) => ({
        ...prevState,
        [field]: value,
        selectedActivity: "", // Reset selected activity
        volunteerPoints:
          selectedEvent?.event_type === "on_water"
            ? 20
            : prevState.volunteerPoints,
        volunteerHours:
          selectedEvent?.event_type === "on_water"
            ? 3
            : prevState.volunteerHours,
      }));
    } else if (field === "selectedActivity") {
      // Assuming the logic for activity selection is handled elsewhere
      setSelectedMember((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    } else {
      setSelectedMember((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (selectedMember) {
      // Check for valid hours and points
      if (
        selectedMember.volunteerHours < 0 ||
        selectedMember.volunteerPoints < 0
      ) {
        setModalMessage("Volunteer hours and points must be non-negative.");
        setModalOpen(true);
        return;
      }
      setSelectedMember((prevState) => ({
        ...prevState,
        editTime: new Date().toLocaleString(),
      }));
      const editorName = selectedMember.editorName.replace(/\s+/g, " ").trim();
      const selectedAdmin = adminsAndLeaders.find(
        (user) =>
          user.username.trim().toLowerCase() === editorName.toLowerCase()
      );

      if (!selectedAdmin) {
        setModalMessage("Error: No matching admin found for editorName.");
        setModalOpen(true);
        return;
      }

      // Map selected activity name to ID
      const selectedActivity = activities.find(
        (activity) => activity.name === selectedMember.selectedActivity
      );

      const data = {
        member: selectedMember.australian_sailing_number,
        event: maintenanceEvents.find(
          (event) => event.name === selectedMember.maintenanceEvent
        ).id,
        points: selectedMember.volunteerPoints,
        hours: selectedMember.volunteerHours,
        activity: selectedActivity ? selectedActivity.id : null, // Use activity ID or null
        created_by: selectedAdmin.id,
      };

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, redirecting to login.");
          return;
        }

        const response = await fetch(
          "http://localhost:8000/api/volunteer-points/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // Add the Authorization header
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (response.ok) {
          setModalMessage("Volunteer points saved successfully!");
          setModalOpen(true);
        } else {
          setModalMessage("Failed to save volunteer points.");
          setModalOpen(true);
        }
      } catch (error) {
        setModalMessage("Error saving data.");
        setModalOpen(true);
      }
    } else {
      setModalMessage("Please select a member.");
      setModalOpen(true);
    }
  };

  const handleTeamFilter = (team) => {
    setSelectedTeam(team);
  };

  const formatHoursAndMinutes = (decimalHours) => {
    if (!decimalHours || isNaN(decimalHours)) return ""; // Handle cases where decimalHours is empty or not a number
    const totalMinutes = Math.floor(decimalHours * 60); // Convert decimal hours to total minutes
    const hours = Math.floor(totalMinutes / 60); // Extract hours
    const minutes = totalMinutes % 60; // Extract remaining minutes
    return `${hours} hours ${minutes} minutes`;
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="add-volunteer-container">
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={sailImage} alt="Sail logo" className="modal-logo" />{" "}
            {/* Image at the top */}
            <span className="modal-close" onClick={handleCloseModal}>
              &times;
            </span>
            <p className="success-message">{modalMessage}</p>
            <button className="modal-button" onClick={handleCloseModal}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Team Buttons */}
      <div className="team-buttons">
        {maintenanceTeams.map((team) => (
          <button
            key={team.name}
            onClick={() => handleTeamFilter(team.name)}
            className={selectedTeam === team.name ? "selected-team" : ""}
          >
            {team.name}
          </button>
        ))}
        <button
          onClick={() => handleTeamFilter("")}
          className={selectedTeam === "" ? "selected-team" : ""}
        >
          All Teams
        </button>
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
            <th>Maintenance Event</th>
            <th>Activity</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Volunteering Hours</th>
            <th>Points</th>
            <th>Edited By</th>
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
                <select
                  value={
                    selectedMember?.australian_sailing_number ===
                    member.australian_sailing_number
                      ? selectedMember.selectedActivity
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("selectedActivity", e.target.value)
                  }
                  disabled={
                    selectedMember?.australian_sailing_number !==
                    member.australian_sailing_number
                  }
                >
                  <option value="">Select Activity</option>
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <option key={activity.name} value={activity.name}>
                        {activity.name}
                      </option>
                    ))
                  ) : (
                    <option>No activities available</option>
                  )}
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
                  ? formatHoursAndMinutes(selectedMember.volunteerHours)
                  : ""}
              </td>
              <td>
                {selectedMember?.australian_sailing_number ===
                member.australian_sailing_number
                  ? Math.round(selectedMember.volunteerPoints)
                  : ""}
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
