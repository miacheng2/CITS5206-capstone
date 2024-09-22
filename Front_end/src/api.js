import axios from 'axios';

// Info:
// If this was copied from Stack Overflow, it's common to provide a link in a comment to provide attribution
const getCSRFToken = () => {
    let csrfToken = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                csrfToken = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return csrfToken;
};

const api = axios.create({
    // Suggestion:
    // You should be able to delete getCSRFToken() and the need for setting the header manually
    // with the following config option here:
    // xsrfCookieName: 'X-CSRFToken',
    baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Token ${token}`;
    }
    config.headers['X-CSRFToken'] = getCSRFToken();
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
