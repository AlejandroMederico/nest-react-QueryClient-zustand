import React, { Children, Fragment, ReactNode, useState } from 'react';
import { Menu, X } from 'react-feather';

import Footer from './Footer';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(false);

  const nodes = Children.toArray(children);
  const header = nodes[0] ?? null;
  const body = nodes.slice(1);

  return (
    <Fragment>
      <Sidebar className={showSidebar ? 'show' : ''} />

      {/* Área de contenido a la derecha del sidebar */}
      <main className="lg:ml-72 min-h-screen flex flex-col">
        {/* Franja gris pegada arriba + línea fina al final */}
        {header && (
          <div className="px-5 sm:px-10 py-4 bg-gray-200 border-b border-gray-300">
            {header}
          </div>
        )}

        {/* Cuerpo */}
        <div className="px-5 sm:px-10 flex-1">{body}</div>
        <Footer />
      </main>

      {/* Botón flotante para abrir/cerrar el sidebar en mobile */}
      <button
        className={`fixed bottom-5 border shadow-md bg-white p-3 rounded-full transition-all focus:outline-none lg:hidden ${
          showSidebar ? 'right-5' : 'left-5'
        }`}
        onClick={() => setShowSidebar(!showSidebar)}
        aria-label={showSidebar ? 'Close sidebar' : 'Open sidebar'}
      >
        {showSidebar ? <X size={30} /> : <Menu size={30} />}
      </button>
    </Fragment>
  );
}
