import React, { useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import AddEventForm from './AddEventForm';  // Import the form component
import './event.css'; 

function EventList() {
    
    const navigate = useNavigate();

    useEffect(() => {
        api.get('events/')
            .then(response => {
                console.log(response.data); 
            })
            .catch(error => {
                console.error("There was an error fetching the events!", error);
            });
    }, []);

    return (
        <div>
            {/* Main Section */}
            <header className="event-section">
                <div className="overlay">
                    <div className="text-container">
                        <h2>Events</h2>
                    </div>
                </div>
            </header>
    
            {/* Add Event Form Section */}
            <section className="add-event-form">
                <h3>Add New Event</h3>
                <AddEventForm />
            </section>

            {/* Cards Section */}
            <section className="cards-section">
                <div className="card" onClick={() => navigate('/events')}>
                    <img src="nycimg4.jpg" alt="Event 1" />
                    <h3>Upcoming events</h3>
                    <button className="learn-more">Learn more</button>
                </div>
                <div className="card" onClick={() => navigate('/events')}>
                    <img src= "nycimg3.jpg" alt="Event 1" />
                    <h3>Past events</h3>
                    <button className="learn-more">Learn more</button>
                </div>
            </section>
        </div>
    );
}

export default EventList;

