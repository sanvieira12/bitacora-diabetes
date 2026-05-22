/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f1419',
        surface: '#1a2332',
        border: '#2a3a4a',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',
        green: {
          DEFAULT: '#4ade80',
          400: '#4ade80',
        },
        yellow: {
          DEFAULT: '#fbbf24',
          400: '#fbbf24',
        },
        red: {
          DEFAULT: '#f87171',
          400: '#f87171',
        },
        blue: {
          primary: '#3b82f6',
          DEFAULT: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
