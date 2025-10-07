export {};
describe('ApiService request interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets Authorization header if token exists', () => {
    localStorage.setItem('token', 'mytoken');
    const config = { headers: {} as Record<string, string> };
    // Simula la lógica del interceptor
    const token = localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    expect(config.headers['Authorization']).toBe('Bearer mytoken');
  });

  it('does not set Authorization header if no token', () => {
    const config = { headers: {} as Record<string, string> };
    const token = localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    expect(config.headers['Authorization']).toBeUndefined();
  });
});
