import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor for logging and adding auth headers
axiosInstance.interceptors.request.use(
    (config) => {
        // Log request for debugging
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling responses and errors
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful responses
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        // Log and handle errors
        if (error.response) {
            console.error(`❌ API Error: ${error.response.status} ${error.response.config.url}`, error.response.data);
            
            // Handle specific error cases
            if (error.response.status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem('authToken');
                window.location.href = '/admin/login';
            }
        } else if (error.request) {
            console.error('❌ Network Error: No response received', error.request);
        } else {
            console.error('❌ Request Setup Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;