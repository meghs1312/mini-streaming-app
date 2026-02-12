import axios from 'axios';
import { getToken } from './storage';
import { API_URL } from '../config';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Required for localtunnel (.loca.lt) to skip "Click to continue" interstitial
    if (API_URL.includes('loca.lt')) {
      config.headers['Bypass-Tunnel-Reminder'] = 'true';
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
