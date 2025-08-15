import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // change to your backend URL
  withCredentials: true // if using cookies
});

export default axiosInstance;