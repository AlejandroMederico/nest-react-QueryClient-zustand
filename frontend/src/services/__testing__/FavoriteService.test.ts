import apiService from '../ApiService';
import { FavoriteService } from '../FavoriteService';

jest.mock('../ApiService');
const mockedApi = apiService as jest.Mocked<typeof apiService>;

describe('FavoriteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('addFavorite posts to favorite endpoint', async () => {
    mockedApi.post.mockResolvedValueOnce({});
    await FavoriteService.addFavorite('course1');
    expect(mockedApi.post).toHaveBeenCalledWith('/courses/course1/favorite');
  });

  it('removeFavorite deletes from favorite endpoint', async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    await FavoriteService.removeFavorite('course1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/courses/course1/favorite');
  });

  it('listFavorites gets user favorites', async () => {
    const mockData = [{ id: 'fav1' }, { id: 'fav2' }];
    mockedApi.get.mockResolvedValueOnce({ data: mockData } as any);
    const result = await FavoriteService.listFavorites('user1');
    expect(result).toEqual(mockData);
    expect(mockedApi.get).toHaveBeenCalledWith('/users/user1/favorites');
  });

  it('isFavorite gets favorite status', async () => {
    const mockData = { isFavorite: true };
    mockedApi.get.mockResolvedValueOnce({ data: mockData } as any);
    const result = await FavoriteService.isFavorite('course1');
    expect(result).toEqual(mockData);
    expect(mockedApi.get).toHaveBeenCalledWith('/courses/course1/favorite');
  });
});
