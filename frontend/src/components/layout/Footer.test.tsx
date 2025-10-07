import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import Footer from './Footer';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Footer', () => {
  it('renders the current year and contact link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(year, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('contact_link')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'contact_link' })).toHaveAttribute(
      'href',
      '/contact',
    );
  });
});
