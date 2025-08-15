import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://ai-sdr-master.onrender.com/api', // change to your backend URL
  withCredentials: true // if using cookies
});

export default axiosInstance;