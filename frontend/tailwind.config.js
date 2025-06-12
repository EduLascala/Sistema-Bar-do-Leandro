/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1C1C1E',
        secondary: '#2C2C2E',
        accent: '#D4AF37',
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0'
        },
        alert: '#FF3B30',
        success: '#30D158'
      }
    },
  },
  plugins: [],
};