/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#050816',
          900: '#090d1f',
          800: '#0f1630',
          700: '#17213f',
        },
        surfaceGlass: 'rgba(255,255,255,0.07)',
        medicalBlue: {
          DEFAULT: '#63b3ff',
          soft: '#93c5fd',
          deep: '#1d4ed8',
        },
        calmGreen: {
          DEFAULT: '#6ee7b7',
          deep: '#047857',
        },
        alertAmber: {
          DEFAULT: '#fbbf24',
          deep: '#b45309',
        },
        severeRed: {
          DEFAULT: '#fb7185',
          deep: '#7f1d1d',
        },
        background: 'var(--gaga-bg)',
        surface: 'var(--gaga-surface)',
        'surface-2': 'var(--gaga-surface-2)',
        border: 'var(--color-border)',
        'text-primary': 'var(--gaga-text)',
        'text-secondary': 'var(--gaga-text-dim)',
        accent: 'var(--gaga-accent)',
        'accent-soft': 'var(--gaga-accent-soft)',
        green: {
          DEFAULT: '#6ee7b7',
          400: '#6ee7b7',
        },
        yellow: {
          DEFAULT: '#fbbf24',
          400: '#fbbf24',
        },
        red: {
          DEFAULT: '#fb7185',
          400: '#fb7185',
        },
        blue: {
          primary: '#63b3ff',
          DEFAULT: '#63b3ff',
          400: '#93c5fd',
          500: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 24px 80px rgba(0, 0, 0, 0.38)',
        glowBlue: '0 0 48px rgba(99, 179, 255, 0.24)',
        glowRed: '0 0 56px rgba(251, 113, 133, 0.2)',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.045)', opacity: '1' },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.62' },
          '50%': { opacity: '1' },
        },
        slowFloat: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        progressFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        drawCheck: {
          from: { strokeDashoffset: '100' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        breathing: 'breathing 7s ease-in-out infinite',
        softPulse: 'softPulse 4s ease-in-out infinite',
        slowFloat: 'slowFloat 10s ease-in-out infinite',
        gradientShift: 'gradientShift 18s ease-in-out infinite',
        shake: 'shake 0.3s ease-in-out',
        progressFlow: 'progressFlow 4s ease infinite',
        drawCheck: 'drawCheck 400ms ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
