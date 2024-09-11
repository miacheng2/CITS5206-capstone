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




    const [editedTeam, setEditedTeam] = useState({
        Members: []  
    });
    const [isEditing, setIsEditing] = useState(false);  
    const [isAdding, setIsAdding] = useState(false);  
    const [newTeam, setNewTeam] = useState({
        TeamName: '',
        TeamLeader: '',
        Description: '',
        CreatedDate: '',
        LastModifyDate: '',
        Members: [],
    });



    const [newTeamName, setNewTeamName] = useState(''); 
   
    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/detailed-team-members/');
                const data = await response.json();
                setTeamMembers(data || []);  
            } catch (error) {
                console.error('Error fetching team members:', error);
            }
        };
        fetchTeamMembers();
    }, []);

   
    useEffect(() => {
        const fetchTeamsWithMembers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/teams-with-members/');
                const data = await response.json();
                setTeams(data || []);  
            } catch (error) {
                console.error('Error fetching teams with members:', error);
            }
        };
        fetchTeamsWithMembers();
    }, []);

    useEffect(() => {
        const fetchTeamLeaders = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/team-leaders/');
                const data = await response.json();
                setTeamLeaders(data || []); 
            } catch (error) {
                console.error('Error fetching team leaders:', error);
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
        setSelectedTeams([...teams.map(team => team.TeamName)]);
    };


    const handleSelectInverse = () => {
        const unselectedTeams = teams
            .filter(team => !selectedTeams.includes(team.TeamName))
            .map(team => team.TeamName);
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

    const selectedTeamsData = teams.filter(team => selectedTeams.includes(team.name));
    const allMembersData = selectedTeamsData.flatMap(team => team.members);
    
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
        ...rows.map(row => row.join(','))  // 
    ];

    return csvRows.join('\n');
};

   
    const handleTeamCardClick = (teamName) => {
        if (selectedTeams.includes(teamName)) {
            setSelectedTeams(selectedTeams.filter(name => name !== teamName));
        } else {
            setSelectedTeams([...selectedTeams, teamName]);
        }
    };
    

    const handleClosePopup = () => {
        setSelectedTeam(null);
        setIsEditing(false);
        setEditedTeam(null);
    };

  
    const handleEditTeam = () => {
        setIsEditing(true);
    };

    const handleRemoveMember = (memberName) => {
        setEditedTeam((prevTeam) => ({
            ...prevTeam,
            Members: prevTeam.Members.filter((member) => member.name !== memberName),
        }));
    };

  
