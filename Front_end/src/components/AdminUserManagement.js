import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles/AdminUserManagement.module.css';
import api from '../api';
import Calendar from 'react-calendar';  // Import the calendar component
import 'react-calendar/dist/Calendar.css';  // Import the calendar CSS

const AdminUserManagement = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
    });
    const [currentUser, setCurrentUser] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        role: 'admin',
    });
    const [createSuccessMessage, setCreateSuccessMessage] = useState('');
    const [createErrorMessage, setCreateErrorMessage] = useState('');
    const [admins, setAdmins] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [weather, setWeather] = useState({ temp: '', description: '', icon: '' });
    const [locationError, setLocationError] = useState(null);
    const [currentTime, setCurrentTime] = useState('');
    const [timeOfDay, setTimeOfDay] = useState('');
    const [events, setEvents] = useState([]); // Initialize as an empty
    const [teamLeaders, setTeamLeaders] = useState([]);
    const [showAdmins, setShowAdmins] = useState(false);
    const [showTeamLeaders, setShowTeamLeaders] = useState(false);
    const [forecast, setForecast] = useState([]);
    const navigate = useNavigate(); // For navigation
    const hasAlerted = useRef(false); // Prevent multiple alerts
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState(""); // Modal message state
    const [isModalOpen, setModalOpen] = useState(false); // Modal visibility state

