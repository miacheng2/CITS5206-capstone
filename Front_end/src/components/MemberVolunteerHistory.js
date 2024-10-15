import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import "./styles/EventDetailsModal.css";

function MemberVolunteerHistory() {
  const { uid } = useParams(); // Get the uid from the URL
  const [history, setHistory] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // To track which row is being edited
  const [updatedEntry, setUpdatedEntry] = useState({ points: "", hours: "" });
  const [showModal, setShowModal] = useState(false); // Modal state for confirming deletion
  const [selectedEntryId, setSelectedEntryId] = useState(null); // To store the ID of the entry to delete
  const [filterName, setFilterName] = useState(""); // New state for filtering by name
  const [filterMonth, setFilterMonth] = useState(""); // New state for filtering by month
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        if (!token) {
          console.error("No token found, redirecting to login.");
          navigate("/login"); // Redirect to login page
          return;
        }

        const response = await fetch(
          `http://localhost:8000/api/volunteer-points/member-history/${uid}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add the Authorization header
              "Content-Type": "application/json", // Added content-type header
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        } else if (response.status === 401) {
          console.error("Unauthorized: Redirecting to login.");
          navigate("/login"); // Redirect to login if unauthorized
        } else {
          console.error("Error fetching member history:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching member history:", error);
      }
    };

    fetchHistory();
  }, [uid, navigate]);

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
      console.error("No token found, redirecting to login.");
      navigate("/login");
      return;
    }

    const updatedHistory = [...history];
    updatedHistory[index] = {
      ...updatedHistory[index],
      points: parseInt(updatedEntry.points, 10), // Convert to integer
      hours: parseFloat(updatedEntry.hours), // Convert to float if necessary
    };
    setHistory(updatedHistory);
    setEditIndex(null);

    // Update the entry on the server (API call)
    try {
      const response = await fetch(
        `http://localhost:8000/api/volunteer-points/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add the Authorization header
          },
          body: JSON.stringify({
            points: parseInt(updatedEntry.points, 10), // Convert to integer
            hours: parseFloat(updatedEntry.hours), // Convert to float if necessary
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update entry.");
      }
      window.location.reload();
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  // Function to handle deletion with confirmation
  const handleDeleteClick = (id) => {
    setSelectedEntryId(id);
    setShowModal(true); // Show the confirmation modal
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login.");
      navigate("/login");
      return;
    }

    const updatedHistory = history.filter(
      (entry) => entry.id !== selectedEntryId
    );
    setHistory(updatedHistory);
    setShowModal(false); // Hide the modal

    // Delete the entry from the server (API call)
    try {
      const response = await fetch(
        `http://localhost:8000/api/volunteer-points/${selectedEntryId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Add the Authorization header
            "Content-Type": "application/json", // Added content-type header
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete entry.");
      }
      window.location.reload();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // Filter logic for the history table
  const filteredHistory = history.filter((entry) => {
    const matchesName = entry.event_name
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const matchesMonth =
      !filterMonth || entry.event_date.startsWith(filterMonth);
    return matchesName && matchesMonth;
  });

  return (
    <div>
      <header className="event-section">
          <div className="text-container">
            <h1>Report History</h1>
          </div>
      </header>

      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search by event name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </div>

      <table className="event-table">
        <thead>
          <tr>
            <th>Event ID</th>
            <th>Event Name</th>
            <th>Date</th>
            <th>Activity</th>
            <th>Points</th>
            <th>Hours</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((entry, index) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.event_name}</td>
                <td>{entry.event_date}</td>
                <td>{entry.activity}</td>

                {/* Conditionally render input fields for editing */}
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
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-events-message">
                No events found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirmation Modal for Delete */}
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

export default MemberVolunteerHistory;
