/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#002767',
        secondary: '#bd0b31',
        accent: '#000000', // COMPANY ACCENT COLOR PLACEHOLDER
        highlight: '#ffffff', // COMPANY HIGHLIGHT COLOR PLACEHOLDER
        background: '#ffffff', // White
        text: '#333333', // Dark gray for regular text
        footer: {
          bg: '#bd0b31',
          text: '#ffffff', // White
          hover: '#bd0b31',
        }
      },
    },
  },
  plugins: [],
}; 