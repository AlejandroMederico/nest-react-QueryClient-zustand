import { Test, TestingModule } from '@nestjs/testing';

import { ContentController } from './content.controller';
import { Content } from './content.entity';
import { ContentService } from './content.service';

describe('ContentController', () => {
  let controller: ContentController;
  let service: ContentService;

  const baseContentMethods = {
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    hasId: jest.fn(),
    reload: jest.fn(),
  };
  const mockContents: Content[] = [
    {
      id: 'c1',
      name: 'A',
      description: 'Desc',
      dateCreated: new Date(),
      image: null,
      courseId: 'course-1',
      course: {} as any,
      ...baseContentMethods,
    } as Content,
    {
      id: 'c2',
      name: 'B',
      description: 'Desc2',
      dateCreated: new Date(),
      image: null,
      courseId: 'course-2',
      course: {} as any,
      ...baseContentMethods,
    } as Content,
  ];

  const mockContentService = {
    findLatestWithCourse: jest.fn().mockResolvedValue(mockContents),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [{ provide: ContentService, useValue: mockContentService }],
    }).compile();

    controller = module.get<ContentController>(ContentController);
    service = module.get<ContentService>(ContentService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findLatest', () => {
    it('should return latest contents with course', async () => {
      const result = await controller.findLatest(2);
      expect(service.findLatestWithCourse).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockContents);
    });

    it('should use default limit if not provided', async () => {
      await controller.findLatest(undefined);
      expect(service.findLatestWithCourse).toHaveBeenCalledWith(5);
    });

    it('should propagate errors from the service', async () => {
      (service.findLatestWithCourse as jest.Mock).mockRejectedValueOnce(
        new Error('Service error'),
      );
      await expect(controller.findLatest(2)).rejects.toThrow('Service error');
    });
  });
});
