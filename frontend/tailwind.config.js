/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--gaga-bg)',
        surface: 'var(--gaga-surface)',
        'surface-2': 'var(--gaga-surface-2)',
        border: 'var(--color-border)',
        'text-primary': 'var(--gaga-text)',
        'text-secondary': 'var(--gaga-text-dim)',
        accent: 'var(--gaga-accent)',
        'accent-soft': 'var(--gaga-accent-soft)',
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
          400: '#60a5fa',
          500: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        starPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.3)' },
        },
        progressFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        celebrationIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        flipUp: {
          '0%': { transform: 'translateY(0) rotateX(0deg)', opacity: '1' },
          '50%': { transform: 'translateY(-60%) rotateX(90deg)', opacity: '0' },
          '51%': { transform: 'translateY(60%) rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotateX(0deg)', opacity: '1' },
        },
        drawCheck: {
          from: { strokeDashoffset: '100' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        shake: 'shake 0.3s ease-in-out',
        starPulse: 'starPulse 1.5s ease-in-out infinite',
        progressFlow: 'progressFlow 3s ease infinite',
        celebrationIn: 'celebrationIn 300ms ease-out forwards',
        flipUp: 'flipUp 600ms ease-in-out',
        drawCheck: 'drawCheck 400ms ease-out forwards',
      },
    },
  },
  plugins: [],
};
