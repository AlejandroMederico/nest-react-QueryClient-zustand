import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    login: jest.fn().mockResolvedValue({
      accessToken: 'jwt.token.mock',
      refreshToken: 'jwt.refresh.mock',
      user: { id: 'u1', username: 'admin', role: 'admin' },
    }),
    logout: jest.fn().mockResolvedValue(true),
    refresh: jest.fn().mockResolvedValue({
      accessToken: 'jwt.token.mock',
      refreshToken: 'jwt.refresh.mock',
      user: { id: 'u1', username: 'admin', role: 'admin' },
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  beforeEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('devuelve tokens y user (200)', async () => {
      const res: any = { cookie: jest.fn() };

      const out = await controller.login(
        { username: 'admin', password: 'secret' },
        res,
      );

      expect(authServiceMock.login).toHaveBeenCalledWith(
        { username: 'admin', password: 'secret' },
        res,
      );
      expect(out).toMatchObject({
        accessToken: expect.any(String),
        user: { username: 'admin' },
      });
    });

    it('lanza 401 si credenciales inválidas', async () => {
      const res: any = { cookie: jest.fn() };
      authServiceMock.login.mockRejectedValueOnce(
        new UnauthorizedException('Invalid username or password'),
      );

      await expect(
        controller.login({ username: 'admin', password: 'wrong' }, res),
      ).rejects.toMatchObject({ message: 'Invalid username or password' });
    });
  });

  describe('logout', () => {
    it('devuelve true', async () => {
      const req: any = {};
      const res: any = { clearCookie: jest.fn() };

      const ok = await controller.logout(req, res);

      expect(ok).toBe(true);
      expect(authServiceMock.logout).toHaveBeenCalledWith(req, res);
    });
  });

  describe('refresh', () => {
    it('devuelve nuevos tokens y llama a res.json', async () => {
      const req: any = {
        cookies: { 'refresh-token': 'r.jwt' },
      };
      const res: any = { cookie: jest.fn(), json: jest.fn() };

      authServiceMock.refresh.mockResolvedValueOnce({
        token: 'jwt.token.mock',
        user: { id: 'u1', username: 'admin', role: 'admin' },
      });

      await controller.refresh(req, res);

      expect(authServiceMock.refresh).toHaveBeenCalledWith('r.jwt', res);
      expect(res.json).toHaveBeenCalledWith({
        token: 'jwt.token.mock',
        user: { id: 'u1', username: 'admin', role: 'admin' },
      });
    });
  });
});
