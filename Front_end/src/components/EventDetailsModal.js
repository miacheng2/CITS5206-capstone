// EventDetailsModal.js
import React from 'react';
import './EventDetailsModal.css';  // Ensure proper CSS styling

const EventDetailsModal = ({ isOpen, onClose, events }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="close-button">&times;</button>
                <h2>Event History</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Event Name</th>
                            <th>Date</th>
                            <th>Team Leader</th>
                            <th>Volunteers Needed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event.id}>
                                <td>{event.id}</td>
                                <td>{event.name}</td>
                                <td>{event.date}</td>
                                <td>{event.leader}</td>
                                <td>{event.volunteers}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventDetailsModal;
