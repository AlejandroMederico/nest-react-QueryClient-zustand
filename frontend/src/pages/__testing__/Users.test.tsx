import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import Users from '../Users';
// Mock Sidebar para evitar errores de contexto
jest.mock('../../components/layout/Sidebar', () => () => (
  <div data-testid="sidebar">Sidebar</div>
));
// Mock authStore (donde está el hook useAuth)
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    authenticatedUser: { role: 'admin', username: 'testuser' },
    setAuthenticatedUser: jest.fn(),
    token: 'mocktoken',
  })),
}));

// Mock translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
// Mock react-query hooks
jest.mock('../../features/users/users.hooks', () => ({
  useUsersList: jest.fn(),
  useCreateUser: jest.fn(() => ({ mutateAsync: jest.fn() })),
  useDeleteUser: jest.fn(() => ({ mutateAsync: jest.fn() })),
  useUpdateUser: jest.fn(() => ({ mutateAsync: jest.fn() })),
}));
// Mock Modal portal
jest.mock(
  '../../components/shared/Modal',
  () => (props: any) =>
    props.show ? <div data-testid="modal">{props.children}</div> : null,
);

const { useUsersList } = require('../../features/users/users.hooks');

const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    role: 'admin',
    isActive: true,
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    username: 'janesmith',
    role: 'user',
    isActive: false,
  },
];

beforeEach(() => {
  useUsersList.mockImplementation(() => ({
    data: { data: mockUsers, meta: { total: 2 } },
    isFetching: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }));
});

describe('Users page', () => {
  it('renders users table with users', () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Users />
      </Router>,
    );
    expect(screen.getByText('manage_users')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('janesmith')).toBeInTheDocument();
  });

  it('shows empty message when no users', () => {
    useUsersList.mockImplementation(() => ({
      data: { data: [], meta: { total: 0 } },
      isFetching: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    }));
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Users />
      </Router>,
    );
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('shows error message when isError', () => {
    useUsersList.mockImplementation(() => ({
      data: undefined,
      isFetching: false,
      isError: true,
      error: { message: 'Test error' },
      refetch: jest.fn(),
    }));
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Users />
      </Router>,
    );
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('opens add user modal when clicking add button', async () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Users />
      </Router>,
    );
    fireEvent.click(screen.getByText('add_user'));
    // Espera a que aparezca el modal
    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();
    // Busca el título dentro del modal usando getByText con selector
    expect(
      screen.getByText('add_user', { selector: 'h1' }),
    ).toBeInTheDocument();
  });
});
