import React from "react";
import Modal from "./Modal";

function EventDetailsModal({ isOpen, onClose, events, onEdit, onDelete }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Event History</h2>
      {events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <h3>{event.name}</h3>
              <p>Date: {event.date}</p>
              <p>Leader: {event.leader}</p>
              <p>Volunteers: {event.volunteers}</p>
              {event.activities.length > 0 ? (
                <ul>
                  {event.activities.map((activity) => (
                    <li key={activity.id}>{activity.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No activities for this event.</p>
              )}
              <button onClick={() => onEdit(event)}>Edit</button>
              <button onClick={() => onDelete(event.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events found.</p>
      )}
    </Modal>
  );
}

export default EventDetailsModal;
