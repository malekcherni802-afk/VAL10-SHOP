/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './animations/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        charcoal: '#111111',
        ash: '#1a1a1a',
        smoke: '#2a2a2a',
        silver: '#c0c0c0',
        gold: '#c0a060',
        mist: '#666666',
        ghost: '#aaaaaa',
      },
      fontFamily: {
        gothic: ['Cinzel', 'serif'],
        body: ['Cormorant Garamond', 'serif'],
        mono: ['Courier Prime', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 1.5s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'smoke-drift': 'smokeDrift 20s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        smokeDrift: {
          '0%': { transform: 'translateX(-10%) translateY(10%) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translateX(5%) translateY(-5%) scale(1.1)', opacity: '0.5' },
          '100%': { transform: 'translateX(-10%) translateY(10%) scale(1)', opacity: '0.3' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
