/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#050A14',
        'nav-bg-start': '#15112b',
        'nav-bg-end': '#1a1535',
        'nav-bg-alt': '#1e1a3c',
        'accent-pink': '#f48599',
        'accent-red': '#f05672',
        'accent-pink-light': '#f8b4c0',
        'brand-logo-start': '#f48599',
        'brand-logo-end': '#f05672',
        'text-main': '#e6e6e6',
        'text-muted': 'rgba(255, 255, 255, 0.7)',
        'text-dark': '#15112b',
      },
    },
  },
  plugins: [],
};
