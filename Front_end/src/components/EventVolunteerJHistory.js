import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import "./styles/EventDetailsModal.css";

function EventVolunteerHistory() {
  const location = useLocation();
  const { history: initialHistory, eventName, eventId } = location.state || {}; // Extract eventId
  const [history, setHistory] = useState(initialHistory || []); // Initialize history state
  const [updatedEntry, setUpdatedEntry] = useState({ points: "", hours: "" });
  const [members, setMembers] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // To track which row is being edited
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedEntryId, setSelectedEntryId] = useState(null); // Track entry for deletion
  const navigate = useNavigate();

  const fetchWithToken = async (url) => {
    const token = localStorage.getItem("token");
    if (!token) {
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
      navigate("/login");
      return null;
    }

    return response.json();
  };

  const fetchEventHistory = async () => {
    if (!eventId) {
      console.error("Event ID is missing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/volunteer-points/event-history/${eventId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const updatedHistory = await response.json();
        setHistory(updatedHistory);
      }
    } catch (error) {
      console.error("Error fetching updated event history:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const membersData = await fetchWithToken(
        "http://localhost:8000/api/team-members/"
      );
      if (membersData) setMembers(membersData);
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (eventId) {
      fetchEventHistory(); // Fetch event history when component mounts
    }
  }, [eventId]);

  // Function to handle editing
  const handleEditClick = (index, entry) => {
    setEditIndex(index);
    setUpdatedEntry({ points: entry.points, hours: entry.hours });
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEntry((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to save the updated data
  const handleSaveClick = async (index, id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Optimistically update the local state
    const updatedHistory = [...history];
    updatedHistory[index] = {
      ...updatedHistory[index],
      points: parseInt(updatedEntry.points, 10),
      hours: parseFloat(updatedEntry.hours),
    };

    try {
      const response = await fetch(
        `http://localhost:8000/api/volunteer-points/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            points: parseInt(updatedEntry.points, 10),
            hours: parseFloat(updatedEntry.hours),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update entry.");
      }

      await fetchEventHistory();
    } catch (error) {
      console.error("Error updating entry:", error);
    } finally {
      setEditIndex(null); // Close the edit mode
    }
  };

  // Function to handle deletion
  const handleDeleteClick = (id) => {
    setSelectedEntryId(id);
    setShowModal(true); // Show the confirmation modal
  };

  // Function to confirm deletion
  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/volunteer-points/${selectedEntryId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete entry.");
      }

      // Optimistically remove the deleted entry from the local state
      const updatedHistory = history.filter(
        (entry) => entry.id !== selectedEntryId
      );

      await fetchEventHistory();
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <div>
      <header className="event-section">
        <div className="overlay">
          <div className="text-container">
            <h2>
              {eventName
                ? `Volunteer History for ${eventName}`
                : "Volunteer History"}
            </h2>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={entry.id}>
              <td>
                {members.find(
                  (member) => member.australian_sailing_number === entry.member
                )?.name || "Unknown"}
              </td>
              {editIndex === index ? (
                <>
                  <td>
                    <input
                      type="number"
                      name="points"
                      value={updatedEntry.points}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="hours"
                      value={updatedEntry.hours}
                      onChange={handleInputChange}
                    />
                  </td>
                </>
              ) : (
                <>
                  <td>{entry.points}</td>
                  <td>{entry.hours}</td>
                </>
              )}
              <td>{entry.activity || "No activity"}</td>
              <td>{entry.created_by}</td>
              <td>
                {editIndex === index ? (
                  <>
                    <button
                      onClick={() => handleSaveClick(index, entry.id)}
                      className="confirm-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditIndex(null)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(index, entry)}
                      className="confirm-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(entry.id)}
                      className="cancel-btn"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for confirming deletion */}
      {showModal && (
        <ConfirmationModal
          isOpen={showModal}
          message="Are you sure you want to delete this entry?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowModal(false)}
          showConfirmButtons={true}
        />
      )}
    </div>
  );
}

export default EventVolunteerHistory;
