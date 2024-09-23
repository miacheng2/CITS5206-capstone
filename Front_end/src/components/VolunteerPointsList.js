import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; 

function VolunteerPointsList() {
    const navigate = useNavigate();
    const hasAlerted = useRef(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');  
                if (!token) {
                    throw new Error('No token found');
                }
        
                const userRole = localStorage.getItem('user_role');
        
                if (userRole !== 'admin') {
                    if (!hasAlerted.current) {
                        alert('Access denied: This section is for admin users only.');
                        hasAlerted.current = true; // Ensure alert is only shown once
                    }
                    console.error('Unauthorized: Admin role required.');
                    navigate('/login');  // Use navigate instead of window.location.href
                    return;
                }
        
                const response = await fetch('http://localhost:8000/api/events/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,  
                        'Content-Type': 'application/json',
                    },
                });
        
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched events:', data);
                } else {
                    console.error('Failed to fetch events:', response.status, response.statusText);
                    if (response.status === 401) {
                        alert('Unauthorized: Please log in again.');
                        console.error('Unauthorized: Redirecting to login.');
                        navigate('/login');  // Use navigate instead of window.location.href
                    }
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
    
        fetchEvents();
    }, [navigate]);

    return (
        <div>
            <header className="mainsection">
                <div className="overlay">
                    <div className="text-container">
                        <h2>Volunteer Point Management</h2>
                        <p>Every Hour Matters: Log It, Celebrate It, Reward It</p>
                    </div>
                </div>
            </header>
    
            <section className="cards-section">
                <div className="card" onClick={() => navigate('/add-points')}>
                    <h3>Add Volunteer Points</h3>
                    <p>Log the volunteer hours and assign points.</p>
                    <button className="learn-more">Learn more</button>
                </div>
                <div className="card" onClick={() => navigate('/check-history')}>
                    <h3>Check Volunteer History</h3>
                    <p>View the detailed history of volunteer activities.</p>
                    <button className="learn-more">Learn more</button>
                </div>
                <div className="card" onClick={() => navigate('/reward-checkin')}>
                    <h3>Reward Check-In</h3>
                    <p>Check eligibility for rewards based on accumulated points.</p>
                    <button className="learn-more">Learn more</button>
                </div>
            </section>
        </div>
    );
}

export default VolunteerPointsList;
