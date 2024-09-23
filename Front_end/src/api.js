import axios from 'axios';

//  use the `xsrfCookieName` config option

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    xsrfCookieName: 'csrftoken', // The name of the CSRF cookie to look for
    xsrfHeaderName: 'X-CSRFToken', // The name of the header to send the CSRF token in
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
