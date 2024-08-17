import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './WorkTeamManagement.module.css';

const WorkTeamManagement = () => {
    const teamMembers = [
        { name: "Charles John", email: "charles.j@gmail.com", country: "ID", startDate: "11/12/2023", type: "Contract", position: "UX Researcher", status: "Active" },
        { name: "Dianne Russell", email: "dianne@gmail.com", country: "US", startDate: "10/08/2022", type: "Full-time", position: "UX Designer", status: "Active" },
        { name: "Anette Black", email: "anette@gmail.com", country: "UK", startDate: "10/08/2022", type: "Full-time", position: "Project Manager", status: "Active" },
    ];

    const [selectedMembers, setSelectedMembers] = useState({});

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

    const handleEdit = (email) => {
        alert(`Edit function not yet implemented for ${email}`);
    };

    const handleSuspend = (email) => {
        alert(`Suspend function not yet implemented for ${email}`);
    };

    const handleDelete = (email) => {
        alert(`Delete function not yet implemented for ${email}`);
    };

    return (
        <div>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <img src="nyclogo.jpg" alt="Nedlands Yacht Club Logo" className={styles.logo} />
                <h1>Nedlands Yacht Club</h1>
                <ul className={styles.navLinks}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/WorkTeamManagement">Team Management</Link></li>
                    <li><Link to="/membermanagement">Member Management</Link></li>
                    <li><Link to="/events">Event</Link></li>
                    <li><Link to="/VolunteerPoint">Volunteer Point</Link></li>
                    <li><Link to="/reports">Report</Link></li>
                    <li><Link to="/Admin">Admin</Link></li>
                    <li><Link to="/logout">Logout</Link></li>
                </ul>
            </nav>

            <div className={styles.container}>
                <h1>NYC Work Team Management</h1>
                <div className={styles.feature}>
                    <div>
                        <div>
                            <button onClick={selectAll}>Select All</button>
                            <button onClick={invertSelection}>Select Inverse</button>
                            <button onClick={unselectAll}>Unselect All</button>
                        </div>
                        <div>
                            <button>Add + </button>
                            <button>Import From CSV</button>
                            <button>Export To CSV</button>
                        </div>
                    </div>
                    <table className={styles.teamTable}>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Person</th>
                                <th>Email</th>
                                <th>Country</th>
                                <th>Start Date</th>
                                <th>Type</th>
                                <th>Job Title</th>
                                <th>Status</th>
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
                                    <td>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>{member.country}</td>
                                    <td>{member.startDate}</td>
                                    <td>{member.type}</td>
                                    <td>{member.position}</td>
                                    <td>{member.status}</td>
                                    <td>
                                        <button onClick={() => handleEdit(member.email)}>Edit</button>
                                        <button onClick={() => handleSuspend(member.email)}>Suspend</button>
                                        <button onClick={() => handleDelete(member.email)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorkTeamManagement;
