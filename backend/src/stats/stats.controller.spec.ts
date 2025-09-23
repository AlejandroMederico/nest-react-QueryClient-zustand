import { Test, TestingModule } from '@nestjs/testing';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let controller: StatsController;
  const statsMock = {
    numberOfUsers: 10,
    numberOfCourses: 5,
    numberOfContents: 6,
  };

  const mockService = {
    getStats: jest.fn().mockResolvedValue(statsMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: mockService }],
    }).compile();

    controller = module.get<StatsController>(StatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /stats → getStats', () => {
    it('retorna el DTO con los contadores', async () => {
      const res = await controller.getStats();

      expect(mockService.getStats).toHaveBeenCalledTimes(1);
      expect(res.numberOfUsers).toBe(10);
      expect(res.numberOfCourses).toBe(5);
      expect(res.numberOfContents).toBe(6);
    });
  });
});
