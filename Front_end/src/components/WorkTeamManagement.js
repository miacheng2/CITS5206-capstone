import React, { useState } from 'react';
import { saveAs } from 'file-saver';

import styles from './styles/WorkTeamManagement.module.css';

const WorkTeamManagement = () => {
    const initialMembers = [
        { numberId: "12345", name: "Charles John", name: "Charles John", email: "charles.j@gmail.com", dob: "13-Jan-1967", country: "ID", startDate: "11/12/2023", type: "Contract", position: "UX Researcher", status: "Active" },
        { numberId: "12345", name: "Dianne Russell", email: "dianne@gmail.com", dob: "17-Aug-1982", country: "US", startDate: "10/08/2022", type: "Full-time", position: "UX Designer", status: "Active" },
        { numberId: "12345", name: "Anette Black", email: "anette@gmail.com", dob: "04-Mar-1959", country: "UK", startDate: "10/08/2022", type: "Full-time", position: "Project Manager", status: "Active" },
        { numberId: "12345", name: "Tom Green", email: "tom.green@gmail.com", dob: "22-May-1974", country: "CA", startDate: "01/01/2022", type: "Part-time", position: "Developer", status: "Active" },
        { numberId: "12345", name: "Lucy Grey", email: "lucy.grey@gmail.com", dob: "30-Oct-1990", country: "AU", startDate: "15/01/2023", type: "Full-time", position: "Marketing Manager", status: "Active" },
        { numberId: "12345", name: "Ethan Hunt", email: "ethan.hunt@gmail.com", dob: "19-Feb-1985", country: "US", startDate: "20/05/2021", type: "Contract", position: "Sales Executive", status: "Active" },
        { numberId: "12345", name: "Sophia Loren", email: "sophia.loren@gmail.com", dob: "09-Jul-1972", country: "IT", startDate: "23/11/2022", type: "Full-time", position: "Human Resources", status: "Active" },
        { numberId: "12345", name: "Oliver Twist", email: "oliver.twist@gmail.com", dob: "15-Mar-1980", country: "UK", startDate: "12/02/2020", type: "Part-time", position: "Customer Service Representative", status: "Active" },
        { numberId: "12345", name: "Maria Garcia", email: "maria.garcia@gmail.com", dob: "27-Apr-1992", country: "ES", startDate: "07/07/2023", type: "Full-time", position: "Data Analyst", status: "Active" },
        { numberId: "12345", name: "John Doe", email: "john.doe@gmail.com", dob: "01-Jan-1988", country: "US", startDate: "22/08/2021", type: "Full-time", position: "Software Engineer", status: "Active" }
    ];
    const selectRandomMembers = (count) => {
        const shuffled = [...initialMembers].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const [teams, setTeams] = useState([
        { TeamName: "team1", TeamLeader: "Charles John", Description: "Lead Design Team", CreatedDate: "2020-01-10", LastModifyDate: "2023-07-21", Members: selectRandomMembers(4) },
        { TeamName: "team2", TeamLeader: "Dianne Russell", Description: "Project Management Team", CreatedDate: "2020-02-15", LastModifyDate: "2023-07-22", Members: selectRandomMembers(3) },
        { TeamName: "team3", TeamLeader: "Anette Black", Description: "Research and Development Team", CreatedDate: "2021-03-20", LastModifyDate: "2023-07-23", Members: selectRandomMembers(6) },
        { TeamName: "team4", TeamLeader: "Charles John", Description: "Quality Assurance Team", CreatedDate: "2021-04-25", LastModifyDate: "2023-07-24", Members: selectRandomMembers(4) },
        { TeamName: "team5", TeamLeader: "Dianne Russell", Description: "Human Resources Team", CreatedDate: "2021-05-30", LastModifyDate: "2023-07-25", Members: selectRandomMembers(3) },
        { TeamName: "team6", TeamLeader: "Anette Black", Description: "Marketing Team", CreatedDate: "2022-06-15", LastModifyDate: "2023-07-26", Members: selectRandomMembers(2) }
    ]);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTeam, setEditedTeam] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newTeam, setNewTeam] = useState({
        TeamName: '',
        TeamLeader: '',
        Description: '',
        CreatedDate: '',
        LastModifyDate: '',
        Members: [],
    });

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
        const selectedTeamsData = teams.filter(team => selectedTeams.includes(team.TeamName));
        const csvContent = "data:text/csv;charset=utf-8," + convertToCSV(selectedTeamsData);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "selected_teams.csv");
    };

    const convertToCSV = (data) => {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => Object.values(row).join(","));
        return [headers.join(","), ...rows].join("\n");
    };


    const handleTeamCardClick = (teamName) => {
        if (selectedTeams.includes(teamName)) {
            setSelectedTeams(selectedTeams.filter(name => name !== teamName));
        } else {
            setSelectedTeams([...selectedTeams, teamName]);
        }
    };

    const handleViewClick = (event, team) => {
        event.stopPropagation();
        setSelectedTeam(team);
        setEditedTeam({ ...team });
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

    const handleAddMember = (memberName) => {
        const selectedMember = initialMembers.find((member) => member.name === memberName);
        if (selectedMember) {
            setEditedTeam((prevTeam) => ({
                ...prevTeam,
                Members: [...prevTeam.Members, selectedMember],
            }));
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

    const handleDeleteTeam = () => {
        setTeams((prevTeams) => prevTeams.filter((team) => team.TeamName !== selectedTeam.TeamName));
        setSelectedTeam(null);
        setIsEditing(false);
        setEditedTeam(null);
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

    const handleCreateTeam = () => {
        if (newTeam.TeamName && newTeam.TeamLeader && newTeam.Description) {
            setTeams([...teams, { ...newTeam, CreatedDate: new Date().toISOString().slice(0, 10), LastModifyDate: new Date().toISOString().slice(0, 10) }]);
            setNewTeam({
                TeamName: '',
                TeamLeader: '',
                Description: '',
                CreatedDate: '',
                LastModifyDate: '',
                Members: [],
            });
            setIsAdding(false);
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const handleRemoveSelectedTeams = () => {
        if (selectedTeams.length > 0) {
            const updatedTeams = teams.filter(team => !selectedTeams.includes(team.TeamName));
            setTeams(updatedTeams);
            setSelectedTeams([]);
        } else {
            alert('Please select at least one team to remove.');
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
                        {teams.map(team => (
                            <div
                                className={`${styles.teamCard} ${selectedTeams.includes(team.TeamName) ? styles.selected : ''}`}
                                onClick={() => handleTeamCardClick(team.TeamName)}
                            >
                                <div className={styles.teamCardUp}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTeams.includes(team.TeamName)}
                                        readOnly
                                    />
                                    <h2>{team.TeamName}</h2>
                                    <button onClick={(event) => handleViewClick(event, team)}>View</button>
                                </div>
                                <div className={styles.teamCardDown}>
                                    <div>
                                        <h4>Description:</h4>
                                        <p>{team.Description}</p>
                                    </div>
                                    <div>
                                        <h4>Leader: </h4>
                                        <p>{team.TeamLeader}</p>
                                    </div>
                                    <div>
                                        <h4>Total Members:</h4>
                                        <p>{team.Members.length}</p>
                                    </div>
                                </div>
                            </div>))}
                    </div>
                </div>
            </div>
            {selectedTeam && (
                <div className={styles.popupBack}>
                    <div className={styles.popup}>
                        <div className={styles.popupContent}>
                            {isEditing ? (
                                <>
                                    <div className={styles.editTeam}>
                                        <h4>Team Name:</h4>
                                        <input
                                            type="text"
                                            name="TeamName"
                                            value={editedTeam.TeamName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className={styles.editTeam}>
                                        <h4>Description:</h4>
                                        <textarea
                                            name="Description"
                                            value={editedTeam.Description}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                    <div className={styles.editTeam}>
                                        <h4>Team Leader:</h4>
                                        <select
                                            name="TeamLeader"
                                            value={editedTeam.TeamLeader}
                                            onChange={handleChange}
                                        >
                                            {initialMembers.map((member, index) => (
                                                <option key={index} value={member.name}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1>Team: {selectedTeam.TeamName}</h1>
                                    <p>Description: {selectedTeam.Description}</p>
                                    <p>Team Leader: {selectedTeam.TeamLeader}</p>
                                </>
                            )}
                            <p>Created Date: {selectedTeam.CreatedDate}</p>
                            <p>Last Modified Date: {selectedTeam.LastModifyDate}</p>
                            <h3>Members:</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>numberId</th>
                                        <th>firstName</th>
                                        <th>lastName</th>
                                        <th>Email</th>
                                        <th>mobile</th>
                                        <th>paymentStatus</th>
                                        <th>volubteerOrPay</th>
                                        <th>teamType</th>
                                        {isEditing && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {editedTeam.Members.map((member, index) => (
                                        <tr key={index}>
                                            <td>{member.name}</td>
                                            <td>{member.email}</td>
                                            <td>{member.dob}</td>
                                            <td>{member.country}</td>
                                            <td>{member.startDate}</td>
                                            <td>{member.type}</td>
                                            <td>{member.position}</td>
                                            <td>{member.status}</td>
                                            {isEditing && (
                                                <td>
                                                    <button onClick={() => handleRemoveMember(member.name)}>
                                                        Remove
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {isEditing && (
                                <div className={styles.teamAddMember}>
                                    <p>Select to add members:</p>
                                    <select onChange={(e) => handleAddMember(e.target.value)}>
                                        <option value="">Select Member</option>
                                        {initialMembers
                                            .filter((member) => !editedTeam.Members.some((m) => m.name === member.name))
                                            .map((member, index) => (
                                                <option key={index} value={member.name}>
                                                    {member.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}
                            <div className={styles.popupButtons}>
                                {isEditing ? (
                                    <>
                                        <button className={styles.saveButton} onClick={handleSaveTeam}>
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
                                <h4>Team Name:</h4>
                                <input
                                    type="text"
                                    name="TeamName"
                                    value={newTeam.TeamName}
                                    onChange={(e) => setNewTeam({ ...newTeam, TeamName: e.target.value })}
                                    required
                                />
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
                                    {initialMembers.map((member, index) => (
                                        <option key={index} value={member.name}>
                                            {member.name}
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