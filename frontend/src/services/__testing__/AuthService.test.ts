import AuthResponse from '../../models/auth/AuthResponse';
import LoginRequest from '../../models/auth/LoginRequest';
import apiService from '../ApiService';
import { authService } from '../AuthService';

jest.mock('../ApiService');
const mockedApi = apiService as jest.Mocked<typeof apiService>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.defaults.headers as any).Authorization = undefined;
  });

  it('login sets Authorization header and returns AuthResponse', async () => {
    const loginRequest: LoginRequest = {
      username: 'testuser',
      password: '1234',
    };
    const mockResponse: AuthResponse = {
      token: 'abc123',
      user: {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        role: 'user',
        isActive: true,
      },
    };
    mockedApi.post.mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await authService.login(loginRequest);
    expect(result).toEqual(mockResponse);
    expect(apiService.defaults.headers.Authorization).toBe('Bearer abc123');
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', loginRequest);
  });

  it('logout clears Authorization header', async () => {
    mockedApi.post.mockResolvedValueOnce({});
    (apiService.defaults.headers as any).Authorization = 'Bearer abc123';
    await authService.logout();
    expect(apiService.defaults.headers.Authorization).toBeNull();
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/auth/logout',
      {},
      { withCredentials: true },
    );
  });

  it('refresh sets Authorization header and returns AuthResponse', async () => {
    const mockResponse: AuthResponse = {
      token: 'def456',
      user: {
        id: '2',
        firstName: 'User2',
        lastName: 'Test',
        username: 'user2',
        role: 'admin',
        isActive: false,
      },
    };
    mockedApi.post.mockResolvedValueOnce({ data: mockResponse } as any);
    const result = await authService.refresh();
    expect(result).toEqual(mockResponse);
    expect(apiService.defaults.headers.Authorization).toBe('Bearer def456');
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/refresh', {});
  });
});
