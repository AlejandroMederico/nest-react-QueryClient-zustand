import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import authStore from '../store/authStore';

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

const authApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

function getToken() {
  const store = authStore?.getState?.();
  return store?.token ?? localStorage.getItem('token') ?? undefined;
}

function setToken(token?: string) {
  const store = authStore?.getState?.();
  store?.setToken?.(token);
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

function isAuthUrl(url?: string) {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

// ----- Request: agrega Authorization -----
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers?.Authorization) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// ----- Response: maneja 401 con refresh + retry -----
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const resStatus = error.response?.status;
    const erroConfig = error.config as RetriableConfig;

    if (
      resStatus === 401 &&
      erroConfig &&
      !erroConfig._retry &&
      !isAuthUrl(erroConfig.url)
    ) {
      erroConfig._retry = true;
      try {
        const { data } = await authApi.post('/auth/refresh');
        const newToken = (data as any)?.token;
        if (!newToken) throw new Error('No token in /auth/refresh');

        setToken(newToken);
        erroConfig.headers = {
          ...(erroConfig.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };

        return api(erroConfig);
      } catch (e) {
        setToken(undefined);
        const store = authStore?.getState?.();
        store?.logout?.();
        throw e;
      }
    }

    throw error;
  },
);

export default api;
