import { Test, TestingModule } from '@nestjs/testing';

import { CreateContentDto, UpdateContentDto } from '../content/content.dto';
import { ContentService } from '../content/content.service';
import { CourseController } from './course.controller';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { CourseService } from './course.service';

const CourseMockService = {
  save: jest.fn().mockImplementation((dto: CreateCourseDto) => ({
    id: 'testid',
    dateCreated: new Date(),
    ...dto,
  })),
  findAll: jest.fn().mockResolvedValue([
    {
      id: 'testid1',
      name: 'test1',
      description: 'test1',
      dateCreated: new Date(),
    },
    {
      id: 'testid2',
      name: 'test2',
      description: 'test2',
      dateCreated: new Date(),
    },
    {
      id: 'testid3',
      name: 'test3',
      description: 'test3',
      dateCreated: new Date(),
    },
  ]),
  findById: jest.fn().mockImplementation((id: string) => ({
    id,
    name: 'test',
    description: 'test',
    dateCreated: new Date(),
  })),
  update: jest.fn().mockImplementation((id: string, dto: UpdateCourseDto) => ({
    id,
    ...dto,
  })),
  delete: jest.fn().mockImplementation((id: string) => id),
};

const ContentMockService = {
  save: jest
    .fn()
    .mockImplementation((courseId: string, dto: CreateContentDto) => ({
      id: 'testcontentid',
      dateCreated: new Date(),
      courseId,
      ...dto,
    })),
  findAllByCourseId: jest.fn().mockImplementation(() => [
    {
      id: 'testcontentid1',
      name: 'c1',
      description: 'd1',
      dateCreated: new Date(),
    },
    {
      id: 'testcontentid2',
      name: 'c2',
      description: 'd2',
      dateCreated: new Date(),
    },
  ]),
  update: jest
    .fn()
    .mockImplementation(
      (_courseId: string, contentId: string, dto: UpdateContentDto) => ({
        id: contentId,
        ...dto,
      }),
    ),
  delete: jest
    .fn()
    .mockImplementation((_courseId: string, contentId: string) => contentId),
};

describe('CourseController', () => {
  let controller: CourseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        { provide: CourseService, useValue: CourseMockService },
        { provide: ContentService, useValue: ContentMockService },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('saveCourse', () => {
    it('crea curso y retorna entidad', async () => {
      const spyDate = jest.spyOn(global, 'Date');
      const res = await controller.save({ name: 'N', description: 'D' });
      const date = spyDate.mock.instances[0];

      expect(CourseMockService.save).toHaveBeenCalledWith({
        name: 'N',
        description: 'D',
      });
      expect(res).toEqual({
        id: 'testid',
        dateCreated: date,
        name: 'N',
        description: 'D',
      });
    });
  });

  describe('findAllCourses', () => {
    it('retorna lista de cursos', async () => {
      const list = await controller.findAll({});
      expect(Array.isArray(list)).toBe(true);
      expect(list[0].id).toBe('testid1');
      expect(list[1].name).toBe('test2');
      expect(list[2].description).toBe('test3');
    });
  });

  describe('findOneCourse', () => {
    it('retorna curso por id', async () => {
      const res = await controller.findOne('idX');
      expect(CourseMockService.findById).toHaveBeenCalledWith('idX');
      expect(res.id).toBe('idX');
      expect(res.name).toBe('test');
    });
  });

  describe('updateCourse', () => {
    it('actualiza curso y retorna cambios', async () => {
      const res = await controller.update('cid', { name: 'N2' });
      expect(CourseMockService.update).toHaveBeenCalledWith('cid', {
        name: 'N2',
      });
      expect(res).toEqual({ id: 'cid', name: 'N2' });
    });
  });

  describe('deleteCourse', () => {
    it('elimina curso y retorna el id', async () => {
      const res = await controller.delete('cid');
      expect(CourseMockService.delete).toHaveBeenCalledWith('cid');
      expect(res).toBe('cid');
    });
  });

  // ----- contents nested -----

  describe('saveContent', () => {
    it('crea contenido para un curso', async () => {
      const spyDate = jest.spyOn(global, 'Date');
      const res = await controller.saveContent('cid', {
        name: 'c1',
        description: 'd1',
      });
      const date = spyDate.mock.instances[0];

      expect(ContentMockService.save).toHaveBeenCalledWith('cid', {
        name: 'c1',
        description: 'd1',
      });
      expect(res).toEqual({
        id: 'testcontentid',
        dateCreated: date,
        courseId: 'cid',
        name: 'c1',
        description: 'd1',
      });
    });
  });

  describe('findAllContentsByCourseId', () => {
    it('lista contenidos del curso', async () => {
      const res = await controller.findAllContentsByCourseId('cid', {});
      expect(ContentMockService.findAllByCourseId).toHaveBeenCalledWith(
        'cid',
        {},
      );
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe('testcontentid1');
      expect(res[1].name).toBe('c2');
    });
  });

  describe('updateContent', () => {
    it('actualiza contenido y retorna cambios', async () => {
      const res = await controller.updateContent('cid', 'ctid', {
        description: 'Dx',
      });
      expect(ContentMockService.update).toHaveBeenCalledWith('cid', 'ctid', {
        description: 'Dx',
      });
      expect(res).toEqual({ id: 'ctid', description: 'Dx' });
    });
  });

  describe('deleteContent', () => {
    it('elimina contenido y retorna id', async () => {
      const res = await controller.deleteContent('cid', 'ctid');
      expect(ContentMockService.delete).toHaveBeenCalledWith('cid', 'ctid');
      expect(res).toBe('ctid');
    });
  });
});
