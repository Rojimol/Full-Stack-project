/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'brand-white': 'var(--brand-white)',
        'brand-light': 'var(--brand-light)',
        'brand-blue': 'var(--brand-blue)',
        'brand-darkBlue': 'var(--brand-dark-blue)',
        'brand-gray-light': 'var(--brand-gray-light)',
        'brand-gray': 'var(--brand-gray)',
        'brand-black': 'var(--brand-black)',
        brand: {
          white: 'var(--brand-white)',
          light: 'var(--brand-light)',
          blue: 'var(--brand-blue)',
          darkBlue: 'var(--brand-dark-blue)',
          grayLight: 'var(--brand-gray-light)',
          gray: 'var(--brand-gray)',
          black: 'var(--brand-black)'
        },
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'text-shimmer': 'textShimmer 2.5s ease-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        textShimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(41, 121, 255, 0.2), 0 0 10px rgba(41, 121, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(41, 121, 255, 0.6), 0 0 40px rgba(41, 121, 255, 0.4)' },
        }
      },
    },
  },
  plugins: [],
}