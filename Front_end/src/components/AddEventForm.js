import React, { useState, useEffect } from "react";

function AddEventForm() {
  const [users, setUsers] = useState([]); // To store users data

  useEffect(() => {
    // Fetch users
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
    activities: [], // New state for activities
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle activities separately
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
    console.log("teamleader:", teamLeader);

    try {
      // Fetch the user ID based on the username (teamLeader)
      const userId = users.find(
        (user) =>
          user.username.trim().toLowerCase() === teamLeader.toLowerCase()
      )?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Convert activities to the expected format for the backend
      const formattedActivities = activities.map((activityName) => ({
        name: activityName,
      }));

      const formattedData = {
        name: eventName,
        event_type: eventType,
        date: date,
        created_by: userId, // Use the fetched user ID here
        activities: formattedActivities, // Now a list of objects with activity names
      };

      // Ensure activities are only sent if the event is on-water
      if (eventType === "off_water") {
        delete formattedData.activities;
      }

      console.log(formattedData);

      // Submit form data to API using fetch
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
      }); // Reset form
    } catch (error) {
      alert("Failed to add event. Error: " + error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Event Name:</label>
        <input
          type="text"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div>
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
      <div>
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

      {/* Conditionally render activities input if "On Water" is selected */}
      {formData.eventType === "on_water" && (
        <div>
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
          <button type="button" onClick={addActivityField}>
            Add Another Activity
          </button>
        </div>
      )}

      <button type="submit">Add Event</button>
    </form>
  );
}

export default AddEventForm;
