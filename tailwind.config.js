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
          bg: '#0c0c0c',
          surface: '#151515',
          border: '#222222',
          hover: '#1c1c1c',
          text: '#e8e8e8',
          muted: '#999999',
          dim: '#5a5a5a',
        },
      },
    },
  },
  plugins: [],
}
