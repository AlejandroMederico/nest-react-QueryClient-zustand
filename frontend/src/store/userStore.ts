import { create } from 'zustand';

import {
  type Role,
  type SortField,
  type SortOrder,
  type UsersListParams,
} from '../lib/queryKeys';
import type CreateUserRequest from '../models/user/CreateUserRequest';
import type UpdateUserRequest from '../models/user/UpdateUserRequest';
import type User from '../models/user/User';
import type UserQuery from '../models/user/UserQuery';
import { userService } from '../services/UserService';
import { toErrorMessage } from '../utils/errors';

type UIFilters = UserQuery & {
  q?: string;
  role?: Role | 'all' | '';
  sort?: SortField;
  order?: SortOrder;
  page: number;
  limit: number;
};

type State = {
  all: User[];
  filtered: User[];
  loading: boolean;
  error: string | null;
  filters: UIFilters;
  meta?: { page: number; limit: number; total: number };
};

type Actions = {
  setFilters: (partial: Partial<UIFilters>) => void;
  fetchUsers: () => Promise<void>;
  addUser: (payload: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, payload: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

const isRole = (v: unknown): v is Role =>
  v === 'admin' || v === 'editor' || v === 'user';

const applyLocalFilter = (items: User[], query: UIFilters): User[] => {
  const first = (query.firstName ?? '').trim().toLowerCase();
  const last = (query.lastName ?? '').trim().toLowerCase();
  const usern = (query.username ?? '').trim().toLowerCase();
  const role = (query.role ?? '').toString().trim().toLowerCase();

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
    const okRole =
      role && role !== 'all' ? `${_user.role}`.toLowerCase() === role : true;
    return okFirst && okLast && okUsern && okRole;
  });
};

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
  filters: {
    firstName: '',
    lastName: '',
    username: '',
    q: '',
    role: 'all',
    sort: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 10,
  },

  setFilters(partial) {
    set((_state) => {
      const nextFilters: UIFilters = { ..._state.filters, ...partial };
      const nextFiltered = sortUsers(applyLocalFilter(_state.all, nextFilters));
      return { filters: nextFilters, filtered: nextFiltered };
    });
  },

  async fetchUsers() {
    set({ loading: true, error: null });
    try {
      const f = get().filters;

      const apiParams: UsersListParams = {
        page: f.page ?? 1,
        limit: f.limit ?? 10,
        sort: (f.sort as SortField) ?? 'createdAt',
        order: (f.order as SortOrder) ?? 'desc',
        q: (f.q ?? '').trim() || undefined,
        role: isRole(f.role) ? f.role : undefined,
      };

      const { data: items, meta } = await userService.listUsers(apiParams);

      const sorted = sortUsers(items);
      const filtered = applyLocalFilter(sorted, get().filters);

      set((s) => ({
        ...s,
        all: sorted,
        filtered,
        loading: false,
        meta,
        filters: {
          ...s.filters,
          page: meta.page,
          limit: meta.limit,
        },
      }));
    } catch (e: unknown) {
      set((s) => ({
        ...s,
        loading: false,
        error: toErrorMessage(e, 'Error fetching users'),
      }));
    }
  },

  async addUser(payload) {
    set({ loading: true, error: null });
    try {
      if (Object.keys(payload).length === 0) {
        set({ loading: false, error: 'No fields to add' });
        return;
      }
      await userService.createUser(payload);
      await get().fetchUsers();
    } catch (e: unknown) {
      set((s) => ({ ...s, loading: false }));
      throw e;
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
      await userService.updateUser(id, payload);
      await get().fetchUsers();
    } catch (e: unknown) {
      set((s) => ({ ...s, loading: false }));
      throw e;
    }
  },

  async deleteUser(id) {
    set({ loading: true, error: null });
    if (!id) {
      set({ loading: false, error: 'User ID is required' });
      return;
    }
    try {
      await userService.deleteUser(id);
      await get().fetchUsers();
    } catch (e: unknown) {
      set((s) => ({ ...s, loading: false }));
      throw e;
    }
  },
}));

export default useUserStore;
