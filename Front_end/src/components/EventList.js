import React, { useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
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
    
          {/* Cards Section */}
          <section className="cards-section">
          <div className="card" onClick={() => navigate('/events')}>
              <img src="nycimg4.jpg" alt="Event 1" />
              <h3>Off Water events</h3>
              <button className="learn-more">Learn more</button>
            </div>
            <div className="card" onClick={() => navigate('/events')}>
              <img src= "nycimg3.jpg" alt="Event 1" />
              <h3>On water events</h3>
              <button className="learn-more">Learn more</button>
            </div>
            <div className="card" onClick={() => navigate('/events')}>
              <img src="nycimg2.jpg" alt="Event 1" />
              <h3>Functions</h3>
              <button className="learn-more">Learn more</button>
            </div>
           
          </section>
        </div>
    );
}

export default EventList;
