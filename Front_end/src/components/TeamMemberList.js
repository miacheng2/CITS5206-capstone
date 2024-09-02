import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import styles from './styles/TeamMemberList.module.css';

const TeamMemberList = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null); 
    const [fileInput, setFileInput] = useState(null);
    const [newMember, setNewMember] = useState({
        australian_sailing_number: '',
        first_name: '',
        last_name: '',
        email_address: '',
        mobile: '',
        payment_status: '',
        volunteer_levy: '',
        volunteer_teams: [], 
    });

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/members/');
            const data = await response.json();
            console.log('Fetched team members:', data);
            setTeamMembers(data);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };
    const exportAllToCSV = () => {
        if (teamMembers.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["Australian Sailing Number", "First Name", "Last Name", "Email Address", "Mobile", "Payment Status", "Volunteer Levy", "Volunteer Teams"];
        const csvRows = [
            headers.join(','),
            ...teamMembers.map(member => [
                member.australian_sailing_number,
                member.first_name,
                member.last_name,
                member.email_address,
                member.mobile,
                member.payment_status,
                member.volunteer_levy,
                member.volunteer_teams.map(team => team.name).join('; ')  // Separate multiple teams by semicolon
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, "all-team-members.csv");
    };

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/import-csv/', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert('Data imported successfully!');
                fetchTeamMembers();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('An error occurred while uploading the file.');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleEditClick = (member) => {
        setEditingMember(member);
        setIsModalOpen(true); // Open the modal for editing
    };

    const handleEditSubmit = async () => {
        const { australian_sailing_number } = editingMember;
        try {
            const response = await fetch(`http://localhost:8000/api/members/${australian_sailing_number}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingMember),
            });

            if (response.ok) {
                alert('Member updated successfully!');
                fetchTeamMembers();
                setIsModalOpen(false);
                setEditingMember(null);
            } else {
                alert('Failed to update member.');
            }
        } catch (error) {
            console.error('Error updating member:', error);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingMember(prevMember => ({
            ...prevMember,
            [name]: name === 'volunteer_teams' ? prevMember.volunteer_teams : value 
        }));
    };
  

    const handleDeleteClick = async (numberId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/members/${numberId}/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Member deleted successfully!');
                fetchTeamMembers();
            } else {
                alert('Failed to delete member.');
            }
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    const generateTableHeaders = (data) => {
        if (data.length > 0) {
            return Object.keys(data[0]).map(key => {
                const header = key.replace(/([A-Z])/g, ' $1').trim();
                return header.charAt(0).toUpperCase() + header.slice(1);
            });
        }
        return [];
    };

    const handleAddSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/members/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMember),
            });

            if (response.ok) {
                alert('New member added successfully!');
                fetchTeamMembers();
                setIsModalOpen(false);
                setNewMember({
                    australian_sailing_number: '',
                    first_name: '',
                    last_name: '',
                    email_address: '',
                    mobile: '',
                    payment_status: '',
                    volunteer_levy: '',
                    volunteer_teams: [],
                });
            } else {
                alert('Failed to add new member.');
            }
        } catch (error) {
            console.error('Error adding new member:', error);
        }
    };

    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        if (editingMember) {
            setEditingMember(prevMember => ({
                ...prevMember,
                [name]: name === 'volunteer_teams' ? value.split(',').map(v => v.trim()) : value 
            }));
        } else {
            setNewMember(prevMember => ({
                ...prevMember,
                [name]: name === 'volunteer_teams' ? value.split(',').map(v => v.trim()) : value 
            }));
        }
    };

      


    const openModalForAdd = () => {
        setEditingMember(null);
        setIsModalOpen(true);
    };

    const selectAll = () => {
        const newSelection = {};
        teamMembers.forEach(member => {
            newSelection[member.email_address] = true;
        });
        setSelectedMembers(newSelection);
    };

    const unselectAll = () => {
        setSelectedMembers({});
    };

    const exportSelected = () => {
        const selectedData = teamMembers.filter(member => selectedMembers[member.email_address]);
    
        if (selectedData.length > 0) {
            const headers = Object.keys(selectedData[0]).join(',');
            const csvContent = selectedData.reduce((acc, member) => {
                const row = Object.keys(member).map(key => {
                    if (key === 'volunteer_teams') {
                        return member[key].map(team => team.name).join(', ');
                    }
                    return member[key];
                }).join(',');
    
                return acc + row + '\n';
            }, headers + '\n');
    
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, "selected-team-members.csv");
        } else {
            alert("No members selected for export.");
        }
    };
    

    const invertSelection = () => {
        const newSelection = {};
        teamMembers.forEach(member => {
            newSelection[member.email_address] = !selectedMembers[member.email_address];
        });
        setSelectedMembers(newSelection);
    };

    const toggleSelection = (email) => {
        setSelectedMembers(prev => ({
            ...prev,
            [email]: !prev[email]
        }));
    };

    return (
        <div className={styles.container}>
            <h1>NYC Member Management</h1>
            <div className={styles.feature}>
                <div>
                    <div>
                        <button onClick={selectAll}>Select All</button>
                        <button onClick={invertSelection}>Select Inverse</button>
                        <button onClick={unselectAll}>Unselect All</button>
                        <button onClick={exportSelected}>Export Selected to CSV</button>
                    </div>
                    <div>
                        <button onClick={openModalForAdd}>Add +</button>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            ref={(input) => setFileInput(input)}
                        />
                        <button onClick={() => fileInput && fileInput.click()}>Import From CSV</button>
                        <button onClick={exportAllToCSV}>Export ALL To CSV</button>
                    </div>
                </div>
                <table className={styles.teamTable}>
                    <thead>
                        <tr>
                            <th>Select</th>
                            {teamMembers.length > 0 && generateTableHeaders(teamMembers).map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers.map(member => (
                            <tr key={member.email_address}
                                className={selectedMembers[member.email_address] ? styles.selectedRow : ''}
                                onClick={() => toggleSelection(member.email_address)}>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type='checkBox'
                                        checked={!!selectedMembers[member.email_address]}
                                        onChange={() => toggleSelection(member.email_address)}
                                    />
                                </td>
                                <td>{member.australian_sailing_number}</td>
                                <td>{member.first_name}</td>
                                <td>{member.last_name}</td>
                                <td>{member.email_address}</td>
                                <td>{member.mobile}</td>
                                <td>{member.payment_status}</td>
                                <td>{member.volunteer_levy}</td>
                                <td>
                                    {member.volunteer_teams.map((team, index) => (
                                        <span key={index}>{team.name}{index < member.volunteer_teams.length - 1 ? ', ' : ''}</span>
                                    ))}
                                </td>
                                <td>
                                    <button onClick={() => handleEditClick(member)}>Edit</button>
                                    <button onClick={() => handleDeleteClick(member.australian_sailing_number)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                    <h2>{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
                    <form>
                            <label>
                                Australian Sailing Number:
                                <input type="text" name="australian_sailing_number" value={editingMember ? editingMember.australian_sailing_number : newMember.australian_sailing_number} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                First Name:
                                <input type="text" name="first_name" value={editingMember ? editingMember.first_name : newMember.first_name} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Last Name:
                                <input type="text" name="last_name" value={editingMember ? editingMember.last_name : newMember.last_name} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Email Address:
                                <input type="text" name="email_address" value={editingMember ? editingMember.email_address : newMember.email_address} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Mobile:
                                <input type="text" name="mobile" value={editingMember ? editingMember.mobile : newMember.mobile} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Payment Status:
                                <input type="text" name="payment_status" value={editingMember ? editingMember.payment_status : newMember.payment_status} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Volunteer Levy:
                                <input type="text" name="volunteer_levy" value={editingMember ? editingMember.volunteer_levy : newMember.volunteer_levy} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Volunteer Teams:
                                <input type="text" name="volunteer_teams" value={editingMember ? editingMember.volunteer_teams.map(team => team.name).join(', ') : newMember.volunteer_teams.join(', ')} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                        </form>
                        <div className={styles.modalButtons}>
                        <button onClick={editingMember ? handleEditSubmit : handleAddSubmit}>
                                {editingMember ? 'Update' : 'Add'}
                            </button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMemberList;
