import React, { useState } from "react";
import api from "../api"; // assuming you have this setup to interact with your API

function AddEventForm() {
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    teamLeader: "",
    eventType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Additional validation
    // if (formData.volunteersNeeded <= 0 || formData.volunteersNeeded >= 50) {
    //     alert('Volunteers needed must be between 1 and 49.');
    //     return;
    // }

    api
      .post("events", formData)
      .then((response) => {
        alert("Event added successfully!");
        setFormData({ eventName: "", date: "", teamLeader: "", eventType: "" }); // Reset form
      })
      .catch((error) => {
        alert("Failed to add event. Error: " + error.message);
      });
  };

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
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
          <option value="Michael Roborts">Michael Roborts</option>
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
          <option value="off_water">Off water</option>
        </select>
      </div>
      <button type="submit">Add Event</button>
    </form>
  );
}

export default AddEventForm;
