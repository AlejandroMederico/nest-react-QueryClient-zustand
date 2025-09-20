import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import authService from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!status) return Promise.reject(error);

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = authService
            .refresh()
            .then((r) => r.token)
            .finally(() => {
              refreshPromise = null;
            });
        }
        const token = await refreshPromise;

        axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${token}`,
        };

        return axiosInstance(originalRequest);
      } catch (e) {
        // opcional: redirigir a /login
        // window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
