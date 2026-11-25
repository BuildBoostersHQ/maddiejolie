/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'system-ui', 'sans-serif'],
      },
      colors: {
        dash: {
          bg: '#0a0a0a',
          surface: '#141414',
          border: '#1f1f1f',
          hover: '#1a1a1a',
          text: '#fafafa',
          muted: '#a0a0a0',
          dim: '#666666',
        },
      },
    },
  },
  plugins: [],
}
