import React, { useState } from 'react';
import api from '../api';

function CreateLeader() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [membershipCategory, setMembershipCategory] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const membershipCategories = [
        'Senior sailing membership',
        'Senior crew membership',
        'Junior sailing membership',
        'Family membership',
        'Non sailing membership',
        'Provisional Membership',
        'Pensioner/Student',
    ];

    const createLeader = () => {
        setMessage('');
        setError('');
        api.post('team-members/', {
            username,
            password,
            email,
            name,
            membership_category: membershipCategory
        }).then(response => {
            setMessage('Team leader account created successfully');
            setUsername('');
            setPassword('');
            setEmail('');
            setName('');
            setMembershipCategory('');
        }).catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
            setError('There was an error creating the team leader account');
        });
    };

    return (
        <div>
            <h2>Create Team Leader Account</h2>
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
            <select 
                value={membershipCategory} 
                onChange={(e) => setMembershipCategory(e.target.value)}>
                <option value="">Select Membership Category</option>
                {membershipCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>
            <button onClick={createLeader}>Create Account</button>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default CreateLeader;
