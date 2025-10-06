import { Test, TestingModule } from '@nestjs/testing';

import {
  FavoriteController,
  UserFavoritesController,
} from './favorite.controller';
import { FavoriteService } from './favorite.service';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: FavoriteService;

  const mockFavoriteService = {
    addFavorite: jest.fn().mockResolvedValue('added'),
    removeFavorite: jest.fn().mockResolvedValue('removed'),
    isFavorite: jest.fn().mockResolvedValue(true),
    listFavorites: jest.fn().mockResolvedValue(['course1', 'course2']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [{ provide: FavoriteService, useValue: mockFavoriteService }],
    }).compile();

    controller = module.get<FavoriteController>(FavoriteController);
    service = module.get<FavoriteService>(FavoriteService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('add llama al servicio con userId y courseId', async () => {
    const req = { user: { userId: 'u1' } };
    const res = await controller.add(req, 'c1');
    expect(service.addFavorite).toHaveBeenCalledWith('u1', 'c1');
    expect(res).toBe('added');
  });

  it('remove llama al servicio con userId y courseId', async () => {
    const req = { user: { userId: 'u2' } };
    const res = await controller.remove(req, 'c2');
    expect(service.removeFavorite).toHaveBeenCalledWith('u2', 'c2');
    expect(res).toBe('removed');
  });

  it('isFavorite llama al servicio con userId y courseId', async () => {
    const req = { user: { userId: 'u3' } };
    const res = await controller.isFavorite(req, 'c3');
    expect(service.isFavorite).toHaveBeenCalledWith('u3', 'c3');
    expect(res).toBe(true);
  });
});

describe('UserFavoritesController', () => {
  let controller: UserFavoritesController;
  let service: FavoriteService;

  const mockFavoriteService = {
    listFavorites: jest.fn().mockResolvedValue(['courseA', 'courseB']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFavoritesController],
      providers: [{ provide: FavoriteService, useValue: mockFavoriteService }],
    }).compile();

    controller = module.get<UserFavoritesController>(UserFavoritesController);
    service = module.get<FavoriteService>(FavoriteService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('list llama al servicio con userId', async () => {
    const res = await controller.list('userX');
    expect(service.listFavorites).toHaveBeenCalledWith('userX');
    expect(res).toEqual(['courseA', 'courseB']);
  });
});
