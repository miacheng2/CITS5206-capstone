import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import style from './styles/Login.module.css'

function Login({ setToken, setUserProfile }) {  // Pass a function to update user profile in the parent component
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    const login = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/token-auth/', { username, password });
            const token = response.data.token;
            setToken(token);
            localStorage.setItem('token', token);
            setErrorMessage('');

            // Fetch user profile immediately after login and update parent state
             fetchUserProfile(username);
             navigate('/');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage('Username/Password incorrect');
            } else {
                setErrorMessage('Login error');
            }
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    const fetchUserProfile = (username) => {
        axios.get(`http://localhost:8000/api/get-profile/?username=${username}`)
            .then(response => {
                setUserProfile({
                    username: response.data.username,
                    email: response.data.email
                });
            })
            .catch(error => {
                console.error('Error fetching profile:', error.response ? error.response.data : error.message);
            });
    };
    

    const register = () => {
        axios.post('http://localhost:8000/api/register/', {
            username,
            password
        }).then(response => {
            login();
        }).catch(error => {
            if (error.response && error.response.status === 400) {
                setErrorMessage('Registration failed: ' + error.response.data.message);
            } else {
                setErrorMessage('Registration error');
            }
            console.error('Error:', error.response ? error.response.data : error.message);
        });
    };

    return (
        <div className={style.login_container}>
            <div className={style.login_form}>
                <img src="/pic/NYC.jpg" alt="Nedlands Yacht Club Logo" />
                <h2>Nedlands Yacht Club System</h2>
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
                {!isRegistering ? (
                    <>
                        <button onClick={login}>Login</button>
                        <p onClick={() => setIsRegistering(true)} className={style.switch_mode}>
                            Don't have an account? Register here
                        </p>
                    </>
                ) : (
                    <>
                        <button onClick={register}>Register</button>
                        <p onClick={() => setIsRegistering(false)} className={style.switch_mode}>
                            Already have an account? Login here
                        </p>
                    </>
                )}
                {errorMessage && <p className={style.error_message}>{errorMessage}</p>}
            </div>
        </div>
    );
}

export default Login;
