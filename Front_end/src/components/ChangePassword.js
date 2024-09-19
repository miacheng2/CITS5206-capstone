import React, { useState } from 'react';
import axios from 'axios';
import styles from './styles/ChangePassword.module.css';

function ChangePassword() {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
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
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear the form
            }
        } catch (error) {
            setPasswordErrorMessage("Failed to change password. Please check your current password and try again.");
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className={styles.container}>
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
    );
}

export default ChangePassword;
