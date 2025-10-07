import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import LatestUpdates from './LatestUpdates';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-query', () => ({
  useQuery: (key) => {
    if (key === 'latest-courses') {
      return {
        data: [
          {
            id: '1',
            name: 'Curso A',
            description: 'Desc A',
            dateCreated: new Date(),
          },
          {
            id: '2',
            name: 'Curso B',
            description: 'Desc B',
            dateCreated: new Date(),
          },
        ],
        isLoading: false,
      };
    }
    if (key === 'latest-contents') {
      return {
        data: [
          {
            id: '10',
            name: 'Contenido X',
            course: { name: 'Curso A' },
            dateCreated: new Date(),
          },
          {
            id: '11',
            name: 'Contenido Y',
            course: { name: 'Curso B' },
            dateCreated: new Date(),
          },
        ],
        isLoading: false,
      };
    }
    return { data: [], isLoading: false };
  },
}));

describe('LatestUpdates', () => {
  it('renderiza los cursos y contenidos más recientes', () => {
    render(<LatestUpdates />);
    expect(screen.getByText('latest_courses')).toBeInTheDocument();
    expect(screen.getByText('latest_contents')).toBeInTheDocument();
    expect(screen.getByText('Curso A')).toBeInTheDocument();
    expect(screen.getByText('Curso B')).toBeInTheDocument();
    expect(screen.getByText('Contenido X')).toBeInTheDocument();
    expect(screen.getByText('Contenido Y')).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('course')).length,
    ).toBeGreaterThan(0);
  });

  it('muestra loading si los datos están cargando', () => {
    jest.resetModules();
    jest.doMock('react-query', () => ({
      useQuery: () => ({ data: [], isLoading: true }),
    }));
    const LatestUpdatesLoading = require('./LatestUpdates').default;
    render(<LatestUpdatesLoading />);
    expect(
      screen.getAllByText((content) => content.includes('loading')).length,
    ).toBeGreaterThan(0);
  });
});
