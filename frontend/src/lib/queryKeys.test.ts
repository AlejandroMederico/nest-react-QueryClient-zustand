import { contentQueryKeys, courseQueryKeys, usersKeys } from './queryKeys';

describe('queryKeys', () => {
  describe('contentQueryKeys', () => {
    it('list returns correct key', () => {
      const key = contentQueryKeys.list('course1', {
        name: 'n',
        description: 'd',
      });
      expect(key).toEqual([
        'contents',
        'course1',
        { name: 'n', description: 'd' },
      ]);
    });
    it('detail returns correct key', () => {
      const key = contentQueryKeys.detail('course1', 'id1');
      expect(key).toEqual(['contents', 'course1', 'detail', 'id1']);
    });
  });

  describe('courseQueryKeys', () => {
    it('list returns correct key', () => {
      const key = courseQueryKeys.list({
        name: 'n',
        description: 'd',
        page: 2,
        limit: 5,
      });
      expect(key).toEqual([
        'courses',
        {
          page: 2,
          limit: 5,
          sort: 'dateCreated',
          order: 'desc',
          name: 'n',
          description: 'd',
        },
      ]);
    });
    it('detail returns correct key', () => {
      const key = courseQueryKeys.detail('id1');
      expect(key).toEqual(['courses', 'detail', 'id1']);
    });
  });

  describe('usersKeys', () => {
    it('list returns correct key', () => {
      const key = usersKeys.list({
        page: 3,
        limit: 15,
        q: 'search',
        role: 'admin',
      });
      expect(key).toEqual([
        'users',
        {
          page: 3,
          limit: 15,
          sort: 'createdAt',
          order: 'desc',
          q: 'search',
          role: 'admin',
        },
      ]);
    });
    it('detail returns correct key', () => {
      const key = usersKeys.detail('id1');
      expect(key).toEqual(['users', 'detail', 'id1']);
    });
  });
});
