// src/components/CheckEventHistory.js
import React, { useState, useEffect } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

function CheckEventHistory() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch events from the backend
    api
      .get("events/")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the events!", error);
      });
  }, []);

  const handleDelete = (eventId) => {
    // Call API to delete the event
    api
      .delete(`events/${eventId}/`)
      .then(() => {
        // Remove event from the state after successful deletion
        setEvents(events.filter((event) => event.id !== eventId));
      })
      .catch((error) => {
        console.error("There was an error deleting the event!", error);
      });
  };

  return (
    <div>
      <header className="event-section">
        <div className="overlay">
          <div className="text-container">
            <h2>Event History</h2>
          </div>
        </div>
      </header>

      <section className="events-list">
        {events.length > 0 ? (
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <h3>{event.name}</h3>
                <p>Date: {event.date}</p>
                <p>Team Leader: {event.created_by}</p>
                <p>Activities:</p>
                {event.activities && event.activities.length > 0 ? (
                  <ul>
                    {event.activities.map((activity) => (
                      <li key={activity.id}>{activity.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No activities for this event.</p>
                )}
                <button onClick={() => handleDelete(event.id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found.</p>
        )}
      </section>
    </div>
  );
}

export default CheckEventHistory;
