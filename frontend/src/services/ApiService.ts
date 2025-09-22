import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import authService from './AuthService';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
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

    // No intentes refrescar si la request original es al propio refresh o login
    const url = (originalRequest.url || '').toString();
    const isAuthEndpoint =
      url.includes('/auth/refresh') || url.includes('/auth/login');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
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
