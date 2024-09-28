import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';


import styles from './styles/WorkTeamManagement.module.css';

const WorkTeamManagement = () => {
    const [teamLeaders, setTeamLeaders] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);



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








    const [editedTeam, setEditedTeam] = useState({
        Members: []
    });
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



    const [newTeamName, setNewTeamName] = useState('');
    const [editingMember, setEditingMember] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleEditClick = (member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleEditSubmit = async () => {
        const { australian_sailing_number } = editingMember;
        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`http://localhost:8000/api/detailed-team-members/${australian_sailing_number}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Set the Authorization header
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingMember),
            });

            if (response.ok) {
                alert('Member updated successfully!');
                setIsModalOpen(false);
                setEditingMember(null);
                // Update the selected team with the updated member data
                setSelectedTeam((prevTeam) => ({
                    ...prevTeam,
                    members: prevTeam.members.map((member) =>
                        member.australian_sailing_number === australian_sailing_number ? editingMember : member
                    ),
                }));
            } else {
                alert('Failed to update member.');
            }
        } catch (error) {
            console.error('Error updating member:', error);
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingMember((prevMember) => ({
            ...prevMember,
            [name]: name === 'teams' ? value.split(',').map((v) => v.trim()) : value,
        }));
    };

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
            alert('Please select at least one team to export.');
            return;
        }

        const allMembersData = selectedTeams.flatMap(team => team.members);

        if (allMembersData.length === 0) {
            alert('No members available for the selected teams.');
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
    
        console.log("Selected team:", team);
    
        const isAlreadySelected = selectedTeams.some(selected => selected.id === team.id);
    
        if (isAlreadySelected) {
            setSelectedTeams(selectedTeams.filter(selected => selected.id !== team.id));
            console.log("Removing team with ID:", team.id);
        } else {
            setSelectedTeams([...selectedTeams, team]);
            console.log("Adding team with ID:", team.id);
        }
    };
    const handleViewClick = (team) => {
        if (!team || !team.id) {
            console.error("Invalid team or team ID:", team);
            return;
        }

        console.log("Selected team:", team);

        const isAlreadySelected = selectedTeams.some(selected => selected.id === team.id);

        if (isAlreadySelected) {
            setSelectedTeams(selectedTeams.filter(selected => selected.id !== team.id));
            console.log("Deleting team with ID:", team.id);

            localStorage.removeItem('selectedTeamId');
            localStorage.removeItem('isPopupOpen');

     
            setSelectedTeam(null);
        } else {
            setSelectedTeams([...selectedTeams, team]);
            console.log("Adding team with ID:", team.id);

            // store team ID  localStorage
            localStorage.setItem('selectedTeamId', team.id);
            localStorage.setItem('isPopupOpen', 'true');

     
            setSelectedTeam(team);
        }


    };




    const handleClosePopup = () => {
        setSelectedTeam(null);
        setIsEditing(false);
        setEditedTeam(null);

        localStorage.removeItem('selectedTeamId');
        localStorage.removeItem('isPopupOpen');
        window.location.reload();

    };

    const ClosePopup = () => {
        setSelectedTeam(null);
        setIsEditing(false);
        setEditedTeam(null);
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

            if (response.ok) {
                const updatedTeam = await response.json();
                setSelectedTeam(prevTeam => ({ ...prevTeam, ...updatedTeam }));
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Failed to add member: ${JSON.stringify(errorData)}`);
                setLoading(false); 
            }
        } catch (error) {
            console.error('Error adding member:', error);
            setLoading(false); 
        }
    };

 
    





    const handleSaveTeam = () => {
        setTeams((prevTeams) =>
            prevTeams.map((team) => (team.TeamName === editedTeam.TeamName ? editedTeam : team))
        );
        setIsEditing(false);
        setSelectedTeam(null);
        setEditedTeam(null);
    };

    const handleDeleteTeam = async () => {
        if (!selectedTeam || !selectedTeam.id) {
            alert("No team selected to delete.");
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete the team "${selectedTeam.name}"?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`http://localhost:8000/api/teams/${selectedTeam.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Set the Authorization header
                },
            });

            if (response.ok) {
                alert('Team deleted successfully!');
                setTeams((prevTeams) => prevTeams.filter((team) => team.id !== selectedTeam.id));
                setSelectedTeam(null);
            } else {
                const errorData = await response.json();
                alert(`Failed to delete team: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error deleting team:', error);
            alert('An error occurred while deleting the team.');
        }
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedTeam((prevTeam) => ({
            ...prevTeam,
            [name]: value,
        }));
    };

    const handleAddTeam = () => {
        setIsAdding(true);
    };



    const handleRemoveSelectedTeams = async () => {
        if (selectedTeams.length === 0) {
            alert('Please select at least one team to delete.');
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
                    alert(`Failed to delete team: ${JSON.stringify(errorData)}`);
                    return; // If any deletion fails, stop further deletion and return
                }
            }

            alert('Selected teams have been successfully deleted!');
            setTeams(prevTeams => prevTeams.filter(team => !selectedTeams.some(selected => selected.id === team.id)));
            setSelectedTeams([]); // Clear the list of selected teams
        } catch (error) {
            console.error('Error occurred while deleting teams:', error);
            alert('An error occurred while deleting the teams.');
        }
    };




    const handleUpdateTeam = () => {
        if (selectedTeam.name != "") {
            setNewTeam({
                TeamName: selectedTeam.name,
                Description: selectedTeam.description,
            });
        }
        setIsUpdating(true);
    };




    const handleCreateTeam = async () => {
        const existingTeam = teams.find(team => team.name === newTeam.TeamName);

        const currentMembers = existingTeam ? existingTeam.members.map(member => member.australian_sailing_number) : [];

        const teamPayload = {
            name: newTeam.TeamName || "Default Team Name",
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
                    alert('Team updated successfully!');
                    setTeams(prevTeams =>
                        prevTeams.map(team => (team.id === updatedTeam.id ? updatedTeam : team))
                    );
                    handleClosePopup();
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update team: ${JSON.stringify(errorData)}`);
                }
            } catch (error) {
                console.error('Error updating team:', error);
                alert('An error occurred while updating the team.');
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
                    alert('Team created successfully!');
                    setTeams([...teams, newTeamData]);
                    setNewTeam({
                        TeamName: '',
                        TeamLeader: '',
                        Description: ''
                    });
                    setSelectedMembers([]);
                    handleClosePopup();
                } else {
                    const errorData = await response.json();
                    alert(`Failed to create team: ${JSON.stringify(errorData)}`);
                }
            } catch (error) {
                console.error('Error creating team:', error);
                alert('An error occurred while creating the team.');
            }
        }
    };

    const handleRemoveMember = async () => {
        if (!selectedMember) {
            alert('Please select a member to remove.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');  // 从 localStorage 获取 token
            if (!token) {
                throw new Error('No token found');
            }
    
            const response = await fetch(`http://localhost:8000/api/teams/${selectedTeam.id}/remove-member/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,  // 设置 Authorization 头
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ member: selectedMember }), // 发送要删除的成员ID
            });
    
            if (response.ok) {
                const updatedTeam = await response.json();
                setSelectedTeam(prevTeam => ({ ...prevTeam, ...updatedTeam }));
                alert('Member removed successfully!');
    
                // 更新团队信息并保持弹出窗口状态
                localStorage.setItem('selectedTeamId', selectedTeam.id);
                localStorage.setItem('isPopupOpen', 'true'); // 保持弹出窗口打开
    
                // 刷新页面以反映更改
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Failed to remove member: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error removing member:', error);
            alert('An error occurred while removing the member.');
        }
    };
    













    return (
        <>{loading && (
            <div className={styles.loadingOverlay}>
                <div className={styles.loadingSpinner}></div>
            </div>
        )}
            <div id="main-content" style={{ display: loading ? 'none' : 'block' }}>
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
                                            onClick={() => handleViewClick(team)}
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
                    <div className={styles.popup}>
                        <div className={styles.popupContent}>
                            <div className={styles.subdivPopup}>
                                <div>
                                    <h1>Team: {selectedTeam.name}</h1>

                                </div>
                                <div>
                                    <button onClick={handleUpdateTeam}>Edit Team</button>
                                </div>
                            </div>
                            <p>Description: {selectedTeam.description}</p>
                            <p>Team Leader: {selectedTeam.team_leader_name}</p>
                            <h3>Members:</h3>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTeam.members && selectedTeam.members.length > 0 ? (
                                        selectedTeam.members.map((member, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="radio"
                                                        name="selectedMember"
                                                        value={member.australian_sailing_number}
                                                        onChange={() => {
                                                            console.log('Selected Member Australian Sailing Number:', member.australian_sailing_number); // Debug log
                                                            setSelectedMember(member.australian_sailing_number);  // Update selected member's ID
                                                        }}
                                                    />
                                                </td>
                                                <td>{member.australian_sailing_number}</td>
                                                <td>{member.first_name}</td>
                                                <td>{member.last_name}</td>
                                                <td>{member.email}</td>
                                                <td>{member.mobile}</td>
                                                <td>{member.membership_category}</td>
                                                <td>{member.will_volunteer_or_pay_levy}</td>
                                                <td>
                                                    <button onClick={() => handleEditClick(member)}>Edit</button>

                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7">No members available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {isModalOpen && (
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
                            )}



                            {isEditing && (
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
                                {isEditing ? (
                                    <>
                                        <button className={styles.saveButton} onClick={handleAddMember}>
                                            Save
                                        </button>
                                        
                                        <button
                                            onClick={() => handleRemoveMember(selectedMember)} // Pass the selected member's ID or name

                                        >
                                            Remove
                                        </button>
                                        <button className={styles.cancelButton} onClick={ClosePopup}>
                                            Cancel
                                        </button>
                                        
                                    </>
                                ) : (
                                    <>

                                        <button onClick={handleEditTeam}>Add Team Member</button>
                                        <button
                                            onClick={() => handleRemoveMember(selectedMember)} // Pass the selected member's ID or name

                                        >
                                            Delete Team Member
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
