/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: require("tailwindcss/colors").gray,
        slate: require("tailwindcss/colors").slate,
        blue: require("tailwindcss/colors").blue,
      },
    },
  },
  plugins: [],
};
