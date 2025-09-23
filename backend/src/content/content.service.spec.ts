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

      // valida curso
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
    it('lista contenidos por curso (con query opcional)', async () => {
      const findSpy = jest.spyOn(Content as any, 'find').mockResolvedValue([
        {
          id: 'ct-1',
          course: { id: 'course-123' },
          name: 'a',
          description: 'x',
          dateCreated: new Date(),
        },
        {
          id: 'ct-2',
          course: { id: 'course-123' },
          name: 'b',
          description: 'y',
          dateCreated: new Date(),
        },
      ]);

      const res = await service.findAllByCourseId('course-123', {
        name: 'a',
      } as any);

      expect(findSpy).toHaveBeenCalledTimes(1); // no acoplamos al 'where' exacto
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe('ct-1');
      expect(res[1].id).toBe('ct-2');
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

      // El service acepta SOLO contentId
      const content = await service.findById('ct-5');

      expect(oneSpy).toHaveBeenCalledTimes(1);
      expect(content.id).toBe('ct-5');
      expect(content.course).toEqual({ id: 'course-123' });
    });
  });

  describe('update', () => {
    it('actualiza el contenido y devuelve los cambios', async () => {
      const dto: UpdateContentDto = { name: 'NN', description: 'DD' };

      // el service valida con findByCourseIdAndId(courseId, contentId)
      jest.spyOn(service, 'findByCourseIdAndId').mockResolvedValueOnce({
        id: 'ct-1',
        course: { id: 'course-123' },
      } as any);

      const saveMock = jest.fn().mockResolvedValue({
        id: 'ct-1',
        course: { id: 'course-123' },
        ...dto,
      });
      const createSpy = jest
        .spyOn(Content as any, 'create')
        .mockReturnValue({ save: saveMock });

      const updated = await service.update('course-123', 'ct-1', dto);

      expect(service.findByCourseIdAndId).toHaveBeenCalledWith(
        'course-123',
        'ct-1',
      );
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'ct-1', ...dto }),
      );
      expect(updated).toEqual({
        id: 'ct-1',
        course: { id: 'course-123' },
        ...dto,
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
      // el service hace Content.delete(content) pasando la entidad
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
