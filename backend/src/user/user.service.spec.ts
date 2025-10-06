import { HttpException } from '@nestjs/common';

import { User } from './user.entity';
import { UserService } from './user.service';

const ensureStatic = (klass: any, key: string) => {
  if (typeof klass[key] !== 'function') {
    klass[key] = () => undefined; // función dummy
  }
  return jest.spyOn(klass, key as any);
};

describe('UserService (sin DB, con stubs)', () => {
  let service: UserService;
  let repoMock: any;

  beforeEach(() => {
    // Mock del repositorio con los métodos usados en el servicio
    repoMock = {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    service = new UserService(repoMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('save (create)', () => {
    it('crea usuario cuando username no existe', async () => {
      // Si save() llama internamente a service.findByUsername(..), lo stub-eamos:
      const spyFindByUsername = jest
        .spyOn(service as any, 'findByUsername')
        .mockResolvedValue(null);

      // User.create().save()
      const spyCreate = ensureStatic(User as any, 'create');
      const saveMock = jest.fn().mockResolvedValue({
        id: 'u1',
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
      });
      spyCreate.mockReturnValue({
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        save: saveMock,
      });

      const dto: any = {
        username: 'alice',
        password: 'Secret123!',
        firstName: 'Alice',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
      };

      const out = await service.save(dto);

      expect(spyFindByUsername).toHaveBeenCalledWith('alice');
      expect(spyCreate).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(saveMock).toHaveBeenCalled();
      expect(out).toMatchObject({ username: 'alice' });
    });

    it('cuando username ya existe, lanza HttpException (envuelto por el servicio)', async () => {
      jest.spyOn(service as any, 'findByUsername').mockResolvedValue({
        id: 'uX',
        username: 'alice',
      });

      await expect(
        service.save({ username: 'alice', password: 'x' } as any),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('findAll', () => {
    it('devuelve lista de usuarios y meta', async () => {
      // Simula estructura de respuesta del servicio real
      const users = [
        { id: 'u1', username: 'alice' },
        { id: 'u2', username: 'bob' },
      ];
      // Mock del QueryBuilder y getManyAndCount
      const qbMock = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([users, 2]),
      };
      (service as any).repo = {
        createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      };
      const query = { page: 1, limit: 10, sort: 'createdAt', order: 'desc' };
      const out = await service.findAll(query as any);
      expect((service as any).repo.createQueryBuilder).toHaveBeenCalledWith(
        'u',
      );
      expect(qbMock.getManyAndCount).toHaveBeenCalled();
      expect(out.data).toHaveLength(2);
      expect(out.data[0].username).toBe('alice');
      expect(out.meta.page).toBe(1);
      expect(out.meta.limit).toBe(10);
      expect(out.meta.total).toBe(2);
    });

    it('si falla debajo, lanza HttpException (envuelto)', async () => {
      // Mock del QueryBuilder para lanzar error
      const qbMock = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockRejectedValue(new Error('boom')),
      };
      (service as any).repo = {
        createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      };
      const query = { page: 1, limit: 10, sort: 'createdAt', order: 'desc' };
      await expect(service.findAll(query as any)).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });

  describe('findById', () => {
    it('devuelve un usuario por id', async () => {
      const spyFindOne = ensureStatic(User as any, 'findOne');
      spyFindOne.mockResolvedValue({ id: 'u1', username: 'alice' });

      const out = await service.findById('u1');

      expect(spyFindOne).toHaveBeenCalledWith('u1');
      expect(out).toMatchObject({ id: 'u1' });
    });

    it('si no existe, el servicio termina lanzando HttpException (por su wrapper)', async () => {
      const spyFindOne = ensureStatic(User as any, 'findOne');
      spyFindOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });

  describe('update', () => {
    it('actualiza usuario existente', async () => {
      // findById interno usa findOne
      const spyFindOne = ensureStatic(User as any, 'findOne');
      spyFindOne.mockResolvedValueOnce({ id: 'u1', username: 'alice' });

      // create({ id, ...update }).save()
      const spyCreate = ensureStatic(User as any, 'create');
      const saveMock = jest.fn().mockResolvedValue({
        id: 'u1',
        username: 'alice',
        firstName: 'Alicia',
      });
      spyCreate.mockReturnValue({
        id: 'u1',
        firstName: 'Alicia',
        save: saveMock,
      });

      const out = await service.update('u1', { firstName: 'Alicia' } as any);

      expect(spyFindOne).toHaveBeenCalledWith('u1');
      expect(spyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u1', firstName: 'Alicia' }),
      );
      expect(saveMock).toHaveBeenCalled();
      expect(out).toMatchObject({ firstName: 'Alicia' });
    });

    it('si no existe, termina lanzando HttpException (envuelto)', async () => {
      const spyFindOne = ensureStatic(User as any, 'findOne');
      spyFindOne.mockResolvedValueOnce(null);

      await expect(
        service.update('missing', { firstName: 'X' } as any),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('delete', () => {
    it('elimina usuario existente', async () => {
      const spyFindOne = ensureStatic(User as any, 'findOne');
      spyFindOne.mockResolvedValueOnce({ id: 'u1' });

      const spyDelete = ensureStatic(User as any, 'delete');
      spyDelete.mockResolvedValueOnce({ affected: 1 });

      const ok = await service.delete('u1');

      expect(spyFindOne).toHaveBeenCalledWith('u1');
      expect(spyDelete).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u1' }),
      );
      expect(ok).toBe('u1');
    });

    it('si no existe, termina lanzando HttpException (envuelto)', async () => {
      const spyFindOne = ensureStatic(User as any, 'findOne');
      spyFindOne.mockResolvedValueOnce(null);

      await expect(service.delete('missing')).rejects.toBeInstanceOf(
        HttpException,
      );
    });
  });
});
