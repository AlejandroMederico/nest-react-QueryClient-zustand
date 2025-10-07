import axios from 'axios';

import { ContactForm } from '../../models/contact/ContactForm';
import { sendContact } from '../ContactService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ContactService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send contact form and return response data', async () => {
    const form: ContactForm = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, this is a test message.',
    };
    const mockResponse = { success: true, message: 'Received' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await sendContact(form);
    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/contact', form);
  });
});
