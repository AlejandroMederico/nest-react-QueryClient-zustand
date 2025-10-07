import Stats from '../../models/stats/Stats';
import apiService from '../ApiService';
import { statsService } from '../StatsService';

jest.mock('../ApiService');
const mockedApi = apiService as jest.Mocked<typeof apiService>;

describe('StatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getStats returns stats data', async () => {
    const mockStats: Stats = {
      numberOfUsers: 10,
      numberOfCourses: 5,
      numberOfContents: 20,
    };
    mockedApi.get.mockResolvedValueOnce({ data: mockStats } as any);
    const result = await statsService.getStats();
    expect(result).toEqual(mockStats);
    expect(mockedApi.get).toHaveBeenCalledWith('/stats');
  });
});
