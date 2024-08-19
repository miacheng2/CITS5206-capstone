import React, { useState } from 'react';
import axios from 'axios';
import style from './styles/Login.module.css'

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);  // 用于切换登录和注册模式

    const login = () => {
        axios.post('http://localhost:8000/api/token-auth/', {
            username,
            password
        }).then(response => {
            const token = response.data.token;
            setToken(token);
            localStorage.setItem('token', token);
            setErrorMessage(''); 
        }).catch(error => {
            if (error.response && error.response.status === 400) {
                setErrorMessage('Username/Password incorrect');
            } else {
                setErrorMessage('Login error');
            }
            console.error('Error:', error.response ? error.response.data : error.message);
        });
    };

    const register = () => {
        axios.post('http://localhost:8000/api/register/', {  // 假设注册的API路径为 /api/register/
            username,
            password
        }).then(response => {
            // 注册成功后直接登录
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
                <img src="/pic/NYC.jpg" alt="Nedlands Yacht Club Logo" /> {/* 添加 Logo 图片 */}
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
