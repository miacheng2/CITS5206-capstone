import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import style from './styles/Register.module.css';

function Register({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState(''); 
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const register = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/register/', {
                username,
                password,
                email,
                user_type: userType,  
            });
            const token = response.data.token;
            setToken(token);
            localStorage.setItem('token', token);

            alert('Registration successful! You will be redirected to the home page.');

         
            setTimeout(() => {
                navigate('/');
            }, 2000);
            
            setErrorMessage(''); 
        } catch (error) {
            setErrorMessage('Registration failed: ' + (error.response?.data.detail || 'Unknown Error'));
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className={style.register_container}>
            <div className={style.register_form}>
                <h2>Register</h2>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
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
                <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="">Select user type</option>
                    <option value="admin">Admin</option>
                    <option value="team_leader">Team Leader</option>
                </select>
                <button onClick={register}>Register</button>
                {errorMessage && <p className={style.error_message}>{errorMessage}</p>}
                <Link to="/login" className={style.loginLink}>Already have an account? Login here</Link>
            </div>
        </div>
    );
}

export default Register;
