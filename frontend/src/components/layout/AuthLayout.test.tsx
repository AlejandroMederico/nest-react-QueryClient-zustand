import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import AuthLayout from './AuthLayout';

jest.mock('../layout/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">FooterMock</div>,
}));

describe('AuthLayout', () => {
  it('renderiza los children y el Footer', () => {
    render(
      <AuthLayout>
        <div>Contenido de autenticación</div>
      </AuthLayout>,
    );
    expect(screen.getByText(/contenido de autenticación/i)).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
