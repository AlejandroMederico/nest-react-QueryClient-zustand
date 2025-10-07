import AuthResponse from '../models/auth/AuthResponse';
import LoginRequest from '../models/auth/LoginRequest';
import apiService from './ApiService';
import { setToken } from './ApiService';

class AuthService {
  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiService.post<AuthResponse>(
      '/auth/login',
      loginRequest,
    );
    apiService.defaults.headers.Authorization = `Bearer ${data.token}`;
    setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout', {}, { withCredentials: true });
    apiService.defaults.headers.Authorization = null;
  }

  async refresh(): Promise<AuthResponse> {
    const { data } = await apiService.post<AuthResponse>('/auth/refresh', {});
    apiService.defaults.headers.Authorization = `Bearer ${data.token}`;
    // Guarda el token en localStorage
    setToken(data.token);
    return data;
  }
}
const authService = new AuthService();
export { authService };
