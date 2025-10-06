/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        shark: {
          light: "#cce7ff",
          DEFAULT: "#0ea5e9",
          dark: "#0369a1",
        },
      },
    },
  },
  plugins: [],
};
