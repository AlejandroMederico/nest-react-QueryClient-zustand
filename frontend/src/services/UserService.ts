// --- API del recurso Users (todo en un solo archivo) ---
import { Role, SortField, SortOrder } from '../lib/queryKeys';
import type CreateUserRequest from '../models/user/CreateUserRequest';
import type UpdateUserRequest from '../models/user/UpdateUserRequest';
// TIPOS (usa tus DTOs reales)
import type User from '../models/user/User';
import { UsersListParams } from '../models/user/UserQuery';
import { toErrorMessage } from '../utils/errors';
import apiService from './ApiService';

const isRole = (v: any): v is Role =>
  v === 'admin' || v === 'editor' || v === 'user';
const isSort = (v: any): v is SortField =>
  [
    'username',
    'firstName',
    'lastName',
    'role',
    'isActive',
    'createdAt',
  ].includes(v);
const isOrder = (v: any): v is SortOrder => v === 'asc' || v === 'desc';

// =============== HTTP CALLS (manteniendo tus nombres) ===============
export async function listUsers(params: UsersListParams) {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page ?? 1));
  sp.set('limit', String(params.limit ?? 10));

  if (isSort(params.sort)) sp.set('sort', params.sort);
  if (isOrder(params.order)) sp.set('order', params.order);

  const q = params.q?.trim();
  if (q) sp.set('q', q);

  if (isRole(params.role)) sp.set('role', params.role);

  const { data } = await apiService.get(`/users?${sp.toString()}`);
  return data as {
    data: any[];
    meta: { page: number; limit: number; total: number };
  };
}

export async function findOne(id: string): Promise<User> {
  try {
    const { data } = await apiService.get(`/users/${id}`);
    return data;
  } catch (e: unknown) {
    const msg = toErrorMessage(e, 'Error fetching user');
    throw Object.assign(new Error(msg), { op: 'findOne', entity: 'user', id });
  }
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  try {
    const { data } = await apiService.post('/users', payload);
    return data;
  } catch (e: unknown) {
    const msg = toErrorMessage(e, 'Error creating user');
    throw Object.assign(new Error(msg), {
      op: 'createUser',
      entity: 'user',
      payload,
    });
  }
}

export async function updateUser(
  id: string,
  payload: UpdateUserRequest,
): Promise<User> {
  try {
    const { data } = await apiService.put(`/users/${id}`, payload);
    return data;
  } catch (e: unknown) {
    const msg = toErrorMessage(e, 'Error updating user');
    throw Object.assign(new Error(msg), {
      op: 'updateUser',
      entity: 'user',
      id,
      payload,
    });
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await apiService.delete(`/users/${id}`);
    return true;
  } catch (e: unknown) {
    const msg = toErrorMessage(e, 'Error deleting user');
    throw Object.assign(new Error(msg), {
      op: 'deleteUser',
      entity: 'user',
      id,
    });
  }
}

export const userService = {
  listUsers,
  findOne,
  createUser,
  updateUser,
  deleteUser,
};
