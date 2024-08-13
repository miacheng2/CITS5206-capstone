import React, { useState, useEffect } from 'react';
import api from '../api';

function EditProfile() {
    const [profile, setProfile] = useState({ name: '', email: '', membership_category: '' });
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

    useEffect(() => {
        api.get('team-members/')
            .then(response => {
                setProfile(response.data[0]); // Assuming the first team member is the logged-in user
            })
            .catch(error => {
                console.error('Error fetching profile:', error);
                setError('There was an error fetching the profile');
            });
    }, []);

    const updateProfile = () => {
        setMessage('');
        setError('');
        api.put('update-profile/', profile)
            .then(response => {
                setMessage('Profile updated successfully');
            })
            .catch(error => {
                console.error('Error updating profile:', error.response ? error.response.data : error.message);
                setError('There was an error updating the profile');
            });
    };

    return (
        <div>
            <h2>Edit Profile</h2>
            <input 
                type="text" 
                placeholder="Name" 
                value={profile.name} 
                onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
            />
            <input 
                type="email" 
                placeholder="Email" 
                value={profile.email} 
                onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
            />
            <select 
                value={profile.membership_category} 
                onChange={(e) => setProfile({ ...profile, membership_category: e.target.value })}>
                <option value="">Select Membership Category</option>
                {membershipCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>
            <button onClick={updateProfile}>Update Profile</button>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default EditProfile;
