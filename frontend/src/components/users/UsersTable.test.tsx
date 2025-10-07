import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import UsersTable from './UsersTable';

// Mock Modal para evitar problemas de portal en test
jest.mock('../shared/Modal', () => (props) => <>{props.children}</>);

const mockUsers = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    username: 'juanp',
    role: 'admin',
    isActive: true,
  },
  {
    id: '2',
    firstName: 'Ana',
    lastName: 'García',
    username: 'anag',
    role: 'user',
    isActive: false,
  },
];

const defaultProps = {
  users: mockUsers,
  isLoading: false,
  visibleParams: { page: 1, limit: 10 },
  total: 2,
  onPageChange: jest.fn(),
};

jest.mock('../../features/users/users.hooks', () => ({
  useDeleteUser: () => ({ mutateAsync: jest.fn() }),
  useUpdateUser: () => ({ mutateAsync: jest.fn() }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('UsersTable', () => {
  it('renderiza la tabla con usuarios', () => {
    render(
      <MemoryRouter>
        <UsersTable {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('juanp')).toBeInTheDocument();
    expect(screen.getByText('anag')).toBeInTheDocument();
  });

  it('muestra el estado de loading', () => {
    render(
      <MemoryRouter>
        <UsersTable {...defaultProps} isLoading={true} />
      </MemoryRouter>,
    );
    // No se renderizan usuarios
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('empty')).not.toBeInTheDocument();
  });

  it('muestra el estado vacío', () => {
    render(
      <MemoryRouter>
        <UsersTable {...defaultProps} users={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
