import CreateUserRequest from '../../models/user/CreateUserRequest';
import UpdateUserRequest from '../../models/user/UpdateUserRequest';
import User from '../../models/user/User';
import { UsersListParams } from '../../models/user/UserQuery';
import apiService from '../ApiService';
import { userService } from '../UserService';

describe('UserService', () => {
  let getSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;
  let putSpy: jest.SpyInstance;
  let deleteSpy: jest.SpyInstance;

  beforeEach(() => {
    getSpy = jest.spyOn(apiService, 'get');
    postSpy = jest.spyOn(apiService, 'post');
    putSpy = jest.spyOn(apiService, 'put');
    deleteSpy = jest.spyOn(apiService, 'delete');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listUsers returns users and meta', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          username: 'user1',
          firstName: 'A',
          lastName: 'B',
          role: 'user',
          isActive: true,
        },
      ],
      meta: { page: 1, limit: 10, total: 1 },
    };
    getSpy.mockResolvedValueOnce({ data: mockResponse } as any);
    const params: UsersListParams = { page: 1, limit: 10 };
    const result = await userService.listUsers(params);
    expect(result).toEqual(mockResponse);
    expect(getSpy).toHaveBeenCalledWith('/users?page=1&limit=10');
  });

  it('findOne returns a user', async () => {
    const mockUser: User = {
      id: '1',
      username: 'user1',
      firstName: 'A',
      lastName: 'B',
      role: 'user',
      isActive: true,
    };
    getSpy.mockResolvedValueOnce({ data: mockUser } as any);
    const result = await userService.findOne('1');
    expect(result).toEqual(mockUser);
    expect(getSpy).toHaveBeenCalledWith('/users/1');
  });

  it('createUser posts and returns user', async () => {
    const payload: CreateUserRequest = {
      username: 'newuser',
      firstName: 'N',
      lastName: 'U',
      password: 'pass',
      role: 'user',
    };
    const mockUser: User = {
      id: '2',
      username: 'newuser',
      firstName: 'N',
      lastName: 'U',
      role: 'user',
      isActive: true,
    };
    postSpy.mockResolvedValueOnce({ data: mockUser } as any);
    const result = await userService.createUser(payload);
    expect(result).toEqual(mockUser);
    expect(postSpy).toHaveBeenCalledWith('/users', payload);
  });

  it('updateUser puts and returns user', async () => {
    const payload: UpdateUserRequest = { firstName: 'Updated' };
    const mockUser: User = {
      id: '1',
      username: 'user1',
      firstName: 'Updated',
      lastName: 'B',
      role: 'user',
      isActive: true,
    };
    putSpy.mockResolvedValueOnce({ data: mockUser } as any);
    const result = await userService.updateUser('1', payload);
    expect(result).toEqual(mockUser);
    expect(putSpy).toHaveBeenCalledWith('/users/1', payload);
  });

  it('deleteUser deletes and returns true', async () => {
    deleteSpy.mockResolvedValueOnce({});
    const result = await userService.deleteUser('1');
    expect(result).toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith('/users/1');
  });
});
