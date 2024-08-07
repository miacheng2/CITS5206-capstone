import React, { useEffect, useState } from 'react';
import api from '../api';

function TeamMemberList() {
    const [members, setMembers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [membershipCategory, setMembershipCategory] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = () => {
        api.get('team-members/')
            .then(response => {
                setMembers(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the team members!", error);
            });
    };

    const addMember = () => {
        setMessage('');
        setError('');
        api.post('team-members/', {
            name,
            email,
            membership_category: membershipCategory
        })
        .then(response => {
            setMembers([...members, response.data]);
            setName('');
            setEmail('');
            setMembershipCategory('');
            setMessage('Team member added successfully');
        })
        .catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
            setError('There was an error adding the team member');
        });
    };

    const deleteMember = (id) => {
        api.delete(`team-members/${id}/`)
        .then(response => {
            setMembers(members.filter(member => member.id !== id));
            setMessage('Team member deleted successfully');
        })
        .catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
            setError('There was an error deleting the team member');
        });
    };

    return (
        <div>
            <h1>Team Members</h1>
            <ul>
                {members.map(member => (
                    <li key={member.id}>
                        {member.name} ({member.email}) - {member.membership_category}
                        <button onClick={() => deleteMember(member.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <div>
                <h2>Add Team Member</h2>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" placeholder="Membership Category" value={membershipCategory} onChange={(e) => setMembershipCategory(e.target.value)} />
                <button onClick={addMember}>Add</button>
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
}

export default TeamMemberList;
