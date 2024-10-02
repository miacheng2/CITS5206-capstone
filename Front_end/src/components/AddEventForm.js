import React, { useState, useEffect } from "react";
import "./styles/AddEventForm.css";

function AddEventForm() {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    teamLeader: "",
    eventType: "",
    activities: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        if (!token) {
          throw new Error("No token found");
        }

        // Fetch users
        const usersResponse = await fetch("http://localhost:8000/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          console.error(
            "Failed to fetch users:",
            usersResponse.status,
            usersResponse.statusText
          );
          if (usersResponse.status === 401) {
            console.error("Unauthorized: Redirecting to login.");
            window.location.href = "/login"; // Redirect to login if unauthorized
          }
        }

        // Fetch events
        const eventsResponse = await fetch(
          "http://localhost:8000/api/events/",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Set the Authorization header
              "Content-Type": "application/json",
            },
          }
        );

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log("Fetched events:", eventsData);
          // You can do something with the events data if needed
        } else {
          console.error(
            "Failed to fetch events:",
            eventsResponse.status,
            eventsResponse.statusText
          );
          if (eventsResponse.status === 401) {
            console.error("Unauthorized: Redirecting to login.");
            window.location.href = "/login"; // Redirect to login if unauthorized
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

    const { eventName, date, teamLeader, eventType, activities } = formData;

    try {
      const userId = users.find(
        (user) =>
          user.username.trim().toLowerCase() === teamLeader.toLowerCase()
      )?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const formattedActivities = activities.map((activityName) => ({
        name: activityName,
      }));

      const formattedData = {
        name: eventName,
        event_type: eventType,
        date: date,
        created_by: userId,
        activities: formattedActivities,
      };

      if (eventType === "off_water") {
        delete formattedData.activities;
      }

      // Get the JWT token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Make the POST request with the Authorization header
      const response = await fetch("http://localhost:8000/api/events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      alert("Event added successfully!");
      setFormData({
        eventName: "",
        date: "",
        teamLeader: "",
        eventType: "",
        activities: [],
      });
    } catch (error) {
      alert("Failed to add event. Error: " + error.message);
    }
  }

  return (
    <div className="form-container">
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
            <label>Team Leader:</label>
            <select
              name="teamLeader"
              value={formData.teamLeader}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select a Team Leader</option>
              {users.map((user) => (
                <option key={user.id} value={user.username}>
                  {user.username}
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
