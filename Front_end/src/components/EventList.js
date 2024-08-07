import React, { useEffect, useState } from 'react';
import api from '../api';

function EventList() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        api.get('events/')
            .then(response => {
                setEvents(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the events!", error);
            });
    }, []);

    return (
        <div>
            <h1>Events</h1>
            <ul>
                {events.map(event => (
                    <li key={event.id}>{event.name} ({event.event_type}) on {event.date}</li>
                ))}
            </ul>
        </div>
    );
}

export default EventList;
