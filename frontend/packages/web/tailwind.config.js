/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crisis: {
          critico: '#dc2626',
          alto: '#f97316',
          medio: '#eab308',
          bajo: '#84cc16',
          ninguno: '#22c55e',
        },
      },
    },
  },
  plugins: [],
}
