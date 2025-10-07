import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import SidebarItem from './SidebarItem';

describe('SidebarItem', () => {
  it('renderiza el enlace con el texto y ruta correcta', () => {
    render(
      <MemoryRouter>
        <SidebarItem to="/dashboard">Dashboard</SidebarItem>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('aplica la clase activa cuando la ruta coincide', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <SidebarItem to="/dashboard">Dashboard</SidebarItem>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toHaveClass('bg-red-600');
    expect(link).toHaveClass('text-white');
  });
});
