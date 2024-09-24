import React, { useState } from 'react';
import axios from 'axios';
import styles from './styles/AdminUserManagement.module.css';

const AdminUserManagement = () => {
    const [user, setUser] = useState({
        username: '',
        password: '',
        email: '',
        role: 'admin'
    });

    const [createSuccessMessage, setCreateSuccessMessage] = useState('');
    const [createErrorMessage, setCreateErrorMessage] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/register/', {
                username: user.username,
                password: user.password,
                email: user.email,
                user_type: user.role,  // Use the role selected (either 'admin' or 'team_leader')
            });

            if (response.status === 201) {
                setCreateSuccessMessage(`${user.role === 'admin' ? 'Admin' : 'Team leader'} user created successfully!`);
                setCreateErrorMessage('');
                setUser({ username: '', password: '', email: '', role: 'admin' }); // Clear form fields
            }
        } catch (error) {
            setCreateSuccessMessage('');
            const errorMsg = error.response?.data.detail || 'Failed to create user. Please try again.';
            setCreateErrorMessage(`Error: ${errorMsg}`);
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className={styles.container}>

            <div className={styles.feature}>
                <h2>Create Admin or Team Leader</h2>
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
                    <select
                        name="role"
                        value={user.role}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="admin">Create Admin User</option>
                        <option value="team_leader">Create Team Leader</option>
                    </select>
                    <button type="submit">Create User</button>
                </form>
                {createSuccessMessage && <p className={styles.successMessage}>{createSuccessMessage}</p>}
                {createErrorMessage && <p className={styles.errorMessage}>{createErrorMessage}</p>}
            </div>
        </div>
    );
};

export default AdminUserManagement;
