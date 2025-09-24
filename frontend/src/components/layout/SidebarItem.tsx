import React from 'react';
import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  children: ReactNode;
  to: string;
}

export default function SidebarItem({ children, to }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      exact
      className="no-underline rounded-lg p-3 transition-all flex items-center justify-center gap-2 font-semibold text-white hover:bg-red-600 hover:bg-opacity-90 hover:shadow-lg transform hover:scale-105"
      activeClassName="bg-red-600 text-white shadow-lg"
    >
      <span className="inline-flex items-center gap-2 leading-none">
        {children}
      </span>
    </NavLink>
  );
}
