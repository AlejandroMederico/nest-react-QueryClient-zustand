/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#c1292e',
        'primary-hover': '#a52328',
        white: '#ffffff',
        'white-hover': '#f2f2f2',
        header: '#e2e1e1',
      },
      fontFamily: {
        sans: [
          'Roboto',
          'Helvetica',
          'Helvetica Neue',
          'Nunito Sans',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
