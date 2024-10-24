import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/AddEventForm.css";

function AddEventForm() {
  const [currentUser, setCurrentUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();
  const [modalMessage, setModalMessage] = useState(""); // Modal message state
  const [isModalOpen, setModalOpen] = useState(false); // Modal visibility state

  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    team: "",
    eventType: "",
    activities: [],
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = decodeToken(token);
          setCurrentUser(userData);
        } else {
          navigate("/login");
        }

        // Fetch teams
        const teamsData = await fetchWithToken(
          "http://localhost:8000/api/teams/"
        );
        if (teamsData) setTeams(teamsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("activity")) {
      const index = parseInt(name.split("-")[1], 10);
      const updatedActivities = [...formData.activities];
      updatedActivities[index] = value;

      setFormData((prevState) => ({
        ...prevState,
        activities: updatedActivities,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  // Function to remove an activity
  const removeActivityField = (index) => {
    const updatedActivities = formData.activities.filter(
      (activity, i) => i !== index
    );
    setFormData((prevState) => ({
      ...prevState,
      activities: updatedActivities,
    }));
  };

  const addActivityField = () => {
    setFormData((prevState) => ({
      ...prevState,
      activities: [...prevState.activities, ""],
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();

    // Sanitize input values
    const sanitizedEventName = formData.eventName.trim();
    const sanitizedActivities = formData.activities
      .map((activity) => activity.trim()) // Remove leading/trailing spaces
      .filter((activity) => activity !== ""); // Remove empty activities

    if (!currentUser) {
      setModalMessage("Unable to submit, current user not found.");
      setModalOpen(true);
      return;
    }

    if (sanitizedEventName === "") {
      setModalMessage("Event name cannot be empty or just spaces.");
      setModalOpen(true);
      return;
    }

    // Ensure that activities are added for on-water events
    if (formData.eventType === "on_water" && sanitizedActivities.length === 0) {
      setModalMessage(
        "Please add at least one activity for an on-water event."
      );
      setModalOpen(true);
      return;
    }

    const { date, team, eventType } = formData;

    try {
      const formattedActivities = sanitizedActivities.map((activityName) => ({
        name: activityName,
      }));

      const formattedData = {
        name: sanitizedEventName,
        event_type: eventType,
        date: date,
        team: Number(team),
        created_by: currentUser.user_id, // Use the user ID from the decoded token
        activities: formattedActivities,
      };

      if (eventType === "off_water") {
        delete formattedData.activities;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("http://localhost:8000/api/events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json(); // Parse JSON from response

      if (!response.ok) {
        // Display the error message returned from the backend
        const errorMessage = responseData.error || "Failed to add event.";
        throw new Error(errorMessage);
      }

      setModalMessage("Event added successfully!");
      setModalOpen(true);
      setFormData({
        eventName: "",
        date: "",
        team: "",
        eventType: "",
        activities: [],
      });
    } catch (error) {
      setModalMessage(error.message);
      setModalOpen(true);
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="form-container">
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
      <div className="form-card">
        <div className="form-header">
          <h2>Event Form</h2>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Event Name:</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Team:</label>
            <select
              name="team"
              value={formData.team}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select a Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Event Type:</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select Event Type</option>
              <option value="on_water">On Water</option>
              <option value="off_water">Off Water</option>
            </select>
          </div>

          {formData.eventType === "on_water" && (
            <div className="form-group activities-group">
              <label>Activities:</label>
              {formData.activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <input
                    key={index}
                    type="text"
                    name={`activity-${index}`}
                    value={activity}
                    onChange={handleChange}
                    placeholder={`Activity ${index + 1}`}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="remove-activity-btn"
                    onClick={() => removeActivityField(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="add-activity-btn"
                onClick={addActivityField}
              >
                Add Another Activity
              </button>
            </div>
          )}

          <button type="submit" className="submit-btn">
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEventForm;
