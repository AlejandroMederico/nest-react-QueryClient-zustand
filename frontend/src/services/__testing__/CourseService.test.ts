import Course from '../../models/course/Course';
import CourseQuery from '../../models/course/CourseQuery';
import CreateCourseRequest from '../../models/course/CreateCourseRequest';
import UpdateCourseRequest from '../../models/course/UpdateCourseRequest';
import apiService from '../ApiService';
import { courseService } from '../CourseService';

jest.mock('../ApiService');
const mockedApi = apiService as jest.Mocked<typeof apiService>;

describe('CourseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('save posts new course', async () => {
    mockedApi.post.mockResolvedValueOnce({});
    const req: CreateCourseRequest = {
      name: 'Test Course',
      description: 'Desc',
    };
    await courseService.save(req);
    expect(mockedApi.post).toHaveBeenCalledWith('/courses', req);
  });

  it('findAll returns courses and meta', async () => {
    const mockResponse = {
      data: [{ id: '1', name: 'A', description: '', dateCreated: new Date() }],
      meta: { page: 1, limit: 10, total: 1 },
    };
    mockedApi.get.mockResolvedValueOnce({ data: mockResponse } as any);
    const query: CourseQuery = {};
    const result = await courseService.findAll(query);
    expect(result).toEqual(mockResponse);
    expect(mockedApi.get).toHaveBeenCalledWith('/courses', { params: query });
  });

  it('findOne returns a course', async () => {
    const mockCourse: Course = {
      id: '1',
      name: 'A',
      description: '',
      dateCreated: new Date(),
    };
    mockedApi.get.mockResolvedValueOnce({ data: mockCourse } as any);
    const result = await courseService.findOne('1');
    expect(result).toEqual(mockCourse);
    expect(mockedApi.get).toHaveBeenCalledWith('/courses/1');
  });

  it('update puts updated course', async () => {
    mockedApi.put.mockResolvedValueOnce({});
    const req: UpdateCourseRequest = { name: 'Updated', description: 'Desc' };
    await courseService.update('1', req);
    expect(mockedApi.put).toHaveBeenCalledWith('/courses/1', req);
  });

  it('delete removes a course', async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    await courseService.delete('1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/courses/1');
  });
});
