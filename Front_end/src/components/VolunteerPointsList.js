import React, { useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import './styles.css'; 
function VolunteerPointsList() {
    
    //const [isAdmin, setIsAdmin] = useState(false);
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

    // if (!isAdmin) {
    //     return <div>You do not have access to volunteer points data.</div>;
    // }

    return (
        <div>
            {/* Main Section */}
      <header className="mainsection">
        <div className="overlay">
          <div className="text-container">
            <h2>Volunteer Point Management</h2>
            <p>Every Hour Matters: Log It, Celebrate It, Reward It</p>
          </div>
        </div>
      </header>

      {/* Cards Section */}
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
