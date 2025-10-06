import { Test, TestingModule } from '@nestjs/testing';

import { CourseService } from '../course/course.service';
import { CreateContentDto, UpdateContentDto } from './content.dto';
import { Content } from './content.entity';
import { ContentService } from './content.service';

class MockCourseService {
  findById = jest.fn().mockResolvedValue({ id: 'course-1' });
}

describe('ContentService', () => {
  let service: ContentService;
  let courseService: MockCourseService;

  beforeEach(async () => {
    courseService = new MockCourseService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: CourseService, useValue: courseService },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);

    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('crea contenido bajo un curso y lo devuelve', async () => {
      const dto: CreateContentDto = { name: 'C1', description: 'D1' };

      courseService.findById.mockResolvedValueOnce({ id: 'course-123' });

      // Content.create().save()
      const saveMock = jest.fn().mockResolvedValue({
        id: 'content-1',
        course: { id: 'course-123' },
        name: 'C1',
        description: 'D1',
        dateCreated: new Date(),
      });
      const createSpy = jest
        .spyOn(Content as any, 'create')
        .mockReturnValue({ save: saveMock });

      const created = await service.save('course-123', dto);

      expect(courseService.findById).toHaveBeenCalledWith('course-123');
      // el service pasa "course: { id: ... }"
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          course: { id: 'course-123' },
          name: 'C1',
          description: 'D1',
        }),
      );
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(created.id).toBe('content-1');
      expect(created.course).toEqual({ id: 'course-123' });
    });
  });

  describe('findAllByCourseId', () => {
    it('devuelve objeto con data y meta', async () => {
      const getManyAndCount = async () => [
        [
          {
            id: 'ct-1',
            name: 'a',
            description: 'x',
            dateCreated: new Date(),
            image: null,
          },
          {
            id: 'ct-2',
            name: 'b',
            description: 'y',
            dateCreated: new Date(),
            image: null,
          },
        ],
        2,
      ];
      const take = () => ({ getManyAndCount });
      const skip = () => ({ take });
      const orderBy = () => ({ skip });
      const andWhere = () => ({ orderBy, skip, take, getManyAndCount });
      const where = () => ({ andWhere, orderBy, skip, take, getManyAndCount });
      jest.spyOn(Content as any, 'createQueryBuilder').mockReturnValue({
        where,
        andWhere,
        orderBy,
        skip,
        take,
        getManyAndCount,
      });

      const res = await service.findAllByCourseId('course-123', {
        page: 1,
        limit: 10,
        name: 'a',
      } as any);

      expect(res).toHaveProperty('data');
      expect(res.data).toHaveLength(2);
      expect(res.data[0].id).toBe('ct-1');
      expect(res.data[1].id).toBe('ct-2');
      expect(res).toHaveProperty('meta');
      expect(res.meta).toMatchObject({ page: 1, limit: 10, total: 2 });
    });
  });

  describe('findById', () => {
    it('devuelve un contenido por id', async () => {
      const oneSpy = jest
        .spyOn(Content as any, 'findOne')
        .mockResolvedValueOnce({
          id: 'ct-5',
          course: { id: 'course-123' },
          name: 'cX',
          description: 'dX',
          dateCreated: new Date(),
        });

      const content = await service.findById('ct-5');

      expect(oneSpy).toHaveBeenCalledTimes(1);
      expect(content.id).toBe('ct-5');
      expect(content.course).toEqual({ id: 'course-123' });
    });
  });

  describe('update', () => {
    it('actualiza el contenido y devuelve los cambios', async () => {
      const dto: UpdateContentDto = { name: 'NN', description: 'DD' };

      jest.spyOn(service, 'findByCourseIdAndId').mockResolvedValueOnce({
        id: 'ct-1',
        course: { id: 'course-123' },
        save: jest.fn().mockResolvedValue({
          id: 'ct-1',
          course: { id: 'course-123' },
          ...dto,
        }),
      } as any);

      const updated = await service.update('course-123', 'ct-1', dto);

      expect(service.findByCourseIdAndId).toHaveBeenCalledWith(
        'course-123',
        'ct-1',
      );
      expect(updated).toMatchObject({
        id: 'ct-1',
        course: { id: 'course-123' },
        name: dto.name,
        description: dto.description,
      });
    });
  });

  describe('delete', () => {
    it('elimina el contenido y retorna el id', async () => {
      const contentEntity = { id: 'ct-9', course: { id: 'course-123' } } as any;

      jest
        .spyOn(service, 'findByCourseIdAndId')
        .mockResolvedValueOnce(contentEntity);

      const delSpy = jest
        .spyOn(Content as any, 'delete')
        .mockResolvedValueOnce({ affected: 1 });

      const id = await service.delete('course-123', 'ct-9');

      expect(service.findByCourseIdAndId).toHaveBeenCalledWith(
        'course-123',
        'ct-9',
      );
      expect(delSpy).toHaveBeenCalledWith(contentEntity);
      expect(id).toBe('ct-9');
    });
  });

  describe('count', () => {
    it('retorna cantidad de contenidos', async () => {
      const countSpy = jest
        .spyOn(Content as any, 'count')
        .mockResolvedValue(10);
      const count = await service.count();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(count).toBe(10);
    });
  });
});
