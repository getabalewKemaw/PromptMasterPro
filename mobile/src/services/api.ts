import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Android Emulator uses 10.0.2.2 for localhost
// iOS Simulator uses localhost
// Physical device needs your computer's IP address (found via ipconfig: 192.168.137.1)
const DEV_API_URL = Platform.select({
    android: 'http://192.168.137.1:3000/api', // Updated to your machine's IP
    ios: 'http://192.168.137.1:3000/api',     // Updated to your machine's IP
    default: 'http://localhost:3000/api',
});

export const API_URL = DEV_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token to requests
api.interceptors.request.use(
    async (config) => {
        const token = useAuthStore.getState().token;
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
