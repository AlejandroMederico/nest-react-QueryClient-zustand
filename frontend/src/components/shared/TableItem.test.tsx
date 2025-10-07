import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import TableItem from './TableItem';

describe('TableItem', () => {
  it('renderiza el contenido correctamente', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableItem>Contenido</TableItem>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('aplica la clase adicional', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableItem className="extra">Texto</TableItem>
          </tr>
        </tbody>
      </table>,
    );
    const td = screen.getByRole('cell', { name: 'Texto' });
    expect(td).toHaveClass('extra');
  });
});
