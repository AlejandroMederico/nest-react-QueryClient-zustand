import AuthResponse from '../models/auth/AuthResponse';
import LoginRequest from '../models/auth/LoginRequest';
import apiService from './ApiService';

class AuthService {
  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiService.post<AuthResponse>(
      '/api/auth/login',
      loginRequest,
    );
    apiService.defaults.headers.Authorization = `Bearer ${data.token}`;
    return data;
  }

  async logout(): Promise<void> {
    await apiService.post('/api/auth/logout', {}, { withCredentials: true });
    apiService.defaults.headers.Authorization = null;
  }

  async refresh(): Promise<AuthResponse> {
    const { data } = await apiService.post<AuthResponse>(
      '/api/auth/refresh',
      {},
    );
    apiService.defaults.headers.Authorization = `Bearer ${data.token}`;
    return data;
  }
}

export default new AuthService();
