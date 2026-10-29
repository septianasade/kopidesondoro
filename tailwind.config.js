/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        tactile: {
          bg: '#F4F1EA',
          carbon: '#121212',
          metal: '#1E1E1E',
          surface: '#FFFFFF',
          border: '#000000',
          acid: '#CCFF00',      // Acid Green
          orange: '#FF4F00',    // International Orange
          signal: '#FF2A00',    // Signal Red
          muted: '#8A857A',
        },
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
      boxShadow: {
        'tactile-sm': '2px 2px 0px #000000',
        'tactile': '3px 3px 0px #000000',
        'tactile-lg': '5px 5px 0px #000000',
        'tactile-orange': '3px 3px 0px #FF4F00',
        'tactile-acid': '3px 3px 0px #CCFF00',
      }
    },
  },
  plugins: [],
}
