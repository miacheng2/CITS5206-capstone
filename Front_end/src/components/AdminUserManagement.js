import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/AdminUserManagement.module.css';

const AdminUserManagement = () => {
    const [user, setUser] = useState({
        username: '',
        email: ''
    });
    const [currentUser, setCurrentUser] = useState('');
    const [adminCount, setAdminCount] = useState(0);
    const [teamLeaderCount, setTeamLeaderCount] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    // State for creating new users
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        role: 'admin',
    });
    const [createSuccessMessage, setCreateSuccessMessage] = useState('');
    const [createErrorMessage, setCreateErrorMessage] = useState('');
    const [admins, setAdmins] = useState([]); // State for admin list
    const [searchQuery, setSearchQuery] = useState(""); // State for search input
    const [loading, setLoading] = useState(true); // Loading state


    const fetchAdminList = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get('http://localhost:8000/api/admin-list/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAdmins(response.data); // Assuming response.data contains the list of admins
            setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
            console.error('Error fetching admin list:', error);
            setLoading(false); // Set loading to false in case of error
        }
    };

    // Fetch the list when the component mounts
    useEffect(() => {
        fetchAdminList();
    }, []);

    useEffect(() => {
        fetchCurrentUser();
        fetchUserCounts();
        // fetchRecentActivities();  // Disable or comment out this function for now
    }, []);

    // Filter admins based on search query or show all if searchQuery is empty
    const filteredAdmins = admins.filter(admin =>
        (admin.username?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (admin.user_type?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );


    // Fetch logged-in user profile
    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage

            if (!token) {
                setErrorMessage('No token found. Please log in again.');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/get-profile/', {
                headers: {
                    Authorization: `Bearer ${token}`,  // Add the token to the Authorization header
                },
            });

            console.log('Profile Response:', response.data);  // Log the response to check if avatar is included

            setCurrentUser(response.data.username);
            setUser({
                username: response.data.username,
                email: response.data.email,
                avatar: response.data.avatar  // Make sure avatar is being set
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error.response ? error.response.data : error.message);
            setErrorMessage('Failed to load profile information.');
        }
    };



    // Fetch admin and team leader counts
    const fetchUserCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get('http://localhost:8000/api/user-counts/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAdminCount(response.data.admin_count);
            setTeamLeaderCount(response.data.team_leader_count);
        } catch (error) {
            console.error('Error fetching user counts:', error);
        }
    };



    // Handle profile update
    // Handle profile update
    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('Token not found. Please log in again.');
                return;
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('new_username', user.username);
            formData.append('email', user.email);
            if (user.avatar) {
                formData.append('avatar', user.avatar);  // Append avatar file if selected
            }

            const response = await axios.put('http://localhost:8000/api/update-profile/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'  // Set content type to handle files
                },
            });

            setSuccessMessage('Profile updated successfully');
            setErrorMessage('');

            // Update avatar in the state with the new avatar URL from response
            if (response.data.avatar) {
                setUser((prev) => ({ ...prev, avatar: response.data.avatar }));  // Update avatar in the state
            }
        } catch (error) {
            setErrorMessage('Failed to update profile. Please try again.');
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };


    // Handle input change to capture avatar
    const handleProfileInputChange = (event) => {
        const { name, value, files } = event.target;
        if (name === 'avatar') {
            setUser(prev => ({ ...prev, avatar: files[0] }));  // Store the file in the state
        } else {
            setUser(prev => ({ ...prev, [name]: value }));
        }
    };




    // Handle new user input changes
    const handleNewUserInputChange = (event) => {
        const { name, value } = event.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    // Handle creating new users
    const handleNewUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/register/', {
                username: newUser.username,
                password: newUser.password,
                email: newUser.email,
                user_type: newUser.role,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 201) {
                setCreateSuccessMessage(`${newUser.role === 'admin' ? 'Admin' : 'Team leader'} user created successfully!`);
                setCreateErrorMessage('');
                setNewUser({ username: '', password: '', email: '', role: 'admin' });

                // Update the counts
                if (newUser.role === 'admin') setAdminCount(adminCount + 1);
                if (newUser.role === 'team_leader') setTeamLeaderCount(teamLeaderCount + 1);
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
            {/* Greeting with logged-in user */}
            <header className={styles.header}>
                <h1>Hello, {currentUser}!</h1>
                {user.avatar && typeof user.avatar === 'string' ? (
                    <img src={`http://localhost:8000${user.avatar.replace(/\\/g, '/')}`} alt="User Avatar" className={styles.avatar} />
                ) : (
                    <p>No Avatar Available</p>  // Fallback content if there's no avatar
                )}


                <p>Welcome to the Admin User Management Dashboard</p>
            </header>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search Admins or Team Leaders"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
            />

            {searchQuery && (
                <div className={styles.adminList}>
                    {filteredAdmins.length > 0 ? (
                        filteredAdmins.map(admin => (
                            <div key={admin.id} className={`${styles.adminItem} ${styles[admin.role]}`}>
                                <p><strong>Username:</strong> {admin.username}</p>
                                <p><strong>Email:</strong> {admin.email}</p>
                                <p><strong>Role:</strong> {admin.user_type ? admin.user_type : "Role not available"}</p>

                            </div>
                        ))
                    ) : (
                        <p>No admins or team leaders found</p>
                    )}
                </div>
            )}
            {/* Admin/Team Leader Statistics */}
            <section className={styles.statsSection}>
                <div className={styles.statItem}>
                    <h3>Total Admins</h3>
                    <p>{adminCount}</p>
                </div>
                <div className={styles.statItem}>
                    <h3>Total Team Leaders</h3>
                    <p>{teamLeaderCount}</p>
                </div>
            </section>

            {/* Profile Update Section */}
            <div className={styles.feature}>
                <h2>Edit Your Profile</h2>
                <form onSubmit={handleProfileSubmit} className={styles.form}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={user.username}
                        onChange={handleProfileInputChange}
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={user.email}
                        onChange={handleProfileInputChange}
                        required
                    />
                    <input
                        name="avatar"
                        type="file"
                        accept="image/*"  // Accept only image files
                        onChange={handleProfileInputChange}  // Handle avatar input
                    />
                    <button type="submit" className={styles.createButton}>Update Profile</button>
                </form>
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            </div>

            {/* Create New Admin or Team Leader */}
            <div className={styles.feature}>
                <h2>Create Admin or Team Leader</h2>
                <form onSubmit={handleNewUserSubmit} className={styles.form}>
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={newUser.username}
                        onChange={handleNewUserInputChange}
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={handleNewUserInputChange}
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={handleNewUserInputChange}
                        required
                    />
                    <select
                        name="role"
                        value={newUser.role}
                        onChange={handleNewUserInputChange}
                        required
                    >
                        <option value="admin">Create Admin User</option>
                        <option value="team_leader">Create Team Leader</option>
                    </select>
                    <button type="submit" className={styles.createButton}>Create User</button>
                </form>

                {createSuccessMessage && <p className={styles.successMessage}>{createSuccessMessage}</p>}
                {createErrorMessage && <p className={styles.errorMessage}>{createErrorMessage}</p>}
            </div>
        </div>
    );
};

export default AdminUserManagement;
