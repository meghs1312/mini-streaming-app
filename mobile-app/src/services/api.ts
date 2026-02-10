import axios from 'axios';
import { getToken } from './storage';

const API = axios.create({
  baseURL: 'http://10.0.2.2:5000',
});

API.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Token expired or invalid');
    }
    return Promise.reject(error);
  }
);

export default API;