// Function to close the modal
    const handleCloseModal = () => {
        setModalOpen(false);
        navigate("/Home");
    };


    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const userRole = localStorage.getItem('user_role');
                const token = localStorage.getItem("token");

                // Check if the token exists
                if (!token) {
                    console.error("No token found, redirecting to login.");
                    navigate("/login");
                    return;
                }

                // Check if the user is not an admin
                if (userRole !== "admin" ) {
                    setModalMessage("Access denied: This section is for admin users only.");
                    setModalOpen(true);
                    return;
                  }

                fetchAdminList();
                fetchTeamLeaderList();
                fetchCurrentUser();

            } catch (error) {
                console.error("Error during permissions check!", error);
            }
        };

        checkPermissions(); // Call the permission check function on mount
    }, [navigate]); // Re-run if navigate changes

    const formatTime = useCallback((date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const timeOfDay = getTimeOfDay(hours);

        hours = hours % 12 || 12;
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        const strSeconds = seconds < 10 ? '0' + seconds : seconds;

        return {
            formattedTime: `${hours}:${strMinutes}:${strSeconds} ${ampm}`,
            timeOfDay: timeOfDay
        };
    }, []);

    const fetchWeatherAndForecast = useCallback(async (lat, lon) => {
        const apiKey = '1383a45cfb4f178ede34928341f3add4';  // Replace with API key
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        try {
            // Fetch current weather
            const weatherResponse = await axios.get(currentWeatherUrl);
            const { main, weather } = weatherResponse.data;
            setWeather({
                temp: main.temp,
                description: weather[0].description,
                icon: weather[0].icon,
            });

            // Fetch forecast data
            const forecastResponse = await axios.get(forecastUrl);
            const forecastData = forecastResponse.data.list;

            // Process the forecast data to get the main forecast for the next 3 days
            const dailyForecast = forecastData.filter((entry) => {
                const date = new Date(entry.dt_txt);
                return date.getHours() === 12;  // Get the forecast at noon for each day
            }).slice(1, 7);  // Get only the next 3 days

            setForecast(dailyForecast.map((entry) => ({
                day: new Date(entry.dt_txt).toLocaleDateString('en-US', { weekday: 'long' }),
                temp: Math.round(entry.main.temp),
                description: entry.weather[0].description,
                icon: entry.weather[0].icon,
            })));
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }, []);

    const handleDeleteUser = async (id, userType) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this ${userType}?`);
        if (!confirmDelete) return;

        setLoading(true); // Start loading
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:8000/api/delete-user/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                alert(`${userType} deleted successfully`);
                window.location.reload(); // Reload the page to refresh the user list
            } else {
                alert(`Failed to delete ${userType}. Please try again.`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(`This 'admin' username cannot be deleted.`);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Function to format time in 12-hour format with AM/PM
    const getTimeOfDay = (hours) => {
        if (hours >= 5 && hours < 12) {
            return "Good Morning";
        } else if (hours >= 12 && hours < 17) {
            return "Good Afternoon";
        } else if (hours >= 17 && hours < 21) {
            return "Good Evening";
        } else {
            return "Good Night";
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const { formattedTime, timeOfDay } = formatTime(now);
            setCurrentTime(formattedTime);
            setTimeOfDay(timeOfDay);
        }, 1000);
        return () => clearInterval(interval);
    }, [formatTime]);

    const getLocationAndFetchWeather = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => {
                    fetchWeatherAndForecast(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationError('Unable to retrieve your location. Please enable location services.');
                }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser.');
        }
    }, [fetchWeatherAndForecast]);

    // Fetch Admin list (only admins)
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

            // Filter only the users with role "admin"
            const filteredAdmins = response.data.filter(user => user.user_type === 'admin');
            setAdmins(filteredAdmins);
        } catch (error) {
            console.error('Error fetching admin list:', error);
        }
    };
    useEffect(() => {
        getLocationAndFetchWeather();
    }, [getLocationAndFetchWeather]);

    // Fetch Team Leader list (only team leaders)
    const fetchTeamLeaderList = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get('http://localhost:8000/api/admin-list/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Filter only the users with role "team_leader"
            const filteredTeamLeaders = response.data.filter(user => user.user_type === 'team_leader');
            setTeamLeaders(filteredTeamLeaders);
        } catch (error) {
            console.error('Error fetching team leader list:', error);
        }
    };

    useEffect(() => {
        fetchAdminList();
        fetchTeamLeaderList(); // Fetch team leaders on mount

        fetchCurrentUser();
    }, []);
    const toggleAdminList = () => {
        setShowAdmins(!showAdmins); // Toggle the visibility of the admin list modal
        setShowTeamLeaders(false);  // Hide team leader list when admin list is shown
    };

    const toggleTeamLeaderList = () => {
        setShowTeamLeaders(!showTeamLeaders); // Toggle the visibility of the team leader list modal
        setShowAdmins(false);  // Hide admin list when team leader list is shown
    };

    const closeList = () => {
        setShowAdmins(false);
        setShowTeamLeaders(false);
    };


    const filteredAdmins = admins.filter(admin =>
        admin.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.user_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('No token found. Please log in again.');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/get-profile/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setCurrentUser(response.data.username);
            setUser({
                username: response.data.username,
                email: response.data.email,
                avatar: response.data.avatar,
            });
        } catch (error) {
            setErrorMessage('Failed to load profile information.');
        }
    };



    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('new_username', user.username);
            formData.append('email', user.email);
            if (user.avatar) {
                formData.append('avatar', user.avatar);
            }

            const response = await axios.put('http://localhost:8000/api/update-profile/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccessMessage('Profile updated successfully');
            if (response.data.avatar) {
                setUser((prev) => ({ ...prev, avatar: response.data.avatar }));
            }
        } catch (error) {
            setErrorMessage('Failed to update profile. Please try again.');
        }
    };
    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found");
                    return;
                }

                const response = await api.get("events/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Store all events in the state
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events!", error);
            }
        };

        fetchAllEvents();
    }, []);

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
                setNewUser({ username: '', password: '', email: '', role: 'admin' });

                // Re-fetch the user lists
                fetchAdminList();
                fetchTeamLeaderList();
            }
        } catch (error) {
            setCreateErrorMessage('Failed to create user. Please try again.');
        }
    };
    const filteredUsers = [...admins, ...teamLeaders].filter(
        user => user.username.includes(searchQuery)
    );
    

    return (
    <div className="form-container">
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Image at the top */}
            <span className="modal-close" onClick={handleCloseModal}>
              &times;
            </span>
            <p className="success-message">{modalMessage}</p>
            <button className="modal-button" onClick={handleCloseModal}>
              OK
            </button>
          </div>
        </div>
      )}
    {!isModalOpen && (
        <div className={styles.container}>
            <div className={styles.blob}></div>  {/* Ensure this blob div is added */}

            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                </div>
            )}
            <div className={styles.rowContainer}>
                {/* Profile Section */}
                <div className={styles.profileSection}>
                    <header className={styles.header}>
                        <h1>Hello, {currentUser}!</h1>
                        <h4>Welcome to the Admin Management</h4>
                        {user.avatar && typeof user.avatar === 'string' ? (
                            <img src={`http://localhost:8000${user.avatar.replace(/\\/g, '/')}`} alt="User Avatar" className={styles.avatar} />
                        ) : (
                            <p>No Avatar Available</p>
                        )}

                    </header>

                    {/* Profile Update Form */}
                    <div className={styles.feature}>
                        <h2>Edit Your Profile</h2>
                        <form onSubmit={handleProfileSubmit} className={styles.form}>
                            <input
                                name="username"
                                type="text"
                                placeholder="Username"
                                value={user.username}
                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                                required
                            />
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                required
                            />
                            {/* Custom File Input for Avatar */}
                            <div className={styles.fileInputContainer}>
                                <input
                                    id="avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setUser({ ...user, avatar: e.target.files[0] })}
                                    className={styles.hiddenFileInput}
                                />
                                <label htmlFor="avatar" className={styles.customFileButton}>
                                    Choose Your Avatar
                                </label>
                            </div>
                            <button type="submit" className={styles.createButton}>Update Profile</button>
                        </form>
                        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                    </div>




                    {/* Stats Section */}
                    <section className={styles.statsSection}>

                        <div className={styles.statItem}>
                            <h3>Total Admins</h3>
                            <p onClick={toggleAdminList} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                {admins.length}
                            </p>
                        </div>
                        <div className={styles.statItem}>
                            <h3>Total Leaders</h3>
                            <p onClick={toggleTeamLeaderList} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                {teamLeaders.length}
                            </p>
                        </div>
                        {/* Conditionally render the admin list */}
                        {/* Admin List Modal */}
                        {showAdmins && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContent}>
                                    <span className={styles.closeButton} onClick={closeList}>
                                        &times;
                                    </span>
                                    <h3>Admin List:</h3>
                                    <ul>
                                        {admins.map((admin) => (
                                            <li key={admin.id}>
                                                {admin.username} - {admin.email}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {/* Team Leader List Modal */}
                        {showTeamLeaders && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContent}>
                                    <span className={styles.closeButton} onClick={closeList}>
                                        &times;
                                    </span>
                                    <h3>Team Leader List:</h3>
                                    <ul>
                                        {teamLeaders.map((teamLeader) => (
                                            <li key={teamLeader.id}>
                                                {teamLeader.username} - {teamLeader.email}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                    </section>
                </div>




                {/* Main Content */}
                <div className={styles.mainContent}>
                    {/* Search and Admin List */}
                    <div className={styles.feature}>
        <h3>FIND A USER</h3>
        <input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
        />

        {searchQuery && filteredUsers.length > 0 && (
            <div className={styles.adminList}>
                <ul>
                    {filteredUsers.map(user => (
                        <li key={user.id} className={styles.adminItem}>
                            <div className={styles.userDetails}>
                                <div>
                                    <p><strong>Username:</strong> {user.username}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Role:</strong> {user.user_type}</p>
                                </div>
                                <button onClick={() => handleDeleteUser(user.id, user.user_type)} className={styles.deleteButton}>
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Optional: Display a message if no users are found */}
        {searchQuery && filteredUsers.length === 0 && (
            <p>No users found</p>
        )}
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
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                required
                            />
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                            />
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                            <select
                                name="role"
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                
            </div>
            

            {/* <div className={styles.clockSection}>
                        <p>{timeOfDay}</p>
                        <h3>Current Time</h3>
                        <p>{currentTime}</p>

                    </div> */}
            {/* Weather Section */}
            {/* Profile and stats sections remain unchanged */}
            {/* <div className={styles.weatherSection}>
                        <h3>Today's Weather</h3>
                        {locationError ? (
                            <p>{locationError}</p>
                        ) : weather.temp ? (
                            <div className={styles.weatherInfo}>
                                <img
                                    src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                                    alt={weather.description}
                                    className={styles.weatherIcon}
                                />
                                <p>{Math.round(weather.temp)}°C</p>
                                <p>{weather.description}</p>
                            </div>
                        ) : (
                            <p>Loading weather...</p>
                        )}

                    </div>
                    <div className={styles.feature}>
                        <h3>Coming Day Weather Forecast</h3>
                        <ul className={styles.forecastList}>
                            {forecast.map((day, index) => (
                                <li key={index}>
                                    <p><strong>{day.day}:</strong></p>
                                    <img
                                        src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`}
                                        alt={day.description}
                                        className={styles.weatherIcon}
                                    />
                                    <p>{day.temp}°C - {day.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div> */}

            {/* <section className={styles.eventSection}>
                        <h3>All Events</h3>
                        {events.length > 0 ? (
                            <ul className={styles.eventList}>
                                {events
                                    .filter((event) => {
                                        const eventDate = new Date(event.date);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return eventDate >= today; // Only include today's and future events
                                    })
                                    .map((event) => (
                                        <li key={event.id} className={styles.eventItem}>
                                            {event.name} - {new Date(event.date).toLocaleDateString()}
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <p>No events available</p>
                        )}
                    </section> */}
            {/* Calendar Section */}
            {/* <section className={styles.calendarSection}>
                        <div className={styles.calendarItem}>
                            <h3>Calendar</h3>
                            <Calendar className={styles.reactCalendar} />
                        </div>
                    </section> */}
                    
        </div>
        )}
        </div>
    

    );

};

export default AdminUserManagement;