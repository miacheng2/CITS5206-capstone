import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function MemberVolunteerHistory() {
  const { uid } = useParams(); // Get the uid from the URL
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch the volunteer history of the member by uid
    fetch(`http://localhost:8000/api/member-volunteer-history/${uid}/`)
      .then((response) => response.json())
      .then((data) => setHistory(data))
      .catch((error) => console.error("Error fetching member history:", error));
  }, [uid]);

  return (
    <div>
      <h2>Volunteer History for Member {uid}</h2>
      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Activity</th>
            <th>Points</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={index}>
              <td>{entry.event_name}</td>
              <td>{entry.event_date}</td>
              <td>{entry.activity}</td>
              <td>{entry.points}</td>
              <td>{entry.hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MemberVolunteerHistory;
