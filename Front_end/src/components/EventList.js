import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import AddEventForm from "./AddEventForm";
import Modal from "./Modal";
import "./event.css";

function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  const toggleModal = () => setShowModal(!showModal);

  return (
    <div>
      <header className="event-section">
        <div className="overlay">
          <div className="text-container">
            <h2>Events</h2>
          </div>
        </div>
      </header>

      {/* Cards Section */}
      <section className="cards-section">
        <div className="card" onClick={toggleModal}>
          <img src="nycimg1.jpg" alt="Upcoming events" />
          <h3>Add New Event</h3>
          <button className="learn-more">Learn more</button>
        </div>
        <div className="card" onClick={() => navigate("/event-history")}>
          <img src="nycimg4.jpg" alt="Events History" />
          <h3>Events History</h3>
          <button className="learn-more">Learn more</button>
        </div>
      </section>

      {/* Modal for Adding New Event */}
      <Modal isOpen={showModal} onClose={toggleModal}>
        <AddEventForm />
      </Modal>
    </div>
  );
}

export default EventList;
