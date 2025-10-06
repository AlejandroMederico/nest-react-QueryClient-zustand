import apiService from './ApiService';

export const FavoriteService = {
  async addFavorite(courseId: string) {
    await apiService.post(`/courses/${courseId}/favorite`);
  },
  async removeFavorite(courseId: string) {
    await apiService.delete(`/courses/${courseId}/favorite`);
  },
  async listFavorites(userId: string) {
    const { data } = await apiService.get(`/users/${userId}/favorites`);
    return data;
  },
  async isFavorite(courseId: string) {
    const { data } = await apiService.get(`/courses/${courseId}/favorite`);
    return data;
  },
};
