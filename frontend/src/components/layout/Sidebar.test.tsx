import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import Sidebar from './Sidebar';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useHistory: () => ({ push: jest.fn() }),
  };
});
jest.mock('../../store/authStore', () => () => ({
  authenticatedUser: { role: 'user' },
  setAuthenticatedUser: jest.fn(),
}));
jest.mock('../../services/AuthService', () => ({
  authService: { logout: jest.fn() },
}));
jest.mock('./SidebarItem', () => ({
  __esModule: true,
  default: ({ children, to }: any) => (
    <div data-testid={`sidebar-item-${to}`}>{children}</div>
  ),
}));

describe('Sidebar', () => {
  it('renders sidebar and items', () => {
    render(
      <MemoryRouter>
        <Sidebar className="test-class" />
      </MemoryRouter>,
    );
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-item-/')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-item-/courses')).toBeInTheDocument();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('courses')).toBeInTheDocument();
    expect(screen.getByText('logout')).toBeInTheDocument();
  });
});
