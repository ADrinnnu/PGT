import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5072/api', 
});

api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('tms_token') || localStorage.getItem('token');
        if (token) {
            token = token.replace(/^"|"$/g, '');
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;