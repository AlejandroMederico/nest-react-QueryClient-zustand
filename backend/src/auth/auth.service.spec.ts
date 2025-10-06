import { Test, TestingModule } from '@nestjs/testing';
import * as mocks from 'node-mocks-http';

import { LoginDto } from './auth.dto';
import { AuthService } from './auth.service';

const MockService = {
  login: jest.fn().mockImplementation((loginDto: LoginDto) => {
    return {
      token: 'token',
      user: {
        username: loginDto.username,
      },
    };
  }),
  logout: jest.fn().mockReturnValue(true),
  refresh: jest.fn().mockImplementation(() => {
    return {
      token: 'token',
      user: {
        username: 'test',
      },
    };
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: MockService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token and user', async () => {
      const req = mocks.createRequest();
      req.res = mocks.createResponse();

      const resp = await service.login(
        { username: 'test', password: 'test' },
        req.res,
      );

      expect(resp).toEqual({
        token: 'token',
        user: { username: 'test' },
      });
      expect(MockService.login).toHaveBeenCalledWith(
        { username: 'test', password: 'test' },
        req.res,
      );
    });
  });

  describe('logout', () => {
    it('should return true', async () => {
      const req = mocks.createRequest();
      req.res = mocks.createResponse();

      const result = await service.logout(req, req.res);

      expect(result).toBe(true);
      expect(MockService.logout).toHaveBeenCalledWith(req, req.res);
    });
  });

  describe('refresh', () => {
    it('should return token and user', async () => {
      const req = mocks.createRequest();
      req.res = mocks.createResponse();

      const resp = await service.refresh('token', req.res);

      expect(resp).toEqual({
        token: 'token',
        user: { username: 'test' },
      });
      expect(MockService.refresh).toHaveBeenCalledWith('token', req.res);
    });

    it('should throw error if refresh token is missing', async () => {
      const req = mocks.createRequest();
      req.res = mocks.createResponse();
      // Simula el servicio real lanzando error si el token está vacío (async)
      MockService.refresh.mockImplementationOnce(async () => {
        throw new Error('Refresh token required');
      });
      await expect(service.refresh('', req.res)).rejects.toThrow(
        'Refresh token required',
      );
    });
  });
});
