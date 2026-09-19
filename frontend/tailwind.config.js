/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayur: {
          primary: '#2D5A43',
          'primary-dark': '#1C3A2B',
          'primary-light': '#4A8064',
          accent: '#C89241',
          'accent-light': '#E5B974',
          sand: '#F7F4EC',
          parchment: '#EFE9DC',
          vata: '#3B82F6',
          pitta: '#EF4444',
          kapha: '#10B981',
        },
      },
    },
  },
  plugins: [],
}
