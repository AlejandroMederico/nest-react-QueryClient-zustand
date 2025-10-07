import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ContactPage from '../Contact';

// Unifica mocks antes de importar ContactPage
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
const mockSendContact = jest.fn(async () => ({ success: true }));
jest.mock('../../services/ContactService', () => ({
  sendContact: (...args: any[]) => mockSendContact.apply(null, args),
}));
jest.mock('../../assets/favicon.png', () => 'logo.png');
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
  MemoryRouter: ({ children }) => <div>{children}</div>,
}));

describe('ContactPage', () => {
  beforeEach(() => {
    mockSendContact.mockClear();
    mockPush.mockClear();
  });

  it('renders contact form and submits successfully', async () => {
    mockSendContact.mockResolvedValueOnce({ success: true });
    render(<ContactPage />);
    expect(screen.getByPlaceholderText('name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('message')).toBeInTheDocument();
    expect(screen.getByText('send')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('message'), {
      target: { value: 'Hello!' },
    });
    fireEvent.click(screen.getByText('send'));

    await waitFor(() => {
      expect(screen.getByText('message_sent_successfully')).toBeInTheDocument();
    });
  });

  it('shows error when sendContact fails', async () => {
    mockSendContact.mockRejectedValueOnce(new Error('fail'));
    render(<ContactPage />);
    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('message'), {
      target: { value: 'Hello!' },
    });
    fireEvent.click(screen.getByText('send'));

    await waitFor(() => {
      expect(screen.getByText('error_sending_mail')).toBeInTheDocument();
    });
  });
});
