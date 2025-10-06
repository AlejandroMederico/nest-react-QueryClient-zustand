import ContentQuery from '../models/content/ContentQuery';
import CourseQuery from '../models/course/CourseQuery';
import { UsersListParams } from '../models/user/UserQuery';
export type SortField =
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'role'
  | 'isActive'
  | 'createdAt';

export type SortOrder = 'asc' | 'desc';
export type Role = 'admin' | 'editor' | 'user';

export const contentQueryKeys = {
  all: ['contents'] as const,
  list: (courseId: string, p: ContentQuery = {}) =>
    [
      ...contentQueryKeys.all,
      courseId,
      {
        name: p.name ?? '',
        description: p.description ?? '',
      },
    ] as const,
  detail: (courseId: string, id: string) =>
    [...contentQueryKeys.all, courseId, 'detail', id] as const,
};
export const courseQueryKeys = {
  all: ['courses'] as const,
  list: (p: CourseQuery = {}) =>
    [
      ...courseQueryKeys.all,
      {
        page: p.page ?? 1,
        limit: p.limit ?? 10,
        sort: p.sort ?? 'dateCreated',
        order: p.order ?? 'desc',
        name: p.name ?? '',
        description: p.description ?? '',
      },
    ] as const,
  detail: (id: string) => [...courseQueryKeys.all, 'detail', id] as const,
};

export const usersKeys = {
  all: ['users'] as const,
  list: (
    p: UsersListParams = {
      page: 0,
      limit: 0,
    },
  ) =>
    [
      ...usersKeys.all,
      {
        page: p.page ?? 1,
        limit: p.limit ?? 10,
        sort: p.sort ?? 'createdAt',
        order: p.order ?? 'desc',
        q: p.q ?? '',
        role: p.role ?? undefined,
      },
    ] as const,
  detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};

function clean(p: UsersListParams) {
  const { page, limit, sort, order, q, role } = p;
  return {
    page,
    limit,
    sort: sort || 'createdAt',
    order: order || 'desc',
    q: q || '',
    role: role || '',
  };
}
export type { UsersListParams };
