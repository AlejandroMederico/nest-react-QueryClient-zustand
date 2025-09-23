// services/UserService.ts
import CreateUserRequest from '../models/user/CreateUserRequest';
import UpdateUserRequest from '../models/user/UpdateUserRequest';
import UserQuery from '../models/user/UserQuery';
import { toErrorMessage } from '../utils/errors';
import apiService from './ApiService';

class UserService {
  async findAll(query: UserQuery) {
    try {
      const { data } = await apiService.get('/users', { params: query });
      return data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error fetching users');
      throw Object.assign(new Error(msg), { op: 'findAll', entity: 'user' });
    }
  }

  async findOne(id: string) {
    try {
      const { data } = await apiService.get(`/users/${id}`);
      return data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error fetching user');
      throw Object.assign(new Error(msg), {
        op: 'findOne',
        entity: 'user',
        id,
      });
    }
  }

  async save(payload: CreateUserRequest) {
    try {
      const { data } = await apiService.post('/users', payload);
      return data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error adding user');
      throw Object.assign(new Error(msg), { op: 'save', entity: 'user' });
    }
  }

  async update(id: string, payload: UpdateUserRequest) {
    try {
      const { data } = await apiService.put(`/users/${id}`, payload);
      return data;
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error updating user');
      throw Object.assign(new Error(msg), { op: 'update', entity: 'user', id });
    }
  }

  async delete(id: string) {
    try {
      await apiService.delete(`/users/${id}`);
    } catch (e: unknown) {
      const msg = toErrorMessage(e, 'Error deleting user');
      throw Object.assign(new Error(msg), { op: 'delete', entity: 'user', id });
    }
  }
}

export default new UserService();
