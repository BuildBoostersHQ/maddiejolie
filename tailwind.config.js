/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Figtree', '-apple-system', 'system-ui', 'sans-serif'],
        sans: ['Poppins', '-apple-system', 'system-ui', 'sans-serif'],
      },
      colors: {
        dash: {
          bg: '#08080a',
          surface: 'rgba(255,255,255,0.025)',
          border: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.04)',
          text: 'rgba(255,255,255,0.85)',
          muted: 'rgba(255,255,255,0.4)',
          dim: 'rgba(255,255,255,0.2)',
        },
      },
    },
  },
  plugins: [],
}
