import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/AdminUserManagement.module.css';

const AdminUserManagement = () => {
    const [user, setUser] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [profile, setProfile] = useState({  // 初始化 profile 状态
        name: '',
        email: ''
    });
    const [actionType, setActionType] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/get-profile/');
            setUser({
                username: response.data.username,
                email: response.data.email
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error.response ? error.response.data : error.message);
            setErrorMessage('Failed to load profile information.');
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };
    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };


    const handleActionClick = (type) => {
        setActionType(type);
        setUser({ username: '', password: '', email: '' });
        setProfile({ name: '', email: '' });
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/create-admin/', {
                username: user.username,
                password: user.password,
                email: user.email,
            });

            setSuccessMessage(`Admin account created successfully for ${response.data.username}`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to create admin account. Please try again.');
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.put('http://localhost:8000/api/update-profile/', {
                username: profile.name,
                emal: profile.email,
            });

            setSuccessMessage('Profile updated successfully');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to update profile. Please try again.');
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Admin Management</h2>
            <div className={styles.feature}>
                <h2>Create Admin User</h2>
                <button className={styles.button} onClick={() => handleActionClick('create')}>
                    {actionType === 'create' ? 'Cancel' : 'Admin creates users'}
                </button>
            </div>
            {actionType === 'create' && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={user.username}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={user.password}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={user.email}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">Submit</button>
                </form>
            )}
            <div className={styles.feature}>
                <h2>Edit Profile</h2>
                <form onSubmit={handleProfileSubmit} className={styles.form}>
                    <input
                        name="name"
                        type="text"
                        placeholder="Name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        required
                    />
                    <button type="submit">Update Profile</button>
                </form>
            </div>
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        </div>
    );
};

export default AdminUserManagement;
