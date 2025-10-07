import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { useQuery } from 'react-query';
import { Router } from 'react-router-dom';

import useAuth from '../../store/authStore';
import Dashboard from '../Dashboard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-query', () => ({
  useQuery: jest.fn(),
}));
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../services/StatsService');

const mockStats = {
  numberOfUsers: 10,
  numberOfCourses: 5,
  numberOfContents: 20,
};
const mockCourses = [
  {
    id: 1,
    name: 'Course 1',
    description: 'Desc 1',
    dateCreated: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Course 2',
    description: 'Desc 2',
    dateCreated: new Date().toISOString(),
  },
];
const mockContents = [
  {
    id: 1,
    name: 'Content 1',
    course: { name: 'Course 1' },
    dateCreated: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Content 2',
    course: { name: 'Course 2' },
    dateCreated: new Date().toISOString(),
  },
];

const mockAuthenticatedUser = {
  id: '1',
  username: 'admin',
  role: 'admin',
  firstName: 'A',
  lastName: 'B',
  isActive: true,
};
const mockUseAuth = useAuth as unknown as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

beforeEach(() => {
  mockUseAuth.mockReturnValue({ authenticatedUser: mockAuthenticatedUser });
  mockUseQuery.mockImplementation((key) => {
    if (key === 'stats') return { data: mockStats, isLoading: false };
    if (key === 'latest-courses')
      return { data: mockCourses, isLoading: false };
    if (key === 'latest-contents')
      return { data: mockContents, isLoading: false };
    return { data: undefined, isLoading: false };
  });
});

describe('Dashboard page', () => {
  it('renders dashboard stats for admin', () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Dashboard />
      </Router>,
    );
    expect(screen.getAllByText('dashboard').length).toBeGreaterThan(0);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getAllByText('users').length).toBeGreaterThan(0);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getAllByText('courses').length).toBeGreaterThan(0);
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getAllByText('contents').length).toBeGreaterThan(0);
  });

  it('renders dashboard stats for non-admin', () => {
    mockUseAuth.mockReturnValue({
      authenticatedUser: { ...mockAuthenticatedUser, role: 'user' },
    });
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Dashboard />
      </Router>,
    );
    expect(screen.queryByText('10')).not.toBeInTheDocument();
    expect(screen.getAllByText('courses').length).toBeGreaterThan(0);
    expect(screen.getAllByText('contents').length).toBeGreaterThan(0);
  });
});
