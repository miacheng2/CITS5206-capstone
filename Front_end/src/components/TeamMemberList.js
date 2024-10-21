import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import styles from './styles/TeamMemberList.module.css';

const TeamMemberList = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState({});
    const [editingMember, setEditingMember] = useState(null);
    const [fileInput, setFileInput] = useState(null);
    
    const [newMember, setNewMember] = useState({
        australian_sailing_number: '',
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        membership_category: '',
        will_volunteer_or_pay_levy: '',
        teams: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalMessage, setModalMessage] = useState(""); // Modal message state

  // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const token = localStorage.getItem('token');  // Get the token from localStorage
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch('http://localhost:8000/api/detailed-team-members/', {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Set the Authorization header
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTeamMembers(data);
            } else {
                console.error('Failed to fetch team members:', response.status, response.statusText);
                if (response.status === 401) {
                    console.error('Unauthorized: Redirecting to login.');
                    window.location.href = '/login';  // Redirect to login if unauthorized
                }
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };


    const exportAllToCSV = () => {
        if (teamMembers.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["Australian Sailing Number", "First Name", "Last Name", "Email", "Mobile", "Membership Category", "Volunteer or Pay Levy", "Teams"];
        const csvRows = [
            headers.join(','),
            ...teamMembers.map(member => [
                member.australian_sailing_number,
                member.first_name,
                member.last_name,
                member.email,
                member.mobile,
                member.membership_category,
                member.will_volunteer_or_pay_levy,
                member.teams.map(team => team.name).join('; ')
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, "all-team-members.csv");
    };

    const handleFileUpload = async (file) => {
        // Check if the user is an admin
        const userRole = localStorage.getItem('user_role');
        if (userRole !== "admin") {
            setModalMessage("Access denied: This function is for admin users only.");
            setIsModalOpen(true); // Open denial modal immediately
            return; // Stop rendering anything else
          }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/import-csv/', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Data imported successfully!\nNew records: ${result.new_records}\nUpdated records: ${result.updated_records}\nUnchanged records: ${result.unchanged_records}`);
                fetchTeamMembers(); // Refresh the list to show updated data
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

    

    const handleEditSubmit = async () => {
        const { australian_sailing_number } = editingMember;
        try {
            const response = await fetch(`http://localhost:8000/api/detailed-team-members/${australian_sailing_number}/`, {
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
            [name]: name === 'teams' ? value.split(',').map(v => v.trim()) : value
        }));
    };

    const generateTableHeaders = (data) => {
        const headerMap = {
            australian_sailing_number: "Australian Sailing Number",
            first_name: "First Name",
            last_name: "Last Name",
            email: "Email",
            mobile: "Mobile",
            membership_category: "Membership Category",
            will_volunteer_or_pay_levy: "Volunteer or Pay Levy",
            teams: "Teams"
        };
        
        if (data.length > 0) {
            return Object.keys(data[0]).map(key => headerMap[key] || key);
        }
        return [];
    };

    const handleAddSubmit = async () => {

        const teamsArray = typeof newMember.teams === 'string' && newMember.teams.length > 0
            ? newMember.teams.split(',').map(team => team.trim())
            : [];

        const payload = {
            ...newMember,
            teams: teamsArray,
            membership_category: newMember.membership_category || '',
            will_volunteer_or_pay_levy: newMember.will_volunteer_or_pay_levy || ''
        };

        try {
            const response = await fetch('http://localhost:8000/api/detailed-team-members/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('New member added successfully!');
                fetchTeamMembers();
                setIsModalOpen(false);
                setNewMember({
                    australian_sailing_number: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    mobile: '',
                    membership_category: '',
                    will_volunteer_or_pay_levy: '',
                    teams: '',
                });
            } else {
                const errorData = await response.json();
                alert(`Failed to add new member: ${JSON.stringify(errorData)}`);
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
                [name]: name === 'teams' ? value.split(',').map(v => v.trim()) : value
            }));
        } else {
            setNewMember(prevMember => ({
                ...prevMember,
                [name]: name === 'teams' ? value.split(',').map(v => v.trim()) : value
            }));
        }
    };



    const selectAll = () => {
        const newSelection = {};
        teamMembers.forEach(member => {
            newSelection[member.australian_sailing_number] = true;
        });
        setSelectedMembers(newSelection);
    };

    const unselectAll = () => {
        setSelectedMembers({});
    };

    const exportSelected = () => {

        const selectedData = teamMembers.filter(member => selectedMembers[member.australian_sailing_number]);

        if (selectedData.length > 0) {

            const headers = ["Australian Sailing Number", "First Name", "Last Name", "Email", "Mobile", "Membership Category", "Volunteer or Pay Levy", "Teams"];
            const csvRows = [
                headers.join(','),
                ...selectedData.map(member => [
                    member.australian_sailing_number,
                    member.first_name,
                    member.last_name,
                    member.email,
                    member.mobile,
                    member.membership_category,
                    member.will_volunteer_or_pay_levy,
                    member.teams.map(team => team.name).join('; ')
                ].join(','))
            ];

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, "selected-team-members.csv");
        } else {
            alert("No members selected for export.");
        }
    };

    const invertSelection = () => {
        const newSelection = {};
        teamMembers.forEach(member => {
            newSelection[member.australian_sailing_number] = !selectedMembers[member.australian_sailing_number];
        });
        setSelectedMembers(newSelection);
    };

    const toggleSelection = (australian_sailing_number) => {
        setSelectedMembers(prev => ({
            ...prev,
            [australian_sailing_number]: !prev[australian_sailing_number]
        }));
    };

    return (
        <div className="form-container">
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
    {!isModalOpen && (
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

                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers.map(member => (
                            <tr key={member.australian_sailing_number}  // Use australian_sailing_number as key
                                className={selectedMembers[member.australian_sailing_number] ? styles.selectedRow : ''}
                                onClick={() => toggleSelection(member.australian_sailing_number)}>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type='checkbox'
                                        checked={!!selectedMembers[member.australian_sailing_number]}  // Use australian_sailing_number 
                                        onChange={() => toggleSelection(member.australian_sailing_number)}
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
                                    {member.teams.map((team, index) => (
                                        <span key={index}>{team.name}{index < member.teams.length - 1 ? ', ' : ''}</span>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>{editingMember ? 'Editing Member:' + editingMember.australian_sailing_number : 'Add New Member'}</h2>
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
                                Email:
                                <input type="text" name="email" value={editingMember ? editingMember.email : newMember.email} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Mobile:
                                <input type="text" name="mobile" value={editingMember ? editingMember.mobile : newMember.mobile} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Membership Category:
                                <input type="text" name="membership_category" value={editingMember ? editingMember.membership_category : newMember.membership_category} onChange={editingMember ? handleInputChange : handleAddInputChange} />
                            </label>
                            <label>
                                Volunteer or Pay Levy:
                                <select name="will_volunteer_or_pay_levy" value={editingMember ? editingMember.will_volunteer_or_pay_levy : newMember.will_volunteer_or_pay_levy} onChange={editingMember ? handleInputChange : handleAddInputChange}>
                                    <option value="">Select an option</option>
                                    <option value="I will volunteer">I will volunteer</option>
                                    <option value="I will pay the levy">I will pay the levy</option>
                                </select>
                            </label>
                            <label>
                                Teams:
                                <input type="text" name="teams" value={editingMember ? editingMember.teams.map(team => team.name).join(', ') : newMember.teams} onChange={editingMember ? handleInputChange : handleAddInputChange} />
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
        )}
        </div>
    );
};

export default TeamMemberList;
