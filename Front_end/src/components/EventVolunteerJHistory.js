import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./EventDetailsModal.css";

function EventVolunteerHistory() {
  const { state } = useLocation();
  const history = state.history;
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();
  const [modalMessage, setModalMessage] = useState(""); // Modal message state
  const [isModalOpen, setModalOpen] = useState(false); // Modal visibility state

  const fetchWithToken = async (url) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login.");
      // Handle the absence of token (e.g., redirect to login)
      navigate("/login");
      return null;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      console.error("Unauthorized: Redirecting to login.");
      // Handle unauthorized access (e.g., redirect to login)
      navigate("/login");
      return null;
    }

    return response.json();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
        }

        const membersData = await fetchWithToken(
          "http://localhost:8000/api/team-members/"
        );
        if (membersData) setMembers(membersData);
      } catch (error) {
        setModalMessage("Error fetching data.");
        setModalOpen(true);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <header className="event-section">
        <div className="overlay">
          <div className="text-container">
            <h2>Volunteer History</h2>
          </div>
        </div>
      </header>
      <table className="event-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Points</th>
            <th>Hours</th>
            <th>Activity</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id}>
              {/* <td>{entry.member}</td> */}
              <td>
                {members.find(
                  (member) => member.australian_sailing_number === entry.member
                )?.name || "Unknown"}
              </td>
              <td>{entry.points}</td>
              <td>{entry.hours}</td>
              <td>{entry.activity || "No activity"}</td>
              <td>{entry.created_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventVolunteerHistory;
