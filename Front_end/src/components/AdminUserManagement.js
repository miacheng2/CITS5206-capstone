import React from 'react';
import styles from './styles/AdminUserManagement.module.css';

const AdminUserManagement = () => {
    const handleActionClick = (message) => {
        alert(message);
    };

    return (
        <div className={styles.container}>
            <h2>Admin User Management</h2>
            <div className={styles.feature}>
                <h2>Create</h2>
                <button className={styles.button} onClick={() => handleActionClick('Admin creates users')}>
                    Admin creates users
                </button>
            </div>
            <div className={styles.feature}>
                <h2>Edit Profile</h2>
                <button className={styles.button} onClick={() => handleActionClick('User edits their profile')}>
                    Edits profile
                </button>
            </div>
            <div className={styles.feature}>
                <h2>Change Password</h2>
                <button className={styles.button} onClick={() => handleActionClick('User changes their password')}>
                    User changes their password
                </button>
            </div>
        </div>
    );
};

export default AdminUserManagement;