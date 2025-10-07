import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import * as courseHooks from './course.hooks';

jest.mock('../../services/CourseService', () => ({
  courseService: {
    findAll: jest.fn(() =>
      Promise.resolve({
        data: ['course1', 'course2'],
        meta: { page: 1, limit: 10, total: 2 },
      }),
    ),
    findOne: jest.fn(() => Promise.resolve('course-detail')),
    save: jest.fn(() => Promise.resolve(undefined)),
    update: jest.fn(() => Promise.resolve(undefined)),
    delete: jest.fn(() => Promise.resolve(undefined)),
  },
}));
jest.mock('../../lib/queryKeys', () => ({
  courseQueryKeys: {
    list: jest.fn(() => ['list']),
    detail: jest.fn(() => ['detail']),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('course.hooks', () => {
  it('useCreateCourse calls save', async () => {
    const { result } = renderHook(() => courseHooks.useCreateCourse(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      const res = await result.current.mutateAsync({
        name: 'new',
        description: 'desc',
      });
      expect(res).toBeUndefined();
    });
  });

  it('useUpdateCourse calls update', async () => {
    const { result } = renderHook(() => courseHooks.useUpdateCourse(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      const res = await result.current.mutateAsync({
        id: 'id1',
        data: { name: 'upd', description: 'desc' },
      });
      expect(res).toBeUndefined();
    });
  });

  it('useDeleteCourse calls delete', async () => {
    const { result } = renderHook(() => courseHooks.useDeleteCourse(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      const res = await result.current.mutateAsync('id1');
      expect(res).toBeUndefined();
    });
  });
});
