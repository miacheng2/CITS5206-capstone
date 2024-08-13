import React, { useState } from 'react';
import { saveAs } from 'file-saver';

import styles from './styles/WorkTeamManagement.module.css';

const WorkTeamManagement = () => {
    const [teamMembers, setTeamMembers] = useState([
        { name: "Charles John", email: "charles.j@gmail.com", dob: "13-Jan-1967", country: "ID", startDate: "11/12/2023", type: "Contract", position: "UX Researcher", status: "Active" },
        { name: "Dianne Russell", email: "dianne@gmail.com", dob: "17-Aug-1982", country: "US", startDate: "10/08/2022", type: "Full-time", position: "UX Designer", status: "Active" },
        { name: "Anette Black", email: "anette@gmail.com", dob: "04-Mar-1959", country: "UK", startDate: "10/08/2022", type: "Full-time", position: "Project Manager", status: "Active" },
    ]);

    const generateTableHeaders = (data) => {
        if (data.length > 0) {
            return Object.keys(data[0]).map(key => {
                // 将字段名转换为更友好的格式
                const header = key.replace(/([A-Z])/g, ' $1').trim();
                return header.charAt(0).toUpperCase() + header.slice(1);
            });
        }
        return [];
    };

    const [selectedMembers, setSelectedMembers] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        dob: '',
        country: '',
        startDate: '',
        type: '',
        position: '',
        status: ''
    });

    const selectAll = () => {
        const newSelection = {};
        teamMembers.forEach(member => {
            newSelection[member.email] = true;
        });
        setSelectedMembers(newSelection);
    };

    const unselectAll = () => {
        setSelectedMembers({});
    };

    const exportSelected = () => {
        const selectedData = teamMembers.filter(member => selectedMembers[member.email]);

        if (selectedData.length > 0) {
            const headers = Object.keys(selectedData[0]).join(',');
            const csvContent = selectedData.reduce((acc, member) => {
                const row = Object.values(member).join(',');
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
            newSelection[member.email] = !selectedMembers[member.email];
        });
        setSelectedMembers(newSelection);
    };

    const toggleSelection = (email) => {
        setSelectedMembers(prev => ({
            ...prev,
            [email]: !prev[email]
        }));
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewMember({
            name: '',
            email: '',
            dob: '',
            country: '',
            startDate: '',
            type: '',
            position: '',
            status: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prevMember => ({
            ...prevMember,
            [name]: value
        }));
    };

    const addMember = () => {
        setTeamMembers(prevMembers => [...prevMembers, newMember]);
        closeModal();
    };

    return (
        <div className={styles.container}>
            <h1>NYC Work Team Management</h1>
            <div className={styles.feature}>
                <div>
                    <div>
                        <button onClick={selectAll}>Select All</button>
                        <button onClick={invertSelection}>Select Inverse</button>
                        <button onClick={unselectAll}>Unselect All</button>
                        <button onClick={exportSelected}>Export Selected to CSV</button>
                    </div>
                    <div>
                        <button onClick={openModal}>Add +</button>
                        <button>Import From CSV</button>
                        <button>Export ALL To CSV</button>
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
                            <tr key={member.email}
                                className={selectedMembers[member.email] ? styles.selectedRow : ''}
                                onClick={() => toggleSelection(member.email)}>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type='checkBox'
                                        checked={!!selectedMembers[member.email]}
                                        onChange={() => toggleSelection(member.email)}
                                    />
                                </td>
                                {Object.values(member).map((value, index) => (
                                    <td key={index}>{value}</td>
                                ))}
                                <td>
                                    <button>Edit</button>
                                    <button>Suspend</button>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Add New Member</h2>
                        <form>
                            <label>
                                Name:
                                <input type="text" name="name" value={newMember.name} onChange={handleInputChange} />
                            </label>
                            <label>
                                Email:
                                <input type="text" name="email" value={newMember.email} onChange={handleInputChange} />
                            </label>
                            <label>
                                Date of Birth:
                                <input type="text" name="dob" value={newMember.dob} onChange={handleInputChange} />
                            </label>
                            <label>
                                Country:
                                <input type="text" name="country" value={newMember.country} onChange={handleInputChange} />
                            </label>
                            <label>
                                Start Date:
                                <input type="text" name="startDate" value={newMember.startDate} onChange={handleInputChange} />
                            </label>
                            <label>
                                Type:
                                <input type="text" name="type" value={newMember.type} onChange={handleInputChange} />
                            </label>
                            <label>
                                Position:
                                <input type="text" name="position" value={newMember.position} onChange={handleInputChange} />
                            </label>
                            <label>
                                Status:
                                <input type="text" name="status" value={newMember.status} onChange={handleInputChange} />
                            </label>
                        </form>
                        <div className={styles.modalButtons}>
                            <button onClick={addMember}>Create</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkTeamManagement;