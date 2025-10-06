import { create } from 'zustand';

import { FavoriteService } from '../services/FavoriteService';

interface FavoriteState {
  favorites: string[];
  loading: boolean;
  error: string | null;
  isSynchronizing: boolean;
  lastUserId: string | null;
  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (
    courseId: string,
    isFav: boolean,
    userId: string,
  ) => Promise<void>;
  isFavorite: (courseId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  isSynchronizing: false,
  lastUserId: null,
  async fetchFavorites(userId) {
    if (get().loading) return;
    if (
      get().lastUserId === userId &&
      get().favorites.length > 0 &&
      !get().isSynchronizing
    ) {
      return;
    }
    set({ isSynchronizing: true, error: null, lastUserId: userId });
    try {
      const favs = await FavoriteService.listFavorites(userId);
      const newFavorites = favs.map((c: any) => String(c.id));
      set({
        favorites: newFavorites,
        isSynchronizing: false,
        lastUserId: userId,
      });
    } catch (e: any) {
      set({ error: e.message, isSynchronizing: false });
    }
  },
  async toggleFavorite(courseId, isFav, userId) {
    set({ loading: true, error: null });
    const originalFavorites = get().favorites;

    try {
      if (isFav) {
        await FavoriteService.removeFavorite(courseId);
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== courseId),
        }));
      } else {
        await FavoriteService.addFavorite(courseId);
        set((state) => ({
          favorites: [...state.favorites, courseId],
        }));
      }
      setTimeout(() => {
        if (!get().loading) {
          get().fetchFavorites(userId).catch(console.error);
        }
      }, 100);
    } catch (e: any) {
      set({ error: e.message, favorites: originalFavorites });
      await get().fetchFavorites(userId);
    } finally {
      set({ loading: false });
    }
  },
  isFavorite(courseId: string): boolean {
    return get().favorites.includes(courseId);
  },
  clearFavorites() {
    set({
      favorites: [],
      lastUserId: null,
      error: null,
      isSynchronizing: false,
    });
  },
}));
