import { create } from 'zustand';

import User from '../models/user/User';

interface AuthState {
  authenticatedUser?: User | null;
  setAuthenticatedUser: (user: User | null) => void;
}

const useAuth = create<AuthState>((set) => ({
  authenticatedUser: undefined,
  setAuthenticatedUser: (user) => set({ authenticatedUser: user }),
}));

export default useAuth;
