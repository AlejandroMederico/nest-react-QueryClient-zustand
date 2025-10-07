import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import { authService } from '../../services/AuthService';
import useAuth from '../../store/authStore';
import Login from '../Login';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
}));

jest.mock('../../services/AuthService');
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockSetAuthenticatedUser = jest.fn();
const mockSetToken = jest.fn();

beforeEach(() => {
  (useAuth as unknown as jest.Mock).mockReturnValue({
    setAuthenticatedUser: mockSetAuthenticatedUser,
    setToken: mockSetToken,
  });
});

describe('Login page', () => {
  it('renders login form', () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Login />
      </Router>,
    );
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('submits login and redirects on success', async () => {
    const history = createMemoryHistory();
    mockedAuthService.login.mockResolvedValueOnce({
      token: 'token123',
      user: {
        id: '1',
        username: 'user1',
        firstName: 'A',
        lastName: 'B',
        role: 'user',
        isActive: true,
      },
    });
    render(
      <Router history={history}>
        <Login />
      </Router>,
    );
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith({
        username: 'user1',
        password: 'pass',
      });
    });
    expect(mockSetAuthenticatedUser).toHaveBeenCalledWith({
      id: '1',
      username: 'user1',
      firstName: 'A',
      lastName: 'B',
      role: 'user',
      isActive: true,
    });
    expect(mockSetToken).toHaveBeenCalledWith('token123');
    expect(history.location.pathname).toBe('/');
  });

  it('shows error message on failed login', async () => {
    mockedAuthService.login.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Login />
      </Router>,
    );
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
