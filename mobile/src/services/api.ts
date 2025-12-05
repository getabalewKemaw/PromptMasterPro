import axios from 'axios';
import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 for localhost
// iOS Simulator uses localhost
// Physical device needs your computer's IP address (e.g., 192.168.1.X)
const DEV_API_URL = Platform.select({
    android: 'http://10.0.2.2:3000/api',
    ios: 'http://localhost:3000/api',
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
        // We will implement token retrieval later
        // const token = await useAuthStore.getState().token;
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
