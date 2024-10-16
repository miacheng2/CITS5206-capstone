import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/WorkTeamManagement.module.css';

const WorkTeamManagement = () => {
    const [teamLeaders, setTeamLeaders] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const popupRef = useRef(null);
    const [shouldScrollMembers, setShouldScrollMembers] = useState(false); // Track when to scroll the members list
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);  // Store the filtered list of members
    const [highlightedIndex, setHighlightedIndex] = useState(-1);  // Store the index of the currently highlighted member
    const [searchQuery, setSearchQuery] = useState('');  // Store the exact user input

    const [memberSelected, setMemberSelected] = useState(false);  // Flag to prevent multiple Enter presses
    const [loading, setLoading] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);


    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newTeam, setNewTeam] = useState({
        TeamName: '',
        TeamLeader: '',
        Description: '',
        CreatedDate: '',
        LastModifyDate: '',
        Members: [],
    });

    const [modalMessage, setModalMessage] = useState(""); // Modal message state
    const [isModalOpen, setModalOpen] = useState(false); // Modal visibility state

    const handleCloseModal = () => {
        setModalOpen(false);
    };



    const fetchWithAuth = async (url, options = {}) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        if (!token) {
            console.error('No token found in localStorage');
            throw new Error('No token found');
        }

        const headers = {
            'Authorization': `Bearer ${token}`, // Add the Bearer token to the Authorization header
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers: headers,
        });

        if (response.status === 401) {
            console.log('Unauthorized! Redirecting to login...');
            window.location.href = '/login'; // Redirect to the login page if unauthorized
        }

        return response;
    };







    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await fetchWithAuth('http://localhost:8000/api/detailed-team-members/');
                if (response.ok) {
                    const data = await response.json();
                    setTeamMembers(data);
                    console.log('Fetched team members:', data);
                } else {
                    const errorData = await response.json();
                    console.error('Error fetching team members:', errorData);
                }
            } catch (error) {
                console.error('Error fetching team members:', error);
            }
        };
        fetchTeamMembers();
    }, []);

    useEffect(() => {
        const fetchTeamsWithMembers = async () => {
            try {
                const response = await fetchWithAuth('http://localhost:8000/api/teams-with-members/');
                const data = await response.json();
                console.log('Fetched team data:', data);


                if (Array.isArray(data)) {
                    setTeams(data);
                } else {
                    console.error('Unexpected response format:', data);
                    setTeams([]);
                }
            } catch (error) {
                console.error('Error fetching teams with members:', error);
                setTeams([]);  // Fallback to an empty array on error
            }
        };
        fetchTeamsWithMembers();
    }, []);

    useEffect(() => {
        const fetchTeamLeaders = async () => {
            try {
                const response = await fetchWithAuth('http://localhost:8000/api/team-leaders/');
                const data = await response.json();

                if (Array.isArray(data)) {
                    setTeamLeaders(data);
                } else {
                    console.error('Unexpected response format:', data);
                    setTeamLeaders([]);
                }
            } catch (error) {
                console.error('Error fetching team leaders:', error);
                setTeamLeaders([]);  // Fallback to an empty array on error
            }
        };
        fetchTeamLeaders();
    }, []);

    const availableMembers = teamMembers.filter(
        (member) => selectedTeam && selectedTeam.members && !selectedTeam.members.some(
            (teamMember) => teamMember.australian_sailing_number === member.australian_sailing_number
        )
    );


    const handleSelectAll = () => {
        setSelectedTeams([...teams]);
    };


    const handleSelectInverse = () => {
        const unselectedTeams = teams.filter(team =>
            !selectedTeams.some(selected => selected.id === team.id)
        );
        setSelectedTeams(unselectedTeams);
    };


    const handleUnselectAll = () => {
        setSelectedTeams([]);
    };


    const handleExportToCSV = () => {
        if (selectedTeams.length === 0) {
            setModalMessage("Please select at least one team to export.");
            setModalOpen(true);
            return;
        }

        const allMembersData = selectedTeams.flatMap(team => team.members);

        if (allMembersData.length === 0) {
            setModalMessage("No members available for the selected teams.");
            setModalOpen(true);
            return;
        }

        const csvContent = convertToCSV(allMembersData);

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'selected_team_members.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    const convertToCSV = (data) => {

        const headers = ['numberId', 'firstName', 'lastName', 'email', 'mobile', 'membershipCategory', 'volunteerOrPay'];


        const rows = data.map(member => [
            member.australian_sailing_number,
            member.first_name,
            member.last_name,
            member.email,
            member.mobile,
            member.membership_category,
            member.will_volunteer_or_pay_levy
        ]);

        const csvRows = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ];

        return csvRows.join('\n');
    };

    useEffect(() => {
        const savedTeamId = localStorage.getItem('selectedTeamId');
        const isPopupOpen = localStorage.getItem('isPopupOpen') === 'true';

        if (savedTeamId && isPopupOpen) {
            const team = teams.find(t => t.id === parseInt(savedTeamId));
            if (team) {
                setSelectedTeam(team);
            }
        }
    }, [teams]);

    const handleTeamCardClick = (team) => {
        if (!team || !team.id) {
            console.error("Invalid team or team ID:", team);
            return;
        }
        // Toggle the team's selection
        const isAlreadySelected = selectedTeams.some(selected => selected.id === team.id);

        if (isAlreadySelected) {
            setSelectedTeams(selectedTeams.filter(selected => selected.id !== team.id));
            console.log("Removing team from selected:", team.id);
        } else {
            setSelectedTeams([...selectedTeams, team]);
            console.log("Selecting team:", team.id);
        }
    };

    const handleViewClick = (team) => {
        if (!team || !team.id) {
            console.error("Invalid team or team ID:", team);
            return;
        }

        // Viewing logic without selecting the team
        console.log("Viewing team:", team);
        setSelectedTeam(team);

        // Set the popup to open for viewing
        localStorage.setItem('selectedTeamId', team.id);
        localStorage.setItem('isPopupOpen', 'true');
    };





    const handleClosePopup = () => {
        setIsUpdating(false);
        setNewTeam({
            TeamName: '',
            Description: '',
            TeamLeader: '',
        });
    };


    const ClosePopup = () => {
        setSelectedTeam(null); // Close the popup and clear the selected team
        setIsEditing(false);
        // Remove the team from the selectedTeams state
        setSelectedTeams((prevSelectedTeams) => prevSelectedTeams.filter((team) => team.id !== selectedTeam?.id));

        // Clear local storage
        localStorage.removeItem('selectedTeamId');
        localStorage.removeItem('isPopupOpen');
    };

    useEffect(() => {
        // loading
        const handleInitialLoad = () => {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        };

        window.addEventListener('load', handleInitialLoad);

        return () => {
            window.removeEventListener('load', handleInitialLoad);
        };
    }, []);


    const handleEditTeam = () => {
        setIsEditing(true);
        setIsAddingMember(true); // Disable adding member state when editing a team
    };

    useEffect(() => {
        const savedTeamId = localStorage.getItem('selectedTeamId');
        const isPopupOpen = localStorage.getItem('isPopupOpen');

        if (savedTeamId && isPopupOpen === 'true') {
            // savedTeamId find team
            const team = teams.find(t => t.id === parseInt(savedTeamId));

            if (team) {
                setSelectedTeam(team);
                setIsEditing(true);
            }
        }
    }, [teams]);



    const handleAddMember = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`http://localhost:8000/api/teams/${selectedTeam.id}/add-member/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    members: [...selectedTeam.members.map(m => m.australian_sailing_number), selectedMember]
                }),
            });

            if (response.ok && popupRef.current) {
                const updatedTeam = await response.json();
                setSelectedTeam(prevTeam => ({ ...prevTeam, ...updatedTeam }));
                setMemberSelected(false);  // Ensure the member selection state is reset


                // Save the add member state and search query to localStorage
                localStorage.setItem('isAddingMember', 'true');
                localStorage.setItem('isEditing', 'true');
                setShouldScrollMembers(true);  // Set flag to scroll members list



                window.location.reload();
            } else {
                const errorData = await response.json();
                setModalMessage(`Failed to add member: ${JSON.stringify(errorData)}`);
                setModalOpen(true);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error adding member:', error);
            setLoading(false);
        }
    };
    useEffect(() => {
        const savedIsAddingMember = localStorage.getItem('isAddingMember');
        const savedIsEditing = localStorage.getItem('isEditing');

        if (savedIsAddingMember === 'true') {
            setIsAddingMember(true);
        }
        if (savedIsEditing === 'true') {
            setIsEditing(true);
        }

        return () => {
            localStorage.removeItem('isAddingMember');
            localStorage.removeItem('isEditing');
        };
    }, []);

    useEffect(() => {
        if (shouldScrollMembers && popupRef.current) {
            popupRef.current.scrollTop = popupRef.current.scrollHeight;  // Scroll to the bottom
            setShouldScrollMembers(false);  // Reset flag after scrolling
        }
    }, [shouldScrollMembers]);



    const handleAddTeam = () => {
        setIsAdding(true);


    };



    const handleRemoveSelectedTeams = async () => {
        if (selectedTeams.length === 0) {
            setModalMessage('Please select at least one team to delete.');
            setModalOpen(true);
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete the selected ${selectedTeams.length} team(s)?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');  // Get the token from localStorage
            if (!token) {
                throw new Error('No token found');
            }

            // Iterate over all selected teams and send delete requests
            for (const team of selectedTeams) {
                const response = await fetch(`http://localhost:8000/api/teams/${team.id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Add the Authorization header
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setModalMessage(`Failed to delete team: ${JSON.stringify(errorData)}`);
                    setModalOpen(true);
                    return; // If any deletion fails, stop further deletion and return
                }
            }

            setModalMessage('Selected teams have been successfully deleted!');
            setModalOpen(true);
            setTeams(prevTeams => prevTeams.filter(team => !selectedTeams.some(selected => selected.id === team.id)));
            setSelectedTeams([]); // Clear the list of selected teams
        } catch (error) {
            console.error('Error occurred while deleting teams:', error);
            setModalMessage('An error occurred while deleting the teams.');
            setModalOpen(true);
        }
    };




    const handleUpdateTeam = () => {
        if (selectedTeam.name !== "") {
            setNewTeam({
                TeamName: selectedTeam.name,
                Description: selectedTeam.description,
            });
        }
        setIsUpdating(true);
    };
    const handleCancel = () => {
        setIsAddingMember(false);  // Return to adding a team member
        setIsEditing(false);      // Disable editing
        setSearchQuery('');        // Clear search bar

        localStorage.removeItem('isAddingMember');
        localStorage.removeItem('isEditing');
    };





    const handleCreateTeam = async () => {
        const trimmedTeamName = newTeam.TeamName.trim(); // Remove whitespace

        if (!trimmedTeamName || trimmedTeamName === "Default Team Name") {
            setModalMessage("Please enter a team name.");
            setModalOpen(true);
            return;
        }

        const existingTeam = teams.find(team => team.name === newTeam.TeamName);

        const currentMembers = existingTeam ? existingTeam.members.map(member => member.australian_sailing_number) : [];

        const teamPayload = {
            name: newTeam.TeamName,
            description: newTeam.Description || "No description available",
            team_leader: newTeam.TeamLeader || null,
            members: currentMembers
        };

        if (existingTeam) {

            try {
                const response = await fetch(`http://localhost:8000/api/detailed-teams/${existingTeam.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add the authorization header
                    },
                    body: JSON.stringify(teamPayload),
                });

                if (response.ok) {
                    const updatedTeam = await response.json();
                    setModalMessage('Team updated successfully!');
                    setModalOpen(true);
                    setTeams(prevTeams =>
                        prevTeams.map(team => (team.id === updatedTeam.id ? updatedTeam : team))
                    );
                    handleClosePopup();
                    window.location.reload();  // Optional: Reload the page to reflect the changes

                } else {
                    const errorData = await response.json();
                    setModalMessage(`Failed to update team: ${JSON.stringify(errorData)}`);
                    setModalOpen(true);
                }
            } catch (error) {
                console.error('Error updating team:', error);
                setModalMessage('An error occurred while updating the team.');
                setModalOpen(true);
            }
        } else {
            // Create a new team
            try {
                const response = await fetch('http://localhost:8000/api/detailed-teams/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add the authorization header
                    },
                    body: JSON.stringify(teamPayload),
                });

                if (response.ok) {
                    const newTeamData = await response.json();
                    setModalMessage('Team created successfully!');
                    setModalOpen(true);
                    setTeams([...teams, newTeamData]);
                    setNewTeam({
                        TeamName: '',
                        TeamLeader: '',
                        Description: ''
                    });
                    setSelectedMembers([]);
                    handleClosePopup();
                    window.location.reload();
                } else {
                    const errorData = await response.json();
                    setModalMessage(`Failed to create team: ${JSON.stringify(errorData)}`);
                    setModalOpen(true);
                }
            } catch (error) {
                console.error('Error creating team:', error);
                setModalMessage('An error occurred while creating the team.');
                setModalOpen(true);
            }
        }
    };


    const handleRemoveMember = async () => {
        setIsAddingMember(false);  // Ensure adding member is turned off when deleting
        setIsEditing(false); // Disable editing when deleting a member


        if (selectedMembers.length === 0) {
            setModalMessage('Please select at least one member to remove.');
            setModalOpen(true);
            return;
        }


        const confirmRemove = window.confirm(`Are you sure you want to remove the selected ${selectedMembers.length} member(s)?`);
        if (!confirmRemove) return;

        try {
            const token = localStorage.getItem('token');  // Get token from localStorage
            if (!token) {
                throw new Error('No token found');
            }

            // Send request to remove multiple members
            const response = await fetch(`http://localhost:8000/api/teams/${selectedTeam.id}/remove-members/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ members: selectedMembers }), // Send the selected members array
            });

            if (response.ok) {
                const updatedTeam = await response.json();
                setSelectedTeam(prevTeam => ({ ...prevTeam, ...updatedTeam }));
                setModalMessage('Members removed successfully!');
                setModalOpen(true);
                setSelectedMember(null);

                window.location.reload();  // Optional: Reload the page to reflect the changes
            } else {
                const errorData = await response.json();
                setModalMessage(`Failed to remove members: ${JSON.stringify(errorData)}`);
                setModalOpen(true);
            }
        } catch (error) {
            console.error('Error removing members:', error);
            setModalMessage('An error occurred while removing the members.');
            setModalOpen(true);
        }
    };



    const handleMemberSelection = (e, memberId) => {
        if (e.target.checked) {
            setSelectedMembers(prev => [...prev, memberId]); // Add member ID to the selected list
        } else {
            setSelectedMembers(prev => prev.filter(id => id !== memberId)); // Remove member ID from the selected list
        }
    };















    return (
        <>{loading && (
            <div className={styles.loadingOverlay}>
                <div className={styles.loadingSpinner}></div>
            </div>
        )}
            <div id="main-content" style={{ display: loading ? 'none' : 'block' }}>
                {/* Modal */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            {/* Image at the top */}
                            <span className="modal-close" onClick={handleCloseModal}>
                                &times;
                            </span>
                            <p className="success-message">{modalMessage}</p>
                            <button className="modal-button" onClick={handleCloseModal}>
                                OK
                            </button>
                        </div>
                    </div>
                )}
                <div className={styles.container}>
                    <h1>NYC Work Team Management</h1>
                    <div className={styles.feature}>
                        <div>
                            <div>
                                <button onClick={handleSelectAll}>Select All</button>
                                <button onClick={handleSelectInverse}>Select Inverse</button>
                                <button onClick={handleUnselectAll}>Unselect All</button>
                                <button onClick={handleExportToCSV}>Export Selected to CSV</button>
                            </div>
                            <div>
                                <button onClick={handleAddTeam}>Add +</button>
                                <button onClick={handleRemoveSelectedTeams}>Remove -</button>
                            </div>
                        </div>

                        <div className={styles.teams}>
                            {teams && teams.length > 0 ? (
                                teams.map(team => (
                                    <div
                                        key={team.id}
                                        className={`${styles.teamCard} ${selectedTeams.some(t => t.id === team.id) ? styles.selected : ''}`}
                                        onClick={() => handleTeamCardClick(team)}
                                    >
                                        <div className={styles.teamCardUp}>
                                            <input
                                                type="checkbox"
                                                checked={selectedTeams.some(t => t.id === team.id)}
                                                readOnly
                                            />
                                            <h2>{team.name}</h2>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewClick(team);
                                                }}
                                            >
                                                View
                                            </button>




                                        </div>
                                        <div className={styles.teamCardDown}>
                                            <div>
                                                <h4>Description:</h4>
                                                <p>{team.description || "No description available"}</p>
                                            </div>
                                            <div>
                                                <h4>Team Leader:</h4>
                                                <p>{team.team_leader || "No leader assigned"}</p>
                                            </div>
                                            <div>
                                                <h4>Total Members:</h4>
                                                <p>{team.members ? team.members.length : 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No teams available</p>
                            )}
                        </div>
                    </div>


                </div>
            </div>


            {selectedTeam && (
                <div className={styles.popupBack}>
                    <div className={styles.popup} >
                        <div className={styles.popupContent}>
                            <div className={styles.subdivPopup}>
                                <div>
                                    <h1>Team: {selectedTeam.name}</h1>

                                </div>
                                <div>
                                    <button onClick={handleUpdateTeam}>Edit Team</button>
                                </div>
                            </div>
                            <h4>Description: </h4>
                            <p> {selectedTeam.description}</p>
                            <h4>Team Leader: </h4>
                            <p>{selectedTeam.team_leader || "No leader assigned"}</p>

                            <h4>Creation Date:</h4>
                            <p>{selectedTeam.creation_date || "No date available"}</p>


                            <h3>Members:</h3>
                            <div className={styles.scrollableMembers} ref={popupRef}>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>Selection</th>
                                            <th>numberId</th>
                                            <th>firstName</th>
                                            <th>lastName</th>
                                            <th>Email</th>
                                            <th>mobile</th>
                                            <th>membershipCategory</th>
                                            <th>volunteerOrPay</th>
                                            {/*                                         <th>Actions</th>
 */}                                    </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTeam.members && selectedTeam.members.length > 0 ? (
                                            selectedTeam.members.map((member, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            name="selectedMember"
                                                            value={member.australian_sailing_number}
                                                            checked={selectedMembers.includes(member.australian_sailing_number)}
                                                            onChange={(e) => handleMemberSelection(e, member.australian_sailing_number)}
                                                        />
                                                    </td>
                                                    <td>{member.australian_sailing_number}</td>
                                                    <td>{member.first_name}</td>
                                                    <td>{member.last_name}</td>
                                                    <td>{member.email}</td>
                                                    <td>{member.mobile}</td>
                                                    <td>{member.membership_category}</td>
                                                    <td>{member.will_volunteer_or_pay_levy}</td>
                                                    {/* <td>
                                                    <button onClick={() => handleEditClick(member)}>Edit</button>

                                                </td> */}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7">No members available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* {isModalOpen && (
                                <div className={styles.modal}>
                                    <div className={styles.modalContent}>
                                        <h2>Edit Member</h2>
                                        <form>
                                            <label>
                                                Australian Sailing Number:
                                                <input type="text" name="australian_sailing_number" value={editingMember?.australian_sailing_number} onChange={handleInputChange} readOnly />
                                            </label>
                                            <label>
                                                First Name:
                                                <input type="text" name="first_name" value={editingMember?.first_name} onChange={handleInputChange} />
                                            </label>
                                            <label>
                                                Last Name:
                                                <input type="text" name="last_name" value={editingMember?.last_name} onChange={handleInputChange} />
                                            </label>
                                            <label>
                                                Email:
                                                <input type="text" name="email" value={editingMember?.email} onChange={handleInputChange} />
                                            </label>
                                            <label>
                                                Mobile:
                                                <input type="text" name="mobile" value={editingMember?.mobile} onChange={handleInputChange} />
                                            </label>
                                            <label>
                                                Membership Category:
                                                <input type="text" name="membership_category" value={editingMember?.membership_category} onChange={handleInputChange} />
                                            </label>
                                            <label>
                                                Volunteer or Pay Levy:
                                                <select name="will_volunteer_or_pay_levy" value={editingMember?.will_volunteer_or_pay_levy} onChange={handleInputChange}>
                                                    <option value="">Select an option</option>
                                                    <option value="I will volunteer">I will volunteer</option>
                                                    <option value="I will pay the levy">I will pay the levy</option>
                                                </select>
                                            </label>

                                        </form>
                                        <div className={styles.modalButtons}>
                                            <button onClick={handleEditSubmit}>Update</button>
                                            <button onClick={ClosePopup}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )} */}



                            {isEditing && isAddingMember && (
                                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
                                    {/* Define state */}

                                    {/* Search Bar */}
                                    <input
                                        type="text"
                                        placeholder="Search member by name"
                                        value={searchQuery}  // Keep the exact user input
                                        onChange={(e) => {
                                            const query = e.target.value;  // Do not convert the input to lowercase here; keep the original input
                                            setSearchQuery(query);  // Update the search query state with the exact user input
                                            const filtered = availableMembers.filter(member =>
                                                `${member.first_name.toLowerCase()} ${member.last_name.toLowerCase()}`.includes(query.toLowerCase())  // Convert only for comparison (not the input)
                                            );
                                            setFilteredMembers(filtered);  // Update the filtered members list
                                            setMemberSelected(false);  // Reset the flag when the user starts typing again
                                            if (filtered.length > 0) {
                                                setHighlightedIndex(0);  // Highlight the first member in the filtered list
                                            } else {
                                                setHighlightedIndex(-1);  // Clear highlight if no matches
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (!memberSelected) {  // Check if the member hasn't been selected yet
                                                if (e.key === 'ArrowDown' && filteredMembers.length > 0) {
                                                    setHighlightedIndex((prevIndex) => (prevIndex + 1) % filteredMembers.length);  // Move highlight down the list
                                                }
                                                if (e.key === 'ArrowUp' && filteredMembers.length > 0) {
                                                    setHighlightedIndex((prevIndex) => (prevIndex - 1 + filteredMembers.length) % filteredMembers.length);  // Move highlight up the list
                                                }
                                                if (e.key === 'Enter' && highlightedIndex >= 0) {
                                                    const selectedMember = filteredMembers[highlightedIndex];  // Get the currently highlighted member
                                                    setSearchQuery(`${selectedMember.first_name} ${selectedMember.last_name}`);  // Set the input field with the selected member's name
                                                    setSelectedMember(selectedMember.australian_sailing_number);  // Set the selected member's ID
                                                    setFilteredMembers([]);  // Clear the filtered list after selection
                                                    setMemberSelected(true);  // Set the flag to prevent further Enter presses
                                                }
                                            }
                                        }}
                                        style={{ flex: '1', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}  // Style the input field
                                    />

                                    {/* Display filtered members as a dropdown list */}
                                    {filteredMembers.length > 0 && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',  // Position the dropdown list below the input field
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #ccc',
                                            zIndex: 10,
                                            maxHeight: '150px',  // Limit the height and allow scrolling
                                            overflowY: 'auto',
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0,
                                            width: '100%'  // Ensure the dropdown width matches the input field
                                        }}>
                                            {filteredMembers.map((member, index) => (
                                                <li
                                                    key={member.australian_sailing_number}
                                                    style={{
                                                        padding: '10px',
                                                        backgroundColor: highlightedIndex === index ? '#ddd' : 'white',  // Highlight the current member
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={() => setHighlightedIndex(index)}  // Highlight on mouse hover
                                                    onClick={() => {
                                                        setSearchQuery(`${member.first_name} ${member.last_name}`);  // Set input to selected member's name
                                                        setSelectedMember(member.australian_sailing_number);  // Set the selected member
                                                        setFilteredMembers([]);  // Clear the filtered members list
                                                        setMemberSelected(true);  // Set the flag to prevent further actions
                                                    }}
                                                >
                                                    {member.first_name} {member.last_name}  {/* Display the member's full name */}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}



                            <div className={styles.popupButtons}>
                                {isEditing && isAddingMember ? (
                                    <>
                                        <button className={styles.saveButton} onClick={handleAddMember}>
                                            Save
                                        </button>

                                        {/* Clear the search bar content instead of removing a member */}
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');        // Clear the search query
                                                setFilteredMembers([]);    // Clear the filtered members list
                                                setHighlightedIndex(-1);   // Reset the highlighted index
                                                setMemberSelected(false);  // Reset member selected flag
                                            }}
                                        >
                                            Clear
                                        </button>
                                        <button className={styles.cancelButton} onClick={handleCancel}>

                                            Cancel
                                        </button>

                                    </>
                                ) : (
                                    <>

                                        <button onClick={handleEditTeam}>Add Team Member</button>
                                        <button
                                            onClick={() => handleRemoveMember(selectedMember)} // Pass the selected member's ID or name

                                        >
                                            Remove Team Member
                                        </button>
                                        <button onClick={ClosePopup}>Close</button>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}


            {isAdding && (
                <div className={styles.popupBack}>
                    <div className={styles.popup}>
                        <div className={styles.popupContent}>
                            <div className={styles.editTeam}>
                                <h4>Enter New Team Name or Select Existing Team:</h4>


                                <input
                                    type="text"
                                    placeholder="Enter new team name"
                                    value={newTeam.TeamName}
                                    onChange={(e) => setNewTeam({ ...newTeam, TeamName: e.target.value })}
                                />


                                <select
                                    name="TeamName"
                                    value={newTeam.TeamName}
                                    onChange={(e) => setNewTeam({ ...newTeam, TeamName: e.target.value })}
                                >
                                    <option value="">Select Existing Team</option>
                                    {teams && teams.length > 0 && teams.map((team) => (
                                        <option key={team.id} value={team.name}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.editTeam}>
                                <h4>Description:</h4>
                                <textarea
                                    name="Description"
                                    value={newTeam.Description}
                                    onChange={(e) => setNewTeam({ ...newTeam, Description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.editTeam}>
                                <h4>Team Leader:</h4>
                                <select
                                    name="TeamLeader"
                                    value={newTeam.TeamLeader}
                                    onChange={(e) => setNewTeam({ ...newTeam, TeamLeader: e.target.value })}
                                    required
                                >
                                    <option value="">Select Team Leader</option>
                                    {teamLeaders?.length > 0 && teamLeaders.map((leader, index) => (
                                        <option key={index} value={leader.id}>
                                            {leader.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.popupButtons}>
                                <button className={styles.saveButton} onClick={handleCreateTeam}>
                                    Create
                                </button>
                                <button className={styles.cancelButton} onClick={() => setIsAdding(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isUpdating && (
                <div className={styles.popupBack}>
                    <div className={styles.popup}>
                        <div className={styles.popupContent}>
                            <div className={styles.editTeam}>
                                <h4>Enter New Team Name or Select Existing Team:</h4>


                                <input
                                    type="text"
                                    placeholder="Enter new team name"
                                    value={newTeam.TeamName}
                                    onChange={(e) => setNewTeam({ ...newTeam, TeamName: e.target.value })}
                                />


                                <select
                                    name="TeamName"
                                    value={newTeam.TeamName}
                                    onChange={(e) => setNewTeam({ ...newTeam, TeamName: e.target.value })}
                                >
                                    <option value="">Select Existing Team</option>
                                    {teams && teams.length > 0 && teams.map((team) => (
                                        <option key={team.id} value={team.name}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.editTeam}>
                                <h4>Description:</h4>
                                <textarea
                                    name="Description"
                                    value={newTeam.Description}
                                    onChange={(e) => setNewTeam({ ...newTeam, Description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.editTeam}>
                                <h4>Team Leader:</h4>
                                <select
                                    name="TeamLeader"
                                    value={newTeam.TeamLeader}
                                    onChange={(e) => setNewTeam({ ...newTeam, TeamLeader: e.target.value })}
                                    required
                                >
                                    <option value="">Select Team Leader</option>
                                    {teamLeaders?.length > 0 && teamLeaders.map((leader, index) => (
                                        <option key={index} value={leader.id}>
                                            {leader.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.popupButtons}>
                                <button className={styles.saveButton} onClick={handleCreateTeam}>
                                    Update
                                </button>
                                <button className={styles.cancelButton} onClick={handleClosePopup}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}
        </>
    );

};

export default WorkTeamManagement;
