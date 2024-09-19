import React from "react";
import Modal from "./Modal";
import "./EventDetailsModal.css"; // Import the CSS styles for the modal

function EventDetailsModal({ isOpen, onClose, events, onEdit, onDelete }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>Event History</h2> {/* Header for Event History */}
        <button onClick={onClose} className="close-button">&times;</button>
      </div>

      {events.length > 0 ? (
        <div className="event-card-container">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Leader:</strong> {event.leader || "No leader assigned"}</p>
              <p><strong>Volunteers:</strong> {event.volunteers || 0}</p>
              {event.activities.length > 0 ? (
                <ul className="activity-list">
                  {event.activities.map((activity) => (
                    <li key={activity.id}>{activity.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No activities for this event.</p>
              )}
              <div className="event-actions">
                <button className="delete-button" onClick={() => onDelete(event.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No events found.</p>
      )}
    </Modal>
  );
}

export default EventDetailsModal;
