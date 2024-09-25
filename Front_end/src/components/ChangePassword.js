import React, { useState } from 'react';
import api from '../api';

function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const changePassword = () => {
        setMessage('');
        setError('');
        api.put('change-password/', { old_password: oldPassword, new_password: newPassword })
            .then(response => {
                setMessage('Password changed successfully');
                setOldPassword('');
                setNewPassword('');
            })
            .catch(error => {
                console.error('Error changing password:', error.response ? error.response.data : error.message);
                setError('There was an error changing the password');
            });
    };

    return (
        <div>
            <h2>Change Password</h2>
            <input 
                type="password" 
                placeholder="Old Password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
            />
            <button onClick={changePassword}>Change Password</button>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ChangePassword;
