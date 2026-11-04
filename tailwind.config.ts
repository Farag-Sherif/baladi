import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#23254F',
          800: '#1B1D40',
          900: '#141532',
          700: '#2E3070',
        },
        cream: {
          DEFAULT: '#FBF6EE',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FBF6EE',
          300: '#F5EBDC',
          400: '#EEDCC4',
        },
        sand: {
          DEFAULT: '#F2E6D5',
          100: '#F9F4ED',
          200: '#F2E6D5',
          300: '#E5D1B8',
        },
        baladi: {
          red: '#E84249',
          yellow: '#FBBB21',
          green: '#1E996C',
          cream: '#FBF6EE',
          sand: '#F2E6D5',
          ink: '#23254F',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Gotham', 'system-ui', 'sans-serif'],
        ar: ['Cairo', 'Almarai', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(35,37,79,0.35)',
        lift: '0 34px 80px -30px rgba(35,37,79,0.45)',
        ring: '0 0 0 1px rgba(35,37,79,0.08)',
      },
      borderRadius: { xl2: '1.75rem' },
      keyframes: {
        drift: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-14px,0)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: { drift: 'drift 9s ease-in-out infinite', marquee: 'marquee 26s linear infinite' },
    },
  },
  plugins: [],
} satisfies Config
