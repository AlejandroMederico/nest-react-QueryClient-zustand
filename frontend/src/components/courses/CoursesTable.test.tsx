import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import CoursesTable from './CoursesTable';

// Mock Modal para evitar problemas de portal en test
jest.mock('../shared/Modal', () => (props) => <>{props.children}</>);

const mockCourses = [
  {
    id: '1',
    name: 'Curso 1',
    description: 'Descripción 1',
    dateCreated: new Date(),
  },
  {
    id: '2',
    name: 'Curso 2',
    description: 'Descripción 2',
    dateCreated: new Date(),
  },
];

const defaultProps = {
  courses: mockCourses,
  isLoading: false,
  total: 2,
  page: 1,
  limit: 10,
  onPageChange: jest.fn(),
};

jest.mock('../../store/authStore', () => () => ({
  authenticatedUser: { role: 'admin', id: 'user1' },
}));
jest.mock('../../store/courseStore', () => () => ({
  deleteCourse: jest.fn(),
  updateCourse: jest.fn(),
  fetchCourses: jest.fn(),
}));
jest.mock('../../store/favoriteStore', () => ({
  useFavoriteStore: () => ({
    toggleFavorite: jest.fn(),
    loading: false,
    fetchFavorites: jest.fn(),
    isFavorite: () => false,
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('CoursesTable', () => {
  it('renderiza la tabla con cursos', () => {
    render(
      <MemoryRouter>
        <CoursesTable {...defaultProps} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Curso 1')).toBeInTheDocument();
    expect(screen.getByText('Curso 2')).toBeInTheDocument();
  });

  it('muestra el estado de loading', () => {
    render(
      <MemoryRouter>
        <CoursesTable {...defaultProps} isLoading={true} />
      </MemoryRouter>,
    );
    // No se renderizan cursos
    expect(screen.queryByText('Curso 1')).not.toBeInTheDocument();
    expect(screen.queryByText('empty')).not.toBeInTheDocument();
  });

  it('muestra el estado vacío', () => {
    render(
      <MemoryRouter>
        <CoursesTable {...defaultProps} courses={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
