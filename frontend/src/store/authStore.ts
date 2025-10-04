import { create } from 'zustand';

import User from '../models/user/User';

interface AuthState {
  authenticatedUser?: User | null;
  token?: string;
  setAuthenticatedUser: (user: User | null) => void;
  setToken: (token?: string) => void;
  logout: () => void;
}

const useAuth = create<AuthState>((set) => {
  const token = localStorage.getItem('token') || undefined;
  let authenticatedUser: User | null | undefined = undefined;
  try {
    const userStr = localStorage.getItem('authenticatedUser');
    if (userStr) authenticatedUser = JSON.parse(userStr);
  } catch {}
  return {
    authenticatedUser,
    token,
    setAuthenticatedUser: (user) => {
      set({ authenticatedUser: user });
      if (user) {
        localStorage.setItem('authenticatedUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('authenticatedUser');
      }
    },
    setToken: (token) => set({ token }),
    logout: () => {
      set({ authenticatedUser: undefined, token: undefined });
      localStorage.removeItem('authenticatedUser');
      localStorage.removeItem('token');
    },
  };
});

export default useAuth;
