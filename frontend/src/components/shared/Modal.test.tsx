import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import Modal from './Modal';

describe('Modal', () => {
  beforeAll(() => {
    // Crea el nodo del portal para los tests
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal');
    document.body.appendChild(modalRoot);
  });

  // No es necesario cleanup manual, Testing Library limpia el DOM entre tests

  it('renderiza el contenido cuando show=true', () => {
    render(
      <Modal show={true} className="custom-modal">
        <div>Contenido Modal</div>
      </Modal>,
    );
    expect(screen.getByText('Contenido Modal')).toBeInTheDocument();
  });

  it('no renderiza el contenido cuando show=false', () => {
    render(
      <Modal show={false}>
        <div>Oculto</div>
      </Modal>,
    );
    // El contenido sigue en el DOM pero invisible por clases
    // eslint-disable-next-line testing-library/no-node-access
    const modalDiv = screen.getByText('Oculto').parentElement?.parentElement;
    expect(modalDiv).toHaveClass('invisible');
  });
});
