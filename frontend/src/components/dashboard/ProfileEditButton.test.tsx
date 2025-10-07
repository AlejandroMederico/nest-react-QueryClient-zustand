import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import ProfileEditButton from './ProfileEditButton';

// Mock UpdateProfile para evitar dependencias y errores de hooks
jest.mock('./UpdateProfile', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="update-profile">
      UpdateProfileMock <button onClick={onClose}>Cerrar</button>
    </div>
  ),
}));

describe('ProfileEditButton', () => {
  it('renderiza el botón de editar perfil', () => {
    render(<ProfileEditButton />);
    expect(
      screen.getByRole('button', { name: /editar perfil/i }),
    ).toBeInTheDocument();
  });

  it('muestra el componente UpdateProfile al hacer click', () => {
    render(<ProfileEditButton />);
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));
    expect(screen.getByTestId('update-profile')).toBeInTheDocument();
  });

  it('cierra el componente UpdateProfile al hacer click en cerrar', () => {
    render(<ProfileEditButton />);
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));
    expect(screen.getByTestId('update-profile')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/cerrar/i));
    expect(screen.queryByTestId('update-profile')).not.toBeInTheDocument();
  });
});
