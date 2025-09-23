import { create } from 'zustand';

import type CreateUserRequest from '../models/user/CreateUserRequest';
import type UpdateUserRequest from '../models/user/UpdateUserRequest';
import type User from '../models/user/User';
import type UserQuery from '../models/user/UserQuery';
import userService from '../services/UserService';

type State = {
  all: User[]; // fuente de verdad local
  filtered: User[]; // resultado del filtro en memoria
  loading: boolean;
  error: string | null;
  filters: UserQuery; // filtros actuales (front)
};

type Actions = {
  // seteo de filtros (NO pega a la API)
  setFilters: (partial: UserQuery) => void;

  // carga/recarga desde backend (solo cuando hace falta)
  fetchUsers: () => Promise<void>;

  // mutaciones (y luego re-sync 1 vez)
  addUser: (payload: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, payload: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

const applyLocalFilter = (items: User[], f: UserQuery): User[] => {
  const first = (f.firstName ?? '').trim().toLowerCase();
  const last = (f.lastName ?? '').trim().toLowerCase();
  const usern = (f.username ?? '').trim().toLowerCase();
  const role = (f.role ?? '').trim().toLowerCase();

  return items.filter((u) => {
    const okFirst = first
      ? `${u.firstName}`.toLowerCase().includes(first)
      : true;
    const okLast = last ? `${u.lastName}`.toLowerCase().includes(last) : true;
    const okUsern = usern
      ? `${u.username}`.toLowerCase().includes(usern)
      : true;
    const okRole = role ? `${u.role}`.toLowerCase() === role : true;
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
  filters: {},

  setFilters(partial) {
    set((s) => {
      const nextFilters = { ...s.filters, ...partial };
      const nextFiltered = sortUsers(applyLocalFilter(s.all, nextFilters));
      return { filters: nextFilters, filtered: nextFiltered };
    });
  },

  async fetchUsers() {
    set({ loading: true, error: null });
    try {
      const data = await userService.findAll({}); // trae todo 1 vez
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
    await userService.save(payload);
    await get().fetchUsers(); // re-sync lista local
  },

  async updateUser(id, payload) {
    await userService.update(id, payload);
    await get().fetchUsers();
  },

  async deleteUser(id) {
    await userService.delete(id);
    await get().fetchUsers();
  },
}));

export default useUserStore;
