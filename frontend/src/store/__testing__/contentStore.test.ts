import useContentStore, { selectBucket, selectContents } from '../contentStore';

describe('contentStore', () => {
  const courseId = 'course1';

  beforeEach(() => {
    useContentStore.setState({ byCourse: {} });
  });

  it('sets filters and resets page', () => {
    useContentStore.getState().setFilters(courseId, { name: 'test' });
    const bucket = selectBucket(courseId)(useContentStore.getState());
    expect(bucket.filters.name).toBe('test');
    expect(bucket.page).toBe(1);
  });

  it('sets page', () => {
    useContentStore.getState().setPage(courseId, 5);
    const bucket = selectBucket(courseId)(useContentStore.getState());
    expect(bucket.page).toBe(5);
  });

  it('sets limit and resets page', () => {
    useContentStore.getState().setLimit(courseId, 20);
    const bucket = selectBucket(courseId)(useContentStore.getState());
    expect(bucket.limit).toBe(20);
    expect(bucket.page).toBe(1);
  });

  it('initial contents is empty', () => {
    const contents = selectContents(courseId)(useContentStore.getState());
    expect(contents).toEqual([]);
  });
});
