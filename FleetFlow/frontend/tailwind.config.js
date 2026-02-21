/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        }
      },
      animation: {
        'drift': 'drift 12s ease-in-out infinite alternate',
        'drift-reverse': 'drift 15s ease-in-out infinite alternate-reverse',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shake': 'shake 0.4s ease',
        'fadeIn': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        drift: {
          from: { transform: 'translate(0, 0)' },
          to: { transform: 'translate(40px, 30px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
