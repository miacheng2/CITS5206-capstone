import React, { useState } from 'react';
import styles from './WorkTeamManagement.module.css'; // 假设有相应的CSS模块

const WorkTeamManagement = () => {
    const teamMembers = [
        { name: "Charles John", email: "charles.j@gmail.com", country: "ID", startDate: "11/12/2023", type: "Contract", position: "UX Researcher", status: "Active" },
        { name: "Dianne Russell", email: "dianne@gmail.com", country: "US", startDate: "10/08/2022", type: "Full-time", position: "UX Designer", status: "Active" },
        { name: "Anette Black", email: "anette@gmail.com", country: "UK", startDate: "10/08/2022", type: "Full-time", position: "Project Manager", status: "Active" },
        // 更多员工数据
    ];

    const [visible, setVisible] = useState(false);

    const toggleVisibility = () => {
        setVisible(!visible);
    };

    return (
        <div className={styles.container}>
            <h1>NYC Work Team Management</h1>
            <div className={styles.feature}>
                <button className={styles.actionButton} onClick={toggleVisibility}>View team member</button>
                <p>Users can view team members</p>
            </div>
            {visible && (
                <table className={styles.teamTable}>
                    <thead>
                        <tr>
                            <th>Person</th>
                            <th>Email</th>
                            <th>Country</th>
                            <th>Start Date</th>
                            <th>Type</th>
                            <th>Job Title</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers.map(member => (
                            <tr key={member.email}>
                                <td>{member.name}</td>
                                <td>{member.email}</td>
                                <td>{member.country}</td>
                                <td>{member.startDate}</td>
                                <td>{member.type}</td>
                                <td>{member.position}</td>
                                <td>{member.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default WorkTeamManagement;