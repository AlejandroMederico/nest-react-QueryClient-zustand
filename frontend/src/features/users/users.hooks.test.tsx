import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import * as usersHooks from './users.hooks';

jest.mock('../../services/UserService', () => ({
  listUsers: jest.fn(() =>
    Promise.resolve({
      data: ['user1', 'user2'],
      meta: { page: 1, limit: 10, total: 2 },
    }),
  ),
  findOne: jest.fn(() => Promise.resolve('user-detail')),
  createUser: jest.fn(() => Promise.resolve(undefined)),
  updateUser: jest.fn(() => Promise.resolve(undefined)),
  deleteUser: jest.fn(() => Promise.resolve(undefined)),
}));
jest.mock('../../lib/queryKeys', () => ({
  usersKeys: {
    list: jest.fn(() => ['list']),
    detail: jest.fn(() => ['detail']),
  },
}));
jest.mock('../../store/authStore', () => () => ({ token: 'mock-token' }));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('users.hooks', () => {
  const params = { page: 1, limit: 10 };

  it('useCreateUser calls createUser', async () => {
    const { result } = renderHook(() => usersHooks.useCreateUser(params), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      const res = await result.current.mutateAsync({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        role: 'user',
        isActive: true,
      });
      expect(res).toBeUndefined();
    });
  });

  it('useUpdateUser calls updateUser', async () => {
    const { result } = renderHook(() => usersHooks.useUpdateUser(params), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      const res = await result.current.mutateAsync({
        id: 'id1',
        payload: { firstName: 'Jane' },
      });
      expect(res).toBeUndefined();
    });
  });

  it('useDeleteUser calls deleteUser', async () => {
    const { result } = renderHook(() => usersHooks.useDeleteUser(params), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      const res = await result.current.mutateAsync('id1');
      expect(res).toBeUndefined();
    });
  });
});
