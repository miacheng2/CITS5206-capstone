import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function MemberVolunteerHistory() {
  const { uid } = useParams(); // Get the uid from the URL
  const [history, setHistory] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // To track which row is being edited
  const [updatedEntry, setUpdatedEntry] = useState({ points: "", hours: "" });

  useEffect(() => {
    // Fetch the volunteer history of the member by uid
    fetch(`http://localhost:8000/api/member-volunteer-history/${uid}/`)
      .then((response) => response.json())
      .then((data) => setHistory(data))
      .catch((error) => console.error("Error fetching member history:", error));
  }, [uid]);

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
  const handleSaveClick = (index, id) => {
    const updatedHistory = [...history];
    updatedHistory[index] = {
      ...updatedHistory[index],
      points: parseInt(updatedEntry.points, 10), // Convert to integer
      hours: parseFloat(updatedEntry.hours), // Convert to float if necessary
    };
    setHistory(updatedHistory);
    setEditIndex(null);

    // Update the entry on the server (API call)
    fetch(`http://localhost:8000/api/volunteer-points/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: parseInt(updatedEntry.points, 10), // Convert to integer
        hours: parseFloat(updatedEntry.hours), // Convert to float if necessary
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Update successful:", data))
      .catch((error) => console.error("Error updating entry:", error));
  };

  // Function to handle deletion
  const handleDeleteClick = (id) => {
    const updatedHistory = history.filter((entry) => entry.id !== id);
    setHistory(updatedHistory);

    // Delete the entry from the server (API call)
    fetch(`http://localhost:8000/api/volunteer-points/${id}/`, {
      method: "DELETE",
    }).catch((error) => console.error("Error deleting entry:", error));
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
