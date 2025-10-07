import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import Courses from '../Courses';
// Mock Sidebar para evitar errores de contexto
jest.mock('../../components/layout/Sidebar', () => () => (
  <div data-testid="sidebar">Sidebar</div>
));
// Mock authStore (donde está el hook useAuth)
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    authenticatedUser: { role: 'admin', username: 'testuser' },
    setAuthenticatedUser: jest.fn(),
    token: 'mocktoken',
  }),
}));

// Mock translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
// Mock Zustand course store
const mockSetFilters = jest.fn();
const mockSetPage = jest.fn();
const mockFetchCourses = jest.fn();
const mockAddCourse = jest.fn();
jest.mock('../../store/courseStore', () => ({
  __esModule: true,
  default: (selector: any) =>
    selector({
      courses: [
        {
          id: '1',
          name: 'React Básico',
          description: 'Curso de introducción a React',
        },
        {
          id: '2',
          name: 'NestJS Pro',
          description: 'Backend avanzado con NestJS',
        },
      ],
      loading: false,
      error: null,
      filters: {},
      page: 1,
      limit: 10,
      total: 2,
      setFilters: mockSetFilters,
      setPage: mockSetPage,
      fetchCourses: mockFetchCourses,
      addCourse: mockAddCourse,
    }),
}));
// Mock Modal portal
jest.mock(
  '../../components/shared/Modal',
  () => (props: any) =>
    props.show ? <div data-testid="modal">{props.children}</div> : null,
);

const mockCourses = [
  {
    id: '1',
    name: 'React Básico',
    description: 'Curso de introducción a React',
  },
  {
    id: '2',
    name: 'NestJS Pro',
    description: 'Backend avanzado con NestJS',
  },
];

describe('Courses page', () => {
  beforeEach(() => {
    jest.resetModules();
    // Reset mock implementation for each test
    jest.doMock('../../store/courseStore', () => ({
      __esModule: true,
      default: (selector: any) =>
        selector({
          courses: mockCourses,
          loading: false,
          error: null,
          filters: {},
          page: 1,
          limit: 10,
          total: 2,
          setFilters: mockSetFilters,
          setPage: mockSetPage,
          fetchCourses: mockFetchCourses,
          addCourse: mockAddCourse,
        }),
    }));
  });

  it('renders courses table with courses', () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Courses />
      </Router>,
    );
    expect(screen.getByText('manage_courses')).toBeInTheDocument();
    expect(screen.getByText('React Básico')).toBeInTheDocument();
    expect(screen.getByText('NestJS Pro')).toBeInTheDocument();
    expect(
      screen.getByText('Curso de introducción a React'),
    ).toBeInTheDocument();
    expect(screen.getByText('Backend avanzado con NestJS')).toBeInTheDocument();
  });


  it('opens add course modal when clicking add button', async () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Courses />
      </Router>,
    );
    fireEvent.click(screen.getByText('add_course'));
    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();
    expect(
      screen.getByText('add_course', { selector: 'h1' }),
    ).toBeInTheDocument();
  });
});
