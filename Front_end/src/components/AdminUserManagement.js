import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/AdminUserManagement.module.css';

const AdminUserManagement = ({ userProfile }) => {
    const [createUser, setCreateUser] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [editProfile, setEditProfile] = useState({
        username: userProfile?.username || '',
        new_username: '',
        email: userProfile?.email || ''
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
        if (editProfile.username || editProfile.email) {
            setEditErrorMessage(''); 
        }
    }, [editProfile]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/get-profile/');
            setEditProfile({
                username: response.data.username,
                email: response.data.email
            });
            setEditErrorMessage('');
        } catch (error) {
            console.error('Failed to fetch profile:', error.response ? error.response.data : error.message);
            setEditErrorMessage('Failed to load profile information.');
        }
    };

    const handleCreateInputChange = (event) => {
        const { name, value } = event.target;
        setCreateUser(prev => ({ ...prev, [name]: value }));
    };

    const handleEditProfileChange = (event) => {
        const { name, value } = event.target;
        setEditProfile(prev => ({ ...prev, [name]: value }));
    };
    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/create-admin/', {
                username: createUser.username,
                password: createUser.password,
                email: createUser.email,
            });

            setCreateSuccessMessage(`Admin account created successfully for ${response.data.username}`);
            setCreateErrorMessage('');
        } catch (error) {
            setCreateErrorMessage('Failed to create admin account. Please try again.');
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };

    const handleEditProfileSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.put('http://localhost:8000/api/update-profile/', {
                username: editProfile.username,
                new_username: editProfile.new_username,
                email: editProfile.email,
            });

            setEditSuccessMessage('Profile updated successfully');
            setEditErrorMessage('');
        } catch (error) {
            setEditErrorMessage('Failed to update profile. Please try again.');
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };
    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordErrorMessage('New password and confirm password do not match.');
            return;
        }

        try {
            // /api/change-password/
            const response = await axios.put('http://localhost:8000/api/change-password/', {
                username: userProfile.username,  
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
            });
    
            setPasswordSuccessMessage('Password updated successfully');
            setPasswordErrorMessage('');
        } catch (error) {
            setPasswordErrorMessage('Failed to update password. Please try again.');
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Admin Management</h2>

            {/* Create Admin User Section */}
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

            {/* Edit Profile Section */}
            <div className={styles.feature}>
                <h2>Edit Profile</h2>
                <form onSubmit={handleEditProfileSubmit} className={styles.form}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Current Username"
                        value={editProfile.username}
                        onChange={handleEditProfileChange}
                        disabled
                    />
                    <input
                        name="new_username"
                        type="text"
                        placeholder="New Username"
                        value={editProfile.new_username || ''}
                        onChange={handleEditProfileChange}
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={editProfile.email}
                        onChange={handleEditProfileChange}
                        required
                    />
                    <button type="submit">Update Profile</button>
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
