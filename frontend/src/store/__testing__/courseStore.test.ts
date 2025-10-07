import useCourseStore from '../courseStore';

describe('courseStore', () => {
  beforeEach(() => {
    useCourseStore.setState({
      courses: [],
      loading: false,
      error: null,
      filters: {},
      page: 1,
      limit: 10,
      total: 0,
    });
  });

  it('sets filters and resets page', () => {
    useCourseStore.getState().setFilters({ name: 'test' });
    const state = useCourseStore.getState();
    expect(state.filters.name).toBe('test');
    expect(state.page).toBe(1);
  });

  it('sets page', () => {
    useCourseStore.getState().setPage(5);
    const state = useCourseStore.getState();
    expect(state.page).toBe(5);
  });

  it('initial courses is empty', () => {
    const state = useCourseStore.getState();
    expect(state.courses).toEqual([]);
  });
});
