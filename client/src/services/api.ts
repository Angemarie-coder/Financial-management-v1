// src/services/api.ts
import axios from 'axios';

// Create a central Axios instance with a base URL
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://financial-management-v1.onrender.com/api',
});

// --- Axios Interceptor ---
// This function runs before every single request is sent.
// Its job is to check if we have a token in localStorage and, if so,
// add it to the Authorization header.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;