const handleAddMember = async () => {
    if (!selectedMember) {
        alert('Please select a member to add.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/teams/${selectedTeam.id}/add-member/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                members: [...selectedTeam.members.map(m => m.australian_sailing_number), selectedMember]  
            }),
        });

        if (response.ok) {
            const updatedTeam = await response.json();
            setSelectedTeam(updatedTeam);  
            alert('Member added successfully!');
        } else {
            const errorData = await response.json();
            alert(`Failed to add member: ${JSON.stringify(errorData)}`);
        }
    } catch (error) {
        console.error('Error adding member:', error);
        alert('An error occurred while adding the member.');
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
            const response = await fetch(`http://localhost:8000/api/teams/${selectedTeam.id}/`, {
                method: 'DELETE',
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
            alert('select at least one');
            return;
        }
    
        const confirmDelete = window.confirm(`Are you sure ${selectedTeams.length} `);
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(`http://localhost:8000/api/teams/delete-multiple/`, {
                method: 'DELETE',  
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ team_names: selectedTeams }),  
            });
    
            if (response.ok) {
                alert('successful');
                const deletedTeamNames = await response.json();
                
                setTeams(prevTeams => prevTeams.filter(team => !deletedTeamNames.includes(team.name)));
                setSelectedTeams([]);  
            } else {
                const errorData = await response.json();
                alert(`Fail ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('deleted error');
        }
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
                    },
                    body: JSON.stringify(teamPayload),
                });
    
                if (response.ok) {
                    const updatedTeam = await response.json();
                    alert('Team updated successfully!');
                    setTeams((prevTeams) =>
                        prevTeams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
                    );
                    setNewTeam({
                        TeamName: '',
                        TeamLeader: '',
                        Description: ''
                    });
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update team: ${JSON.stringify(errorData)}`);
                }
            } catch (error) {
                console.error('Error updating team:', error);
                alert('An error occurred while updating the team.');
            }
        } else {
            try {
                const response = await fetch('http://localhost:8000/api/detailed-teams/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
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
    
    





    return (
        <>
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
                                    className={`${styles.teamCard} ${selectedTeams.includes(team.name) ? styles.selected : ''}`}
                                    onClick={() => handleTeamCardClick(team.name)}  
                                >
                                    <div className={styles.teamCardUp}>
                                        <input
                                            type="checkbox"
                                            checked={selectedTeams.includes(team.name)}  
                                            readOnly
                                        />
                                        <h2>{team.name}</h2>
                                        <button onClick={() => {
                                            console.log('Team Object:', team); 
                                            if (team.teams && team.teams.length > 0) {
                                                console.log('First Team in Teams:', team.teams[0]); 
                                                //console.log('Creation Date:', team.teams[0].creation_date); //  creation_date
                                                //console.log('Last Modified Date:', team.teams[0].last_modified_date); // last_modified_date
                                            } else {
                                                console.warn('No teams available for this team.');
                                            }

                                            
                                            setSelectedTeam({
                                                ...team,
                                                team_leader_name: team.team_leader || "No leader",  

                                            });
                                        }}>View</button>
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

           
            {selectedTeam && (
                <div className={styles.popupBack}>
                    <div className={styles.popup}>
                        <div className={styles.popupContent}>

                            <h1>Team: {selectedTeam.name}</h1>
                            <p>Description: {selectedTeam.description}</p>


                            <p>Team Leader: {selectedTeam.team_leader_name}</p>


                            <h3>Members:</h3>

                            <table>
                                <thead>
                                    <tr>
                                        <th>numberId</th>
                                        <th>firstName</th>
                                        <th>lastName</th>
                                        <th>Email</th>
                                        <th>mobile</th>
                                        <th>membershipCategory</th>
                                        <th>volunteerOrPay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTeam.members && selectedTeam.members.length > 0 ? (
                                        selectedTeam.members.map((member, index) => (
                                            <tr key={index}>
                                                <td>{member.australian_sailing_number}</td>
                                                <td>{member.first_name}</td>
                                                <td>{member.last_name}</td>
                                                <td>{member.email}</td>
                                                <td>{member.mobile}</td>
                                                <td>{member.membership_category}</td>
                                                <td>{member.will_volunteer_or_pay_levy}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7">No members available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                          
                            {isEditing && (
                                <div>
                                    <label>Select to add members:</label>
                                    <select
                                        value={selectedMember}
                                        onChange={(e) => setSelectedMember(e.target.value)}  
                                    >
                                        <option value="">Select Member</option>
                                        {availableMembers.length > 0 ? (
                                            availableMembers.map((member) => (
                                                <option key={member.australian_sailing_number} value={member.australian_sailing_number}>
                                                    {member.first_name} {member.last_name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No members available</option>
                                        )}
                                    </select>
                                </div>
                            )}

                            <div className={styles.popupButtons}>
                                {isEditing ? (
                                    <>
                                        <button className={styles.saveButton} onClick={handleAddMember}>
                                            Save
                                        </button>
                                        <button className={styles.cancelButton} onClick={handleClosePopup}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleEditTeam}>Edit Team</button>
                                        <button onClick={handleDeleteTeam}>Delete Team</button>
                                        <button onClick={handleClosePopup}>Close</button>
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
        </>
    );
};

export default WorkTeamManagement;
