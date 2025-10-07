import { useFavoriteStore } from '../favoriteStore';

describe('favoriteStore', () => {
  beforeEach(() => {
    useFavoriteStore.setState({
      favorites: [],
      loading: false,
      error: null,
      isSynchronizing: false,
      lastUserId: null,
    });
  });

  it('initial favorites is empty', () => {
    const state = useFavoriteStore.getState();
    expect(state.favorites).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isSynchronizing).toBe(false);
    expect(state.lastUserId).toBeNull();
  });

  it('clearFavorites resets state', () => {
    useFavoriteStore.setState({
      favorites: ['1', '2'],
      loading: true,
      error: 'err',
      isSynchronizing: true,
      lastUserId: 'user1',
    });
    useFavoriteStore.getState().clearFavorites();
    const state = useFavoriteStore.getState();
    expect(state.favorites).toEqual([]);
    expect(state.lastUserId).toBeNull();
    expect(state.error).toBeNull();
    expect(state.isSynchronizing).toBe(false);
  });

  it('isFavorite returns true/false', () => {
    useFavoriteStore.setState({ favorites: ['a', 'b', 'c'] });
    expect(useFavoriteStore.getState().isFavorite('a')).toBe(true);
    expect(useFavoriteStore.getState().isFavorite('z')).toBe(false);
  });
});
