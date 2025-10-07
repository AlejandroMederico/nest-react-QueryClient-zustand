import Content from '../../models/content/Content';
import ContentQuery from '../../models/content/ContentQuery';
import CreateContentRequest from '../../models/content/CreateContentRequest';
import UpdateContentRequest from '../../models/content/UpdateContentRequest';
import apiService from '../ApiService';
import { contentService } from '../ContentService';

jest.mock('../ApiService');
const mockedApi = apiService as jest.Mocked<typeof apiService>;

describe('ContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findLatestGlobal returns latest contents', async () => {
    const mockContents: Content[] = [
      {
        id: '1',
        name: 'A',
        description: '',
        dateCreated: new Date(),
        image: null,
      },
    ];
    mockedApi.get.mockResolvedValueOnce({ data: mockContents } as any);
    const result = await contentService.findLatestGlobal(3);
    expect(result).toEqual(mockContents);
    expect(mockedApi.get).toHaveBeenCalledWith('/contents/latest', {
      params: { limit: 3 },
    });
  });

  it('save posts new content', async () => {
    mockedApi.post.mockResolvedValueOnce({});
    const req: CreateContentRequest = {
      name: 'Test',
      description: 'Desc',
      image: undefined,
    };
    await contentService.save('course1', req);
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/courses/course1/contents',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });

  it('findAll returns contents and meta', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          name: 'A',
          description: '',
          dateCreated: new Date(),
          image: null,
        },
      ],
      meta: { page: 1, limit: 10, total: 1 },
    };
    mockedApi.get.mockResolvedValueOnce({ data: mockResponse } as any);
    const query: ContentQuery = {};
    const result = await contentService.findAll('course1', query);
    expect(result).toEqual(mockResponse);
    expect(mockedApi.get).toHaveBeenCalledWith('/courses/course1/contents', {
      params: query,
    });
  });

  it('findOne returns a content', async () => {
    const mockContent: Content = {
      id: '1',
      name: 'A',
      description: '',
      dateCreated: new Date(),
      image: null,
    };
    mockedApi.get.mockResolvedValueOnce({ data: mockContent } as any);
    const result = await contentService.findOne('course1', '1');
    expect(result).toEqual(mockContent);
    expect(mockedApi.get).toHaveBeenCalledWith('/courses/course1/contents/1');
  });

  it('update puts updated content', async () => {
    mockedApi.put.mockResolvedValueOnce({});
    const req: UpdateContentRequest = {
      name: 'Updated',
      description: 'Desc',
      image: undefined,
    };
    await contentService.update('course1', '1', req);
    expect(mockedApi.put).toHaveBeenCalledWith(
      '/courses/course1/contents/1',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });

  it('delete removes a content', async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    await contentService.delete('course1', '1');
    expect(mockedApi.delete).toHaveBeenCalledWith(
      '/courses/course1/contents/1',
    );
  });
});
