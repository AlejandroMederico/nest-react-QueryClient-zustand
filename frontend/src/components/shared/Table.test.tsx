import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import Table from './Table';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('Table', () => {
  it('renderiza las columnas y los hijos', () => {
    render(
      <Table columns={['Columna 1', 'Columna 2']}>
        <tr>
          <td>Dato 1</td>
          <td>Dato 2</td>
        </tr>
      </Table>,
    );
    expect(screen.getByText('Columna 1')).toBeInTheDocument();
    expect(screen.getByText('Columna 2')).toBeInTheDocument();
    expect(screen.getByText('Dato 1')).toBeInTheDocument();
    expect(screen.getByText('Dato 2')).toBeInTheDocument();
    // El span de edit (sr-only)
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('renderiza correctamente sin hijos', () => {
    render(
      <Table columns={['A', 'B']}>
        <></>
      </Table>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
