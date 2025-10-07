import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import ContentsTable from './ContentsTable';

jest.mock('../shared/Modal', () => (props) => <>{props.children}</>);

const mockContents = [
  {
    id: '1',
    name: 'Content 1',
    description: 'Desc 1',
    dateCreated: new Date(),
    image: '',
  },
  {
    id: '2',
    name: 'Content 2',
    description: 'Desc 2',
    dateCreated: new Date(),
    image: '',
  },
];

const defaultProps = {
  contents: mockContents,
  courseId: 'course1',
  isLoading: false,
  total: 2,
  page: 1,
  limit: 10,
  onPageChange: jest.fn(),
};

jest.mock('../../store/authStore', () => () => ({
  authenticatedUser: { role: 'admin' },
}));
jest.mock('../../store/contentStore', () => () => ({
  deleteContent: jest.fn(),
  updateContent: jest.fn(),
  fetchContents: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ContentsTable', () => {
  it('shows loading state', () => {
    render(<ContentsTable {...defaultProps} isLoading={true} />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<ContentsTable {...defaultProps} contents={[]} />);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
