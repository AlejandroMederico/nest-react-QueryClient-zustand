import React from 'react';

import Footer from '../layout/Footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="flex-1 flex justify-center items-center w-full">
        {children}
      </div>
      <Footer />
    </div>
  );
}
