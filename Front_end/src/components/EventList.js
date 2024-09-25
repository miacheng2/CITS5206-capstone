import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import AddEventForm from "./AddEventForm";
import Modal from "./Modal";
import EventDetailsModal from "./EventDetailsModal"; // Import EventDetailsModal
import "./event.css"; // CSS file for styling

function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false); // Modal for AddEventForm
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false); // Modal for EventDetailsModal
  const [selectedEvent, setSelectedEvent] = useState(null); // To track the event being edited or deleted

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch("http://localhost:8000/api/events/", {
          headers: {
            Authorization: `Bearer ${token}`, // Set the Authorization header
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched events:", data);
          setEvents(data);
        } else {
          console.error(
            "Failed to fetch events:",
            response.status,
            response.statusText
          );
          if (response.status === 401) {
            console.error("Unauthorized: Redirecting to login.");
            window.location.href = "/login"; // Redirect to login if unauthorized
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    // Call the fetchEvents function
    fetchEvents();
  }, [navigate]); // Add navigate as a dependency

  console.log("get events:", events);
  // Toggle modals
  const toggleAddEventModal = () => setShowAddEventModal(!showAddEventModal);
  const toggleEventDetailsModal = () =>
    setShowEventDetailsModal(!showEventDetailsModal);

  // Handle editing an event
  const handleEdit = (event) => {
    setSelectedEvent(event); // Set the event to be edited
    console.log("Edit event:", event);
    // Add further logic here to edit the event (e.g., open a form or modal for editing)
  };

  // Handle deleting an event
  const handleDelete = (eventId) => {
    // Confirmation prompt before deleting
    if (window.confirm("Are you sure you want to delete this event?")) {
      api
        .delete(`events/${eventId}/`)
        .then(() => {
          setEvents(events.filter((event) => event.id !== eventId)); // Remove event from state
          console.log("Event deleted:", eventId);
        })
        .catch((error) => {
          console.error("There was an error deleting the event!", error);
        });
    }
  };

  return (
    <div>
      {/* Header section */}
      <header className="event-section">
        <div className="overlay">
          <div className="text-container">
            <h2>Events</h2>
          </div>
        </div>
      </header>

      {/* Cards Section */}
      <section className="cards-section">
        {/* Add New Event Card */}
        <div className="card" onClick={toggleAddEventModal}>
          <img src="nycimg1.jpg" alt="Upcoming events" />
          <h3>Add New Event</h3>
          <button className="learn-more">Learn more</button>
        </div>

        {/* Event History Card */}
        <div className="card" onClick={toggleEventDetailsModal}>
          <img src="nycimg4.jpg" alt="Events History" />
          <h3>Events History</h3>
          <button className="learn-more">Learn more</button>
        </div>
      </section>

      {/* Modal for Adding New Event */}
      <Modal isOpen={showAddEventModal} onClose={toggleAddEventModal}>
        <AddEventForm />
      </Modal>

      {/* Modal for Event History (EventDetailsModal) */}
      <Modal isOpen={showEventDetailsModal} onClose={toggleEventDetailsModal}>
        <EventDetailsModal
          isOpen={showEventDetailsModal}
          onClose={toggleEventDetailsModal}
          events={events} // Pass the events data
          onEdit={handleEdit} // Pass the edit handler
          onDelete={handleDelete} // Pass the delete handler
        />
      </Modal>
    </div>
  );
}

export default EventList;
