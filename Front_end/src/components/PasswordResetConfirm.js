import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PasswordResetConfirm.css';

function PasswordResetConfirm() {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const { uidb64, token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/password-reset-confirm/${uidb64}/${token}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ new_password: newPassword }),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage('Password reset successfully! You can now log in with your new password.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setMessage(`Error: ${result.detail}`);
            }
        } catch (error) {
            setMessage('An error occurred while resetting the password.');
        }
    };

    return (
        <div className="password-reset-container">
            <h2>Reset Your Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default PasswordResetConfirm;
