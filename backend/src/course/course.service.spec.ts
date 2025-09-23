import { Test, TestingModule } from '@nestjs/testing';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseService],
    }).compile();

    service = module.get<CourseService>(CourseService);
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('crea y guarda un curso', async () => {
      const dto: CreateCourseDto = { name: 'N1', description: 'D1' };

      // mock Course.create().save()
      const saveMock = jest.fn().mockResolvedValue({
        id: 'testid',
        name: 'N1',
        description: 'D1',
        dateCreated: new Date(),
      });
      const createSpy = jest
        .spyOn(Course as any, 'create')
        .mockReturnValue({ save: saveMock });

      const created = await service.save(dto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'N1', description: 'D1' }),
      );
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(created.id).toBe('testid');
      expect(created.name).toBe('N1');
    });
  });

  describe('findAll', () => {
    it('devuelve lista de cursos', async () => {
      const findSpy = jest.spyOn(Course as any, 'find').mockResolvedValue([
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
      ]);

      const res = await service.findAll({});
      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(res).toHaveLength(3);
      expect(res[0].id).toBe('testid1');
      expect(res[1].name).toBe('test2');
      expect(res[2].description).toBe('test3');
    });
  });

  describe('findById', () => {
    it('devuelve curso por id', async () => {
      const spyDate = jest.spyOn(global, 'Date');
      const oneSpy = jest
        .spyOn(Course as any, 'findOne')
        .mockResolvedValueOnce({
          id: 'testid',
          name: 'test',
          description: 'test',
          dateCreated: spyDate.mock.instances[0],
        });

      const course = await service.findById('testid');
      expect(oneSpy).toHaveBeenCalledWith('testid');
      expect(course).toEqual({
        id: 'testid',
        name: 'test',
        description: 'test',
        dateCreated: spyDate.mock.instances[0],
      });
    });
  });

  describe('update', () => {
    it('actualiza curso y retorna cambios', async () => {
      const dto: UpdateCourseDto = { name: 'NN', description: 'DD' };

      // 🔧 IMPORTANTE: el service llama this.findById(id) → lo stubbeamos
      jest
        .spyOn(service, 'findById')
        .mockResolvedValueOnce({ id: 'testid' } as any);

      // luego hace Course.create({ id, ...dto }).save()
      const saveMock = jest.fn().mockResolvedValue({
        id: 'testid',
        ...dto,
      });
      const createSpy = jest
        .spyOn(Course as any, 'create')
        .mockReturnValue({ save: saveMock });

      const updated = await service.update('testid', dto);

      expect(service.findById).toHaveBeenCalledWith('testid');
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'testid', ...dto }),
      );
      expect(updated).toEqual({ id: 'testid', ...dto });
    });
  });

  describe('delete', () => {
    it('elimina curso y retorna el id', async () => {
      // El service valida existencia
      jest
        .spyOn(service, 'findById')
        .mockResolvedValueOnce({ id: 'testid' } as any);

      const delSpy = jest
        .spyOn(Course as any, 'delete')
        .mockResolvedValueOnce({ affected: 1 });

      const id = await service.delete('testid');

      expect(service.findById).toHaveBeenCalledWith('testid');
      expect(delSpy).toHaveBeenCalledWith({ id: 'testid' });
      expect(id).toBe('testid');
    });
  });

  describe('count', () => {
    it('retorna cantidad de cursos', async () => {
      const countSpy = jest.spyOn(Course as any, 'count').mockResolvedValue(10);
      const count = await service.count();
      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(count).toBe(10);
    });
  });
});
