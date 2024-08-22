import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/AdminUserManagement.module.css';

const EditUserProfile = () => {
    const [user, setUser] = useState({
        username: '',
        email: ''
    });
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
                email: response.data.email,
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

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.put('http://localhost:8000/api/update-profile/', {
                username: user.username,
                email: user.email
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
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileSubmit} className={styles.form}>
                <input
                    name="username"
                    type="text"
                    placeholder="Username"
                    value={user.username}
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
                <button type="submit">Update Profile</button>
            </form>
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        </div>
    );
};

export default EditUserProfile;
