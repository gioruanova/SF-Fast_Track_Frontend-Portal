import axios from "axios";
import { config } from "./config";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    
    const isAuthRoute = 
      url.includes('/profile') || 
      url.includes('/refresh') ||
      url.includes('/login') ||
      url.includes('/logout');
    
    if (isAuthRoute && (status === 401 || status === 400 || status === 403)) {
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

