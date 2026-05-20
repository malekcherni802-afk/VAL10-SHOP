/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        void:   '#000000',
        ink:    '#080808',
        pitch:  '#0c0c0c',
        carbon: '#111111',
        forge:  '#161616',
        iron:   '#1e1e1e',
        steel:  '#2a2a2a',
        blade:  '#383838',
        ash:    '#555555',
        ghost:  '#888888',
        mist:   '#aaaaaa',
        cloud:  '#cccccc',
        chalk:  '#e8e8e8',
        pure:   '#ffffff',
        gold:   '#b8960c',
        gilt:   '#d4a843',
        amber:  '#e8c060',
      },
      fontFamily: {
        gothic:  ['"Uncial Antiqua"', 'serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
        serif:   ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
