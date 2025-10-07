import useAuth from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and gets authenticated user', () => {
    const store = useAuth.getState();
    store.setAuthenticatedUser({
      id: '1',
      firstName: 'A',
      lastName: 'B',
      username: 'ab',
      role: 'user',
      isActive: true,
    });
    const updated = useAuth.getState();
    expect(updated.authenticatedUser).toEqual({
      id: '1',
      firstName: 'A',
      lastName: 'B',
      username: 'ab',
      role: 'user',
      isActive: true,
    });
  });

  it('sets and gets token', () => {
    const store = useAuth.getState();
    store.setToken('token123');
    const updated = useAuth.getState();
    expect(updated.token).toBe('token123');
  });

  it('logout clears user and token', () => {
    const store = useAuth.getState();
    store.setAuthenticatedUser({
      id: '1',
      firstName: 'A',
      lastName: 'B',
      username: 'ab',
      role: 'user',
      isActive: true,
    });
    store.setToken('token123');
    store.logout();
    const updated = useAuth.getState();
    expect(updated.authenticatedUser).toBeUndefined();
    expect(updated.token).toBeUndefined();
  });
});
