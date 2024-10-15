import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddEventForm from "./AddEventForm";
import Modal from "./Modal";
import './styles/AddEventForm.css';
import "./styles/event.css";

function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false); // Modal for AddEventForm
  const [selectedEvent, setSelectedEvent] = useState(null); // To track the event being edited or deleted

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch('http://localhost:8000/api/events/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Failed to fetch events:', response.status, response.statusText);
          if (response.status === 401) {
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [navigate]);

  console.log("get events:", events);
  // Toggle modals
  const toggleAddEventModal = () => setShowAddEventModal(!showAddEventModal);

  // Navigate to event history page
  const goToEventHistory = () => {
    navigate("/event-history"); // Navigate to the event history page
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
        <div className="card" onClick={goToEventHistory}>
          <img src="nycimg4.jpg" alt="Events History" />
          <h3>Events History</h3>
          <button className="learn-more">Learn more</button>
        </div>
      </section>

      {/* Modal for Adding New Event */}
      <Modal isOpen={showAddEventModal} onClose={toggleAddEventModal}>
        <AddEventForm />
      </Modal>
    </div>
  );
}

export default EventList;
