import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full py-4 px-6 bg-gray-100 border-t text-center mt-10">
      <span className="text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} |
        <Link
          to="/contact"
          className="no-underline text-red-600 hover:underline ml-1"
          style={{ textDecoration: 'none' }}
        >
          {t('contact_link')}
        </Link>
      </span>
    </footer>
  );
}
