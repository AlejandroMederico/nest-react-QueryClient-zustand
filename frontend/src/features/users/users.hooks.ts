import { useMutation, useQuery, useQueryClient } from 'react-query';

import { type UsersListParams, usersKeys } from '../../lib/queryKeys';
import type User from '../../models/user/User';
import * as UserService from '../../services/UserService';
import authStore from '../../store/authStore';

export function useUsersList(params: UsersListParams) {
  const token = authStore((s) => s.token);

  return useQuery(usersKeys.list(params), () => UserService.listUsers(params), {
    enabled: !!token,
    keepPreviousData: true,
    staleTime: 60_000,
  });
}

export function useUserDetail(id?: string) {
  return useQuery(
    usersKeys.detail(id || 'null'),
    () => UserService.findOne(id!),
    {
      enabled: !!id,
    },
  );
}

export function useCreateUser(visibleParams: UsersListParams) {
  const qc = useQueryClient();
  return useMutation(
    (payload: Partial<User>) => UserService.createUser(payload as any),
    {
      onSuccess: () => qc.invalidateQueries(usersKeys.list(visibleParams)),
    },
  );
}

export function useUpdateUser(visibleParams: UsersListParams) {
  const qc = useQueryClient();
  return useMutation(
    ({ id, payload }: { id: string; payload: Partial<User> }) =>
      UserService.updateUser(id, payload as any),
    {
      onSuccess: (_updated, vars) => {
        qc.invalidateQueries(usersKeys.list(visibleParams));
        qc.invalidateQueries(usersKeys.detail(vars.id));
      },
    },
  );
}

export function useDeleteUser(visibleParams: UsersListParams) {
  const qc = useQueryClient();
  return useMutation((id: string) => UserService.deleteUser(id), {
    onSuccess: (_ok, id) => {
      qc.invalidateQueries(usersKeys.list(visibleParams));
      qc.invalidateQueries(usersKeys.detail(id));
    },
  });
}
