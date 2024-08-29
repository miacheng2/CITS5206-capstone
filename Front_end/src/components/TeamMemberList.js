import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import styles from './styles/Membermanagement.module.css';
import Papa from 'papaparse';

const membershipCategories = [
    'Senior sailing membership',
    'Senior crew membership',
    'Junior sailing membership',
    'Family membership',
    'Non sailing membership',
    'Provisional Membership',
    'Pensioner/Student',
];

function TeamMemberList() {
    const [members, setMembers] = useState([]);
    const [currentMember, setCurrentMember] = useState({ id: null, name: '', email: '', membershipCategory: '' });
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fileInputRef = useRef(null); // 创建引用

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await api.get('team-members/');
            setMembers(response.data);
        } catch (error) {
            console.error("Error fetching the team members:", error);
            setError('Failed to fetch team members');
        }
    };

    const handleMemberChange = (event) => {
        const { name, value } = event.target;
        setCurrentMember(prevMember => ({
            ...prevMember,
            [name]: value
        }));
    };

    const createOrUpdateMember = async () => {
        if (editMode) {
            try {
                const response = await api.put(`team-members/${currentMember.id}/`, currentMember);
                const updatedMembers = members.map(member => member.id === currentMember.id ? response.data : member);
                setMembers(updatedMembers);
                setMessage('Member updated successfully');
            } catch (error) {
                console.error('Error updating member:', error);
                setError('Failed to update member');
            }
        } else {
            try {
                const response = await api.post('team-members/', currentMember);
                setMembers([...members, response.data]);
                setMessage('Member created successfully');
            } catch (error) {
                console.error('Error creating member:', error);
                setError('Failed to create member');
            }
        }
        resetForm();
    };

    const deleteMember = async (id) => {
        try {
            await api.delete(`team-members/${id}/`);
            setMembers(members.filter(member => member.id !== id));
            setMessage('Member deleted successfully');
        } catch (error) {
            console.error('Error deleting member:', error);
            setError('Failed to delete member');
        }
    };

    const editMember = (member) => {
        setEditMode(true);
        setCurrentMember({ ...member });
    };

    const viewMember = (member) => {
        alert(`Name: ${member.name}\nEmail: ${member.email}\nCategory: ${member.membershipCategory}`);
    };

    const resetForm = () => {
        setCurrentMember({ id: null, name: '', email: '', membershipCategory: '' });
        setEditMode(false);
        setError('');
        setMessage('');
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: true,
            complete: function (results) {
                results.data.forEach(member => {
                    api.post('team-members/', member).then(response => {
                        setMembers(prevMembers => [...prevMembers, response.data]);
                    }).catch(error => {
                        console.error('Error importing member:', error);
                        setError('Failed to import members');
                    });
                });
            }
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current.click(); 
    };

    return (
        <div className={styles.teamMemberList}>
            <h1>NYC Member Management</h1>
            <ul>
                {members.map(member => (
                    <li key={member.id}>
                        {member.name} ({member.email}) - {member.membershipCategory}
                        <button onClick={() => editMember(member)}>Edit</button>
                        <button onClick={() => deleteMember(member.id)}>Delete</button>
                        <button onClick={() => viewMember(member)}>View</button>
                    </li>
                ))}
            </ul>
            <div className={styles.form}>
                <h2>{editMode ? 'Edit' : 'Create'} Team Member</h2>
                <input name="name" type="text" placeholder="Name" value={currentMember.name} onChange={handleMemberChange} />
                <input name="email" type="email" placeholder="Email" value={currentMember.email} onChange={handleMemberChange} />
                <input name="membershipCategory" type="text" placeholder="Membership Category" value={currentMember.membershipCategory} onChange={handleMemberChange} />
                <button onClick={createOrUpdateMember}>{editMode ? 'Update' : 'Create'}</button>
                <input id="csvUpload" type="file" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} />
                <button className={styles.csvUploadBtn} onClick={handleUploadClick}>Upload CSV</button>
                {message && <p className={styles.message + ' ' + (error ? styles.error : styles.success)}>{message || error}</p>}
                {editMode && <button onClick={resetForm}>Cancel Edit</button>}
            </div>
        </div>
    );
}

export default TeamMemberList;