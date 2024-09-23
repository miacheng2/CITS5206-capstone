import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function MemberVolunteerHistory() {
  const { uid } = useParams(); // Get the uid from the URL
  const [history, setHistory] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // To track which row is being edited
  const [updatedEntry, setUpdatedEntry] = useState({ points: "", hours: "" });
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
          `http://localhost:8000/api/member-volunteer-history/${uid}/`,
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
      const data = await response.json();
      console.log("Update successful:", data);
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  // Function to handle deletion
  const handleDeleteClick = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login.");
      navigate("/login");
      return;
    }

    const updatedHistory = history.filter((entry) => entry.id !== id);
    setHistory(updatedHistory);

    // Delete the entry from the server (API call)
    try {
      const response = await fetch(
        `http://localhost:8000/api/volunteer-points/${id}/`,
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
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <div>
      <h2>Volunteer History for Member {uid}</h2>
      <table>
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
          {history.map((entry, index) => (
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
                    <button onClick={() => handleSaveClick(index, entry.id)}>
                      Save
                    </button>
                    <button onClick={() => setEditIndex(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditClick(index, entry)}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(entry.id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MemberVolunteerHistory;
