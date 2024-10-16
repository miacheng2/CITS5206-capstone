import React, { useState, useEffect } from "react";
import "./styles/stylesAdd.css";
import sailImage from "./NYC.jpg";
import { useNavigate } from "react-router-dom";

function AddVolunteerPoints() {
  const [selectedAdmin, setUser] = useState([]); // To store current user data
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

  // Decode JWT to extract user info (assuming user info is in the payload)
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Fetch users, members, teams, and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = decodeToken(token);
          setUser(userData);
        } else {
          navigate("/login");
        }

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
          oneMonthAgo.setMonth(today.getMonth() - 3); // Get date three month ago
          const filteredEvents = eventsData.filter((event) => {
            const eventDate = new Date(event.date); // Assuming event.date is in a proper format
            return eventDate >= oneMonthAgo || eventDate >= today; // Only past month and upcoming events
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
      const hours = (end - start) / (1000 * 60 * 60);

      const selectedEvent = maintenanceEvents.find(
        (event) => event.name === selectedMember.maintenanceEvent
      );

      if (selectedEvent) {
        const isOnWaterEvent = selectedEvent.event_type === "on_water";
        const hasSelectedActivity = !!selectedMember.selectedActivity;

        let points =
          hasSelectedActivity && isOnWaterEvent
            ? 20
            : (hours * (20 / 3)).toFixed(2);
        let hoursToSet = hasSelectedActivity && isOnWaterEvent ? 3 : hours;

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

      setSelectedMember((prevState) => ({
        ...prevState,
        [field]: value,
        selectedActivity: "", // Reset selected activity
        volunteerPoints:
          selectedEvent?.event_type === "on_water"
            ? 0
            : prevState.volunteerPoints,
        volunteerHours:
          selectedEvent?.event_type === "on_water"
            ? 0
            : prevState.volunteerHours,
      }));
    } else if (field === "selectedActivity") {
      const selectedEvent = maintenanceEvents.find(
        (event) => event.name === selectedMember.maintenanceEvent
      );
      const isOnWaterEvent = selectedEvent?.event_type === "on_water";
      const hasSelectedActivity = !!value;

      setSelectedMember((prevState) => ({
        ...prevState,
        [field]: value,
        volunteerPoints:
          hasSelectedActivity && isOnWaterEvent
            ? 20
            : prevState.volunteerPoints,
        volunteerHours:
          hasSelectedActivity && isOnWaterEvent ? 3 : prevState.volunteerHours,
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
      // Ensure an event is selected
      if (!selectedMember.maintenanceEvent) {
        setModalMessage("Please select an event.");
        setModalOpen(true);
        return;
      }

      // Check for valid hours and points
      if (
        selectedMember.volunteerHours <= 0 ||
        selectedMember.volunteerPoints <= 0
      ) {
        setModalMessage("Volunteer hours and points must be positive.");
        setModalOpen(true);
        return;
      }
      setSelectedMember((prevState) => ({
        ...prevState,
        editTime: new Date().toLocaleString(),
      }));

      if (!selectedAdmin) {
        setModalMessage("Error: No matching admin found for current user.");
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
        created_by: selectedAdmin.user_id,
      };
      console.log(data);

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

        // Handle the response status
        const responseData = await response.json(); // Parse the response data

        if (response.ok) {
          // Success case
          setModalMessage("Volunteer points saved successfully!");
          setModalOpen(true);
        } else {
          // Error handling - response is not ok (status 4xx or 5xx)
          let errorMessage = "An error occurred";

          // Check if the error contains non_field_errors
          if (
            responseData.non_field_errors &&
            responseData.non_field_errors.length > 0
          ) {
            errorMessage = responseData.non_field_errors[0];
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          }

          setModalMessage(errorMessage);
          setModalOpen(true);
        }
      } catch (error) {
        // General error (e.g., network failure)
        console.error("Error occurred:", error);
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
