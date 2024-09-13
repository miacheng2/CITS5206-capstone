// login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import style from './styles/Login.module.css';

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const login = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/login/', { username, password });
            const token = response.data.access;
            if (token) {
                setToken(token);
                localStorage.setItem('token', token);
                console.log('Login successful, token:', token);
                navigate('/');
            } else {
                setErrorMessage('Token not found in response');
                console.error('Token not found in response:', response.data);
            }
        } catch (error) {
            setErrorMessage('Invalid credentials');
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };



    return (
        <div className={style.login_container}>
            <div className={style.login_form}>
                <img src="/pic/NYC.jpg" alt="Nedlands Yacht Club Logo" /> 
                
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
                <button onClick={login}>Login</button>
                {errorMessage && <p className={style.error_message}>{errorMessage}</p>}
                <Link to="/register" className={style.registerLink}>Don't have an account? Register here</Link>
            </div>
        </div>
    );
}

export default Login;
