import { Test, TestingModule } from '@nestjs/testing';

import { ContentService } from '../content/content.service';
import { CourseService } from '../course/course.service';
import { UserService } from '../user/user.service';
import { StatsService } from './stats.service';

class MockUserService {
  count = jest.fn().mockResolvedValue(10);
}
class MockCourseService {
  count = jest.fn().mockResolvedValue(5);
}
class MockContentService {
  count = jest.fn().mockResolvedValue(6);
}

describe('StatsService', () => {
  let service: StatsService;
  let userService: MockUserService;
  let courseService: MockCourseService;
  let contentService: MockContentService;

  beforeEach(async () => {
    userService = new MockUserService();
    courseService = new MockCourseService();
    contentService = new MockContentService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: UserService, useValue: userService },
        { provide: CourseService, useValue: courseService },
        { provide: ContentService, useValue: contentService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('devuelve los contadores agregados', async () => {
      const stats = await service.getStats();

      expect(userService.count).toHaveBeenCalledTimes(1);
      expect(courseService.count).toHaveBeenCalledTimes(1);
      expect(contentService.count).toHaveBeenCalledTimes(1);

      expect(stats.numberOfUsers).toBe(10);
      expect(stats.numberOfCourses).toBe(5);
      expect(stats.numberOfContents).toBe(6);
    });

    it('propaga error con el mensaje del servicio', async () => {
      courseService.count.mockRejectedValueOnce(new Error('boom'));

      await expect(service.getStats()).rejects.toThrow(
        /StatsService\.getStats message: boom/,
      );
    });
  });
});
