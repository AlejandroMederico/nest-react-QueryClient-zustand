import { create } from 'zustand';

import type CreateUserRequest from '../models/user/CreateUserRequest';
import type UpdateUserRequest from '../models/user/UpdateUserRequest';
import type User from '../models/user/User';
import type UserQuery from '../models/user/UserQuery';
import userService from '../services/UserService';

type State = {
  all: User[];
  filtered: User[];
  loading: boolean;
  error: string | null;
  filters: UserQuery;
};

type Actions = {
  setFilters: (partial: UserQuery) => void;
  fetchUsers: () => Promise<void>;
  addUser: (payload: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, payload: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

const applyLocalFilter = (items: User[], query: UserQuery): User[] => {
  const first = (query.firstName ?? '').trim().toLowerCase();
  const last = (query.lastName ?? '').trim().toLowerCase();
  const usern = (query.username ?? '').trim().toLowerCase();
  const role = (query.role ?? '').trim().toLowerCase();

  return items.filter((_user) => {
    const okFirst = first
      ? `${_user.firstName}`.toLowerCase().includes(first)
      : true;
    const okLast = last
      ? `${_user.lastName}`.toLowerCase().includes(last)
      : true;
    const okUsern = usern
      ? `${_user.username}`.toLowerCase().includes(usern)
      : true;
    const okRole = role ? `${_user.role}`.toLowerCase() === role : true;
    return okFirst && okLast && okUsern && okRole;
  });
};

// Ordena por firstName, lastName
const sortUsers = (items: User[]) =>
  items
    .slice()
    .sort(
      (a, b) =>
        a.firstName.localeCompare(b.firstName) ||
        a.lastName.localeCompare(b.lastName),
    );

const useUserStore = create<State & Actions>((set, get) => ({
  all: [],
  filtered: [],
  loading: false,
  error: null,
  filters: {},

  setFilters(partial) {
    set((_state) => {
      const nextFilters = { ..._state.filters, ...partial };
      const nextFiltered = sortUsers(applyLocalFilter(_state.all, nextFilters));
      return { filters: nextFilters, filtered: nextFiltered };
    });
  },

  async fetchUsers() {
    set({ loading: true, error: null });
    try {
      const data = await userService.findAll({});
      const sorted = sortUsers(data);
      const filtered = applyLocalFilter(sorted, get().filters);
      set({ all: sorted, filtered, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message ?? e?.message ?? 'Error fetching users',
      });
    }
  },

  async addUser(payload) {
    set({ loading: true, error: null });
    try {
      if (Object.keys(payload).length === 0) {
        set({ loading: false, error: 'No fields to add' });
        return;
      }
      await userService.save(payload);
      await get().fetchUsers();
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message ?? e?.message ?? 'Error adding user',
      });
    }
  },

  async updateUser(id, payload) {
    set({ loading: true, error: null });
    try {
      if (!id) {
        set({ loading: false, error: 'User ID is required' });
        return;
      }
      if (Object.keys(payload).length === 0) {
        set({ loading: false, error: 'No fields to update' });
        return;
      }
      await userService.update(id, payload);
      await get().fetchUsers();
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message ?? e?.message ?? 'Error updating user',
      });
    }
  },

  async deleteUser(id) {
    set({ loading: true, error: null });
    if (!id) {
      set({ loading: false, error: 'User ID is required' });
      return;
    }
    try {
      await userService.delete(id);
      await get().fetchUsers();
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message ?? e?.message ?? 'Error deleting user',
      });
    }
  },
}));

export default useUserStore;
