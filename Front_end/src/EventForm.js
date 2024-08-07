import React, { useState } from 'react';
import axios from 'axios';

function EventForm({ event, onSave }) {
  const [formData, setFormData] = useState({
    type: event ? event.type : '',
    date: event ? event.date : '',
    description: event ? event.description : '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = event ? 
        await axios.put(`http://localhost:8000/events/${event.id}/`, formData) :
        await axios.post('http://localhost:8000/events/', formData);
      onSave(response.data);
    } catch (error) {
      console.error('Error saving the event', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Type:
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="on_water">On-Water</option>
          <option value="off_water">Off-Water</option>
        </select>
      </label>
      <label>Date:
        <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} />
      </label>
      <label>Description:
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </label>
      <button type="submit">Save Event</button>
    </form>
  );
}

export default EventForm;
