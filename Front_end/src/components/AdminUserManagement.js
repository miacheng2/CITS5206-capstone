import React, { useState } from 'react';
import styles from './styles/AdminUserManagement.module.css';

const AdminUserManagement = () => {
    const [user, setUser] = useState({
        username: '',
        password: '',
        profileInfo: ''
    });
    const [actionType, setActionType] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleActionClick = (type) => {
        setActionType(type);
        // Reset user state when action changes
        setUser({ username: '', password: '', profileInfo: '' });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        alert(`Action: ${actionType}\nUser: ${JSON.stringify(user, null, 2)}`);
        // Here you would instead handle the action with a backend API
    };

    return (
        <div className={styles.container}>
            <h2>Admin User Management</h2>
            <div className={styles.feature}>
                <h2>Create or Edit User</h2>
                <button className={styles.button} onClick={() => handleActionClick('create or edit')}>
                    {actionType === 'create or edit' ? 'Cancel' : 'Admin creates or edits users'}
                </button>
            </div>
            {actionType === 'create or edit' && (
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
                        name="profileInfo"
                        type="text"
                        placeholder="Profile Information"
                        value={user.profileInfo}
                        onChange={handleInputChange}
                    />
                    <button type="submit">Submit</button>
                </form>
            )}
            <div className={styles.feature}>
                <h2>Edit Profile</h2>
                <button className={styles.button} onClick={() => handleActionClick('edit profile')}>
                    {actionType === 'edit profile' ? 'Cancel' : 'Edit  Profile'}
                </button>
            </div>
            <div className={styles.feature}>
                <h2>Change Password</h2>
                <button className={styles.button} onClick={() => handleActionClick('change password')}>
                    {actionType === 'change password' ? 'Cancel' : 'Change Password'}
                </button>
            </div>
        </div>
    );
};

export default AdminUserManagement;