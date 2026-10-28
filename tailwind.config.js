/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7ee',
          100: '#f5ecd6',
          200: '#edd8ab',
          300: '#e3be7b',
          400: '#d9a24f',
          500: '#cf862e',
          600: '#ba6b24',
          700: '#9b5020',
          800: '#7f4120',
          900: '#69361d',
          950: '#3c1c0c',
        },
      },
    },
  },
  plugins: [],
}
