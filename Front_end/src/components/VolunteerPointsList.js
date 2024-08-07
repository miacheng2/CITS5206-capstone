import React, { useEffect, useState } from 'react';
import api from '../api';

function VolunteerPointsList() {
    const [points, setPoints] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user is admin
        api.get('volunteer-points/')
            .then(response => {
                setPoints(response.data);
                setIsAdmin(true);
            })
            .catch(error => {
                console.error("You do not have access to this data!", error);
            });
    }, []);

    if (!isAdmin) {
        return <div>You do not have access to volunteer points data.</div>;
    }

    return (
        <div>
            <h1>Volunteer Points</h1>
            <ul>
                {points.map(point => (
                    <li key={point.id}>{point.member.name}: {point.points} points</li>
                ))}
            </ul>
            {/* Add form for adding points */}
        </div>
    );
}

export default VolunteerPointsList;
