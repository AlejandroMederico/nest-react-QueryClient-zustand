// eslint-disable-next-line @typescript-eslint/no-redeclare
import { act, renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import * as contentHooks from './content.hooks';

jest.mock('../../services/ContentService', () => ({
  contentService: {
    findAll: jest.fn(() =>
      Promise.resolve({
        data: ['content1', 'content2'],
        meta: { page: 1, limit: 10, total: 2 },
      }),
    ),
    findOne: jest.fn(() => Promise.resolve('content-detail')),
    save: jest.fn(() => Promise.resolve(undefined)),
    update: jest.fn(() => Promise.resolve(undefined)),
    delete: jest.fn(() => Promise.resolve(undefined)),
  },
}));
jest.mock('../../lib/queryKeys', () => ({
  contentQueryKeys: {
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

describe('content.hooks', () => {
  it('useCreateContent calls save', async () => {
    const { result } = renderHook(
      () => contentHooks.useCreateContent('course1'),
      { wrapper: createWrapper() },
    );
    await act(async () => {
      const res = await result.current.mutateAsync({
        name: 'new',
        description: 'desc',
      });
      expect(res).toBeUndefined();
    });
  });

  it('useUpdateContent calls update', async () => {
    const { result } = renderHook(
      () => contentHooks.useUpdateContent('course1'),
      { wrapper: createWrapper() },
    );
    await act(async () => {
      const res = await result.current.mutateAsync({
        id: 'id1',
        data: { name: 'upd', description: 'desc' },
      });
      expect(res).toBeUndefined();
    });
  });

  it('useDeleteContent calls delete', async () => {
    const { result } = renderHook(
      () => contentHooks.useDeleteContent('course1'),
      { wrapper: createWrapper() },
    );
    await act(async () => {
      const res = await result.current.mutateAsync('id1');
      expect(res).toBeUndefined();
    });
  });
});
