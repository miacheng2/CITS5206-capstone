import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/AdminUserManagement.module.css';

const AdminUserManagement = ({ userProfile }) => {
    const [createUser, setCreateUser] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [promoteLeader, setPromoteLeader] = useState({
        username: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [createSuccessMessage, setCreateSuccessMessage] = useState('');
    const [createErrorMessage, setCreateErrorMessage] = useState('');
    const [editSuccessMessage, setEditSuccessMessage] = useState('');
    const [editErrorMessage, setEditErrorMessage] = useState('');
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    useEffect(() => {
        if (promoteLeader.username || promoteLeader.email) {
            setEditErrorMessage('');
        }
    }, [promoteLeader]);

    // const fetchProfile = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:8000/api/get-profile/');
    //         setEditErrorMessage('');
    //     } catch (error) {
    //         console.error('Failed to fetch profile:', error.response ? error.response.data : error.message);
    //         setEditErrorMessage('Failed to load profile information.');
    //     }
    // };

    const handleCreateInputChange = (event) => {
        const { name, value } = event.target;
        setCreateUser(prev => ({ ...prev, [name]: value }));
    };

    const handlePromoteLeaderChange = (event) => {
        const { name, value } = event.target;
        setPromoteLeader(prev => ({ ...prev, [name]: value }));
    };
    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/create-admin/', {
                username: createUser.username,
                password: createUser.password,
                email: createUser.email,
            });

            if (response.status === 201) {
                setCreateSuccessMessage('Admin user created successfully!');
                setCreateErrorMessage('');
                setCreateUser({ username: '', password: '', email: '' }); // Clear form fields
            }
        } catch (error) {
            setCreateSuccessMessage('');
            setCreateErrorMessage('Failed to create admin user. Please try again.');
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    const handlePromoteLeaderSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/promote-leader/', promoteLeader);
            setEditSuccessMessage(response.data.message);
            setEditErrorMessage('');
        } catch (error) {
            setEditErrorMessage(error.response.data.error || 'An error occurred');
            setEditSuccessMessage('');
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordErrorMessage('New password and confirm password do not match.');
            return;
        }

        try {
            const response = await axios.put('http://localhost:8000/api/change-password/', {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                setPasswordSuccessMessage("Password changed successfully.");
                setPasswordErrorMessage('');
            }
        } catch (error) {
            setPasswordErrorMessage("Failed to change password. Please check your current password and try again.");
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Admin Management</h2>

            <div className={styles.feature}>
                <h2>Create Admin User</h2>
                <form onSubmit={handleCreateSubmit} className={styles.form}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={createUser.username}
                        onChange={handleCreateInputChange}
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={createUser.password}
                        onChange={handleCreateInputChange}
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={createUser.email}
                        onChange={handleCreateInputChange}
                        required
                    />
                    <button type="submit">Create Admin</button>
                </form>
                {createSuccessMessage && <p className={styles.successMessage}>{createSuccessMessage}</p>}
                {createErrorMessage && <p className={styles.errorMessage}>{createErrorMessage}</p>}
            </div>

            {/* PromoteLeader Section */}
            <div className={styles.feature}>
                <h2>Promote Leader</h2>
                <form onSubmit={handlePromoteLeaderSubmit} className={styles.form}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={promoteLeader.username}
                        onChange={handlePromoteLeaderChange}
                    />
                    <p>Or</p>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={promoteLeader.email}
                        onChange={handlePromoteLeaderChange}
                    />
                    <button type="submit">Promote Team Leader</button>
                </form>
                {editSuccessMessage && <p className={styles.successMessage}>{editSuccessMessage}</p>}
                {editErrorMessage && <p className={styles.errorMessage}>{editErrorMessage}</p>}
            </div>

            {/* Change Password Section */}
            <div className={styles.feature}>
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className={styles.form}>
                    <input
                        name="currentPassword"
                        type="password"
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                    />
                    <input
                        name="newPassword"
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                    />
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                    />
                    <button type="submit">Change Password</button>
                </form>
                {passwordSuccessMessage && <p className={styles.successMessage}>{passwordSuccessMessage}</p>}
                {passwordErrorMessage && <p className={styles.errorMessage}>{passwordErrorMessage}</p>}
            </div>
        </div>
    );
};

export default AdminUserManagement;
