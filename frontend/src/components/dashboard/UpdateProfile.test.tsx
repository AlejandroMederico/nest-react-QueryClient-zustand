import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-query', () => ({
  useQuery: () => ({
    data: {
      id: 'user1',
      firstName: 'Juan',
      lastName: 'Pérez',
      username: 'juanp',
    },
    isLoading: false,
    refetch: jest.fn(),
  }),
}));
jest.mock('../../store/authStore', () => () => ({
  authenticatedUser: { id: 'user1' },
}));
jest.mock('../../services/UserService', () => ({
  userService: {
    findOne: jest.fn(),
    updateUser: jest.fn().mockResolvedValue({}),
  },
}));

describe('UpdateProfile', () => {
  it('renderiza el formulario con los datos del usuario', () => {
    const UpdateProfile = require('./UpdateProfile').default;
    render(<UpdateProfile />);
    expect(screen.getByText(/welcome/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('juanp')).toBeInTheDocument();
  });

  it('permite actualizar el perfil', async () => {
    const UpdateProfile = require('./UpdateProfile').default;
    render(<UpdateProfile />);
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'Carlos' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Ramírez' },
    });
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'carlitos' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Password (min 6 characters)'),
      { target: { value: '123456' } },
    );
    fireEvent.click(screen.getByText('Update'));
    // No hay error, el formulario se procesa
    expect(await screen.findByText(/welcome/)).toBeInTheDocument();
  });
});
