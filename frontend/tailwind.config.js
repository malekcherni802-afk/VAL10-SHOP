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
        void:     '#000000',
        obsidian: '#080808',
        forge:    '#0d0d0d',
        iron:     '#111111',
        slag:     '#1a1a1a',
        steel:    '#242424',
        blade:    '#2e2e2e',
        chrome:   '#e8e8e8',
        white:    '#ffffff',
        acid:     '#c8ff00',       /* neon chartreuse accent */
        rust:     '#ff3a1a',       /* industrial rust red */
        ember:    '#ff6b00',       /* hot metal orange */
        mist:     '#5a5a5a',
        ghost:    '#888888',
      },
      fontFamily: {
        display:  ['"Unbounded"', 'sans-serif'],
        gothic:   ['"Uncial Antiqua"', 'serif'],
        body:     ['"Space Grotesk"', 'sans-serif'],
        mono:     ['"Space Mono"', 'monospace'],
        label:    ['"Barlow Condensed"', 'sans-serif'],
      },
      letterSpacing: {
        'ultra':  '0.5em',
        'wide':   '0.25em',
        'tight':  '-0.04em',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        'flicker':     'flicker 3s linear infinite',
        'scan':        'scan 8s linear infinite',
        'glitch':      'glitch 0.3s steps(2) infinite',
        'drift':       'drift 20s ease-in-out infinite',
        'pulse-acid':  'pulseAcid 2s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 97%, 100%': { opacity: '1' },
          '98%':           { opacity: '0.4' },
          '99%':           { opacity: '0.8' },
        },
        scan: {
          '0%':   { backgroundPosition: '0 -100vh' },
          '100%': { backgroundPosition: '0 100vh' },
        },
        glitch: {
          '0%':   { clipPath: 'inset(30% 0 40% 0)', transform: 'translateX(-4px)' },
          '50%':  { clipPath: 'inset(60% 0 10% 0)', transform: 'translateX(4px)' },
          '100%': { clipPath: 'inset(10% 0 70% 0)', transform: 'translateX(-2px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':      { transform: 'translate(10px, -8px) scale(1.01)' },
          '66%':      { transform: 'translate(-6px, 12px) scale(0.99)' },
        },
        pulseAcid: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200,255,0,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(200,255,0,0.7), 0 0 80px rgba(200,255,0,0.2)' },
        },
      },
    },
  },
  plugins: [],
};
