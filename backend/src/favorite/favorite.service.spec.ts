import { HttpException } from '@nestjs/common';

import { FavoriteService } from './favorite.service';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let favoriteRepo: any;
  let userRepo: any;
  let courseRepo: any;

  beforeEach(() => {
    favoriteRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
    };
    userRepo = { findOne: jest.fn() };
    courseRepo = { findOne: jest.fn() };
    service = new FavoriteService(favoriteRepo, userRepo, courseRepo);
  });

  it('addFavorite agrega si no existe y retorna favorito', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    favoriteRepo.findOne.mockResolvedValue(null);
    favoriteRepo.create.mockReturnValue({
      user: { id: 'u1' },
      course: { id: 'c1' },
    });
    favoriteRepo.save.mockResolvedValue({
      id: 'f1',
      user: { id: 'u1' },
      course: { id: 'c1' },
    });
    const res = await service.addFavorite('u1', 'c1');
    expect(res).toEqual({ id: 'f1', user: { id: 'u1' }, course: { id: 'c1' } });
  });

  it('addFavorite retorna existente si ya existe', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    favoriteRepo.findOne.mockResolvedValue({ id: 'f2' });
    const res = await service.addFavorite('u1', 'c1');
    expect(res).toEqual({ id: 'f2' });
  });

  it('addFavorite lanza error si usuario o curso no existe', async () => {
    userRepo.findOne.mockResolvedValue(null);
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    await expect(service.addFavorite('uX', 'c1')).rejects.toThrow(
      HttpException,
    );
  });

  it('removeFavorite elimina si existe', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    favoriteRepo.findOne.mockResolvedValue({ id: 'f3' });
    favoriteRepo.remove.mockResolvedValue(undefined);
    const res = await service.removeFavorite('u1', 'c1');
    expect(res).toEqual({ removed: true });
  });

  it('removeFavorite lanza error si favorito no existe', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    favoriteRepo.findOne.mockResolvedValue(null);
    await expect(service.removeFavorite('u1', 'c1')).rejects.toThrow(
      HttpException,
    );
  });

  it('listFavorites retorna cursos favoritos', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    favoriteRepo.find.mockResolvedValue([
      { course: { id: 'c1' } },
      { course: { id: 'c2' } },
    ]);
    const res = await service.listFavorites('u1');
    expect(res).toEqual([{ id: 'c1' }, { id: 'c2' }]);
  });

  it('listFavorites lanza error si usuario no existe', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.listFavorites('uX')).rejects.toThrow(HttpException);
  });

  it('isFavorite retorna true si existe', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    favoriteRepo.findOne.mockResolvedValue({ id: 'f4' });
    const res = await service.isFavorite('u1', 'c1');
    expect(res).toBe(true);
  });

  it('isFavorite retorna false si no existe', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    favoriteRepo.findOne.mockResolvedValue(null);
    const res = await service.isFavorite('u1', 'c1');
    expect(res).toBe(false);
  });

  it('isFavorite retorna false si usuario o curso no existe', async () => {
    userRepo.findOne.mockResolvedValue(null);
    courseRepo.findOne.mockResolvedValue({ id: 'c1' });
    const res = await service.isFavorite('uX', 'c1');
    expect(res).toBe(false);
  });
});
