/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        blink: 'blink 1s step-start 0s infinite'
      },
      keyframes: {
        blink: {
          '0%, 100%' : { opacity: 1 },
          '50%' : { opacity: 0 }
        }
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()]
}

