import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = () => {
        axios.post('http://localhost:8000/api/token-auth/', {
            username,
            password
        }).then(response => {
            const token = response.data.token;
            setToken(token);
            localStorage.setItem('token', token);
        }).catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
        });
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
        </div>
         login TextDecoderStream();
    );
}

export default Login;

