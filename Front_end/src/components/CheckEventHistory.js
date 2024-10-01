import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ConfirmationModal from "./ConfirmationModal";
import "./EventDetailsModal.css";

function CheckEventHistory() {
  const [user, setUser] = useState([]);
  const [events, setEvents] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [modalMessage, setModalMessage] = useState(
    "Are you sure you want to delete this event?"
  );
  const [showConfirmButtons, setShowConfirmButtons] = useState(true); // Track if modal shows Yes/No buttons or just Close
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

        const usersData = await api.get("users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(usersData.data);

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

  const filteredEvents = events.filter((event) => {
    const matchesName = event.name
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const matchesMonth = filterMonth
      ? new Date(event.date).getMonth() + 1 === parseInt(filterMonth)
      : true;
    return matchesName && matchesMonth;
  });

  // Function to handle opening the confirmation modal
  const openConfirmationModal = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Check for linked volunteer history
      const response = await api.get(
        `volunteer-points/event-history/${eventId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.length > 0) {
        console.log(response.data);
        // If volunteer history is linked, update the modal to only show the Close button
        setModalMessage(
          "Can't delete as there is volunteer history linked to this event."
        );
        setShowConfirmButtons(false); // Don't show Yes/No buttons
      } else {
        // Otherwise, set the default message and show Yes/No buttons
        setModalMessage("Are you sure you want to delete this event?");
        setShowConfirmButtons(true); // Show Yes/No buttons
      }

      setSelectedEventId(eventId);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error checking volunteer history!", error);
      alert("Failed to check volunteer history. Please try again later.");
    }
  };

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

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEventId)
      );
      console.log("Event deleted:", selectedEventId);
    } catch (error) {
      console.error("There was an error deleting the event!", error);
      alert("Failed to delete event. Please try again later.");
    } finally {
      setIsModalOpen(false);
      setSelectedEventId(null);
    }
  };

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
          {/* Month options */}
        </select>
      </div>

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
                <td>{event.event_type}</td>
                <td>
                  {user.find((user) => user.id === event.created_by)
                    ?.username || "Unknown"}
                </td>
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
                  <button onClick={() => openConfirmationModal(event.id)}>
                    Delete
                  </button>
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

      <ConfirmationModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={showConfirmButtons ? handleDeleteConfirm : null} // Only show onConfirm when buttons are needed
        onCancel={handleDeleteCancel}
        showConfirmButtons={showConfirmButtons} // Pass prop to show or hide confirm buttons
      />
    </div>
  );
}

export default CheckEventHistory;
