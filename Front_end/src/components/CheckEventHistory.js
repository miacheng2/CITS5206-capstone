import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ConfirmationModal from "./ConfirmationModal"; // Import the confirmation modal component
import "./EventDetailsModal.css"; // Import CSS for the table

function CheckEventHistory() {
  const [events, setEvents] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null); // Track which event is being deleted
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, redirecting to login.");
          navigate("/login");
          return;
        }

        const response = await api.get("events/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEvents(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized: Redirecting to login.");
          navigate("/login");
        } else {
          console.error("Error fetching events!", error);
          alert("Failed to fetch events. Please try again later.");
        }
      }
    };

    fetchEvents();
  }, [navigate]);

  // Filter events by name and month
  const filteredEvents = events.filter((event) => {
    const matchesName = event.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesMonth = filterMonth
      ? new Date(event.date).getMonth() + 1 === parseInt(filterMonth)
      : true;
    return matchesName && matchesMonth;
  });

  // Function to handle opening the confirmation modal
  const openConfirmationModal = (eventId) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  // Handle confirming deletion
  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      await api.delete(`events/${selectedEventId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEventId));
      console.log("Event deleted:", selectedEventId);
    } catch (error) {
      console.error("There was an error deleting the event!", error);
      alert("Failed to delete event. Please try again later.");
    } finally {
      setIsModalOpen(false); // Close the modal after deletion
      setSelectedEventId(null); // Reset the selected event
    }
  };

  // Handle cancelling deletion
  const handleDeleteCancel = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
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

      {/* Search and Filter Controls */}
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search by event name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      {/* Events Table */}
      <table className="event-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Event Type</th>
            <th>Created By</th> 
            <th>Activities</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{event.date}</td>
                <td>{event.event_type}</td> {/* Display the event type */}
                <td>{event.created_by.username}</td> {/* Display the username */}
                <td>
                  <ul>
                    {event.activities && event.activities.length > 0 ? (
                      event.activities.map((activity) => (
                        <li key={activity.id}>{activity.name}</li>
                      ))
                    ) : (
                      <li>No activities</li>
                    )}
                  </ul>
                </td>
                <td>
                  <button onClick={() => openConfirmationModal(event.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">
                <div className="no-events-wrapper">
                  <p className="no-events-message">No events found.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this event?"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default CheckEventHistory;

