// src/components/CheckEventHistory.js
import React, { useState, useEffect } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

function CheckEventHistory() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch events with authorization
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        if (!token) {
          // If no token, redirect to login
          console.error('No token found, redirecting to login.');
          navigate('/login'); // Redirect to login page
          return; // Exit the function
        }

        // Fetch events from the backend with the Authorization header
        const response = await api.get('events/', {
          headers: {
            'Authorization': `Bearer ${token}`, // Add the Authorization header
          },
        });

        // Update state with the fetched events
        setEvents(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Handle 401 Unauthorized by redirecting to login
          console.error('Unauthorized: Redirecting to login.');
          navigate('/login');
        } else {
          // Handle other errors (e.g., network issues, server errors)
          console.error('There was an error fetching the events!', error);
          alert('Failed to fetch events. Please try again later.');
        }
      }
    };

    // Call the fetchEvents function
    fetchEvents();
  }, [navigate]); // Add navigate as a dependency

  const handleDelete = async (eventId) => {
    // Call API to delete the event
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      if (!token) {
        throw new Error('No token found');
      }

      await api.delete(`events/${eventId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Add the Authorization header
        },
      });

      // Remove event from the state after successful deletion
      setEvents(events.filter((event) => event.id !== eventId));
      console.log("Event deleted:", eventId);
    } catch (error) {
      console.error("There was an error deleting the event!", error);
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: Redirecting to login.');
        navigate('/login');
      } else {
        alert('Failed to delete event. Please try again later.');
      }
    }
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
