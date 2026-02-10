import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: {
          950: '#0B0B0E',
          900: '#101015',
          800: '#1A1A23',
          600: '#3B3B4A',
          500: '#4C4C5C',
          400: '#6B6B7A'
        },
        accent: {
          500: '#E45E2D',
          400: '#F07A4A'
        }
      },
      boxShadow: {
        soft: '0 12px 40px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
};

export default config;
