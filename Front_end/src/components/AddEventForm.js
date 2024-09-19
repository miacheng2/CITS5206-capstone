import React, { useState, useEffect } from "react";
import './AddEventForm.css';

function AddEventForm() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/users/")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    teamLeader: "",
    eventType: "",
    activities: [],
  });

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

      const response = await fetch("http://localhost:8000/api/add-event/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name:</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
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
            />
          </div>
          <div className="form-group">
            <label>Team Leader:</label>
            <select
              name="teamLeader"
              value={formData.teamLeader}
              onChange={handleChange}
              required
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
            >
              <option value="">Select Event Type</option>
              <option value="on_water">On Water</option>
              <option value="off_water">Off Water</option>
            </select>
          </div>

          {formData.eventType === "on_water" && (
            <div className="activities-group">
              <label>Activities:</label>
              {formData.activities.map((activity, index) => (
                <input
                  key={index}
                  type="text"
                  name={`activity-${index}`}
                  value={activity}
                  onChange={handleChange}
                  placeholder={`Activity ${index + 1}`}
                  required
                />
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

          <button type="submit" className="submit-btn">Add Event</button>
        </form>
      </div>
    </div>
  );
}

export default AddEventForm;
