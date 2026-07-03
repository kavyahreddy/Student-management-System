/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#16233F",
          light: "#1F3358",
          lighter: "#2C4573",
        },
        cream: "#F7F5F0",
        gold: {
          DEFAULT: "#C8863A",
          light: "#E0A968",
          dark: "#A6692A",
        },
        ink: "#1A1A1A",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
