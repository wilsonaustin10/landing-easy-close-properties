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
        primary: '#3B82F6',
        secondary: '#EF4444',
        accent: '#000000', // COMPANY ACCENT COLOR PLACEHOLDER
        highlight: '#000000', // COMPANY HIGHLIGHT COLOR PLACEHOLDER
        background: '#ffffff', // White
        text: '#333333', // Dark gray for regular text
        footer: {
          bg: '#3B82F6',
          text: '#ffffff', // White
          hover: '#EF4444',
        }
      },
    },
  },
  plugins: [],
}; 