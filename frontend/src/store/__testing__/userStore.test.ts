import useUserStore from '../userStore';

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      all: [],
      filtered: [],
      loading: false,
      error: null,
      filters: {
        firstName: '',
        lastName: '',
        username: '',
        q: '',
        role: 'all',
        sort: 'createdAt',
        order: 'desc',
        page: 1,
        limit: 10,
      },
      meta: undefined,
    });
  });

  it('sets filters and updates filtered', () => {
    useUserStore.getState().setFilters({ firstName: 'John' });
    const state = useUserStore.getState();
    expect(state.filters.firstName).toBe('John');
    expect(Array.isArray(state.filtered)).toBe(true);
  });

  it('initial users is empty', () => {
    const state = useUserStore.getState();
    expect(state.all).toEqual([]);
    expect(state.filtered).toEqual([]);
  });
});
