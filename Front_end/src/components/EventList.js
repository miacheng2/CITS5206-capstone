import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import EventDetailsModal from './EventDetailsModal'; 
import AddEventForm from './AddEventForm';
import Modal from './Modal';

import './event.css';

function EventList() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    useEffect(() => {
        api.get('events/')
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the events!", error);
            });
    }, []);
    // Hardcoded event data
    const events = [
        { id: 1, name: 'Busy Bee', date: '12/04/2024', leader: 'John Doe', volunteers: 10 },
        { id: 2, name: 'Repair Rudders', date: '21/06/2024', leader: 'Bob Brown', volunteers: 2 },
        { id: 3, name: 'F Shed Drain Repair', date: '9/07/2024', leader: 'Dianne Russell', volunteers: 4 },
        { id: 4, name: 'Cleaning', date: '27/09/2024', leader: 'Charles John', volunteers: 2 },
        { id: 5, name: 'Busy Bee', date: '16/11/2024', leader: 'Anette Black', volunteers: 24 }
    ];

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
                <div className="card" onClick={()  => setShowHistoryModal(true)}>
                    <img src="nycimg4.jpg" alt="Events History" />
                    <h3>Events History</h3>
                    <button className="learn-more">Learn more</button>
                </div>

            </section>

            <Modal isOpen={showModal} onClose={toggleModal}>
                <AddEventForm />
            </Modal>

             {/* Modal for Displaying Event History */}
             <EventDetailsModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                events={events}
            />

           
        </div>
    );
}

export default EventList;
