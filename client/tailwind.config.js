/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5fce8',
          100: '#e8f7cc',
          200: '#cff0a0',
          300: '#afe270',
          400: '#91cf45',
          500: '#7CB518',
          600: '#7CB518',
          700: '#659614',
          800: '#4e740f',
          900: '#13321E',
        },
        accent: {
          50: '#fefce8',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
