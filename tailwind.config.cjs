/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cool: "#C8D4EB",
        tan: {
          50: "#FFFCEF",
          100: "#EBEAE6",
          150: "#E2E0D9",
          200: "#DAD6CD",
          250: "#D6D0C0",
          300: "#D3BDA3",
          350: "#C6AD8F",
          375: "#B39A7C",
          400: "#87735B",
          450: "#6B5B48",
          500: "#4F4335",
          600: "#312821",
          650: "#221B17",
          700: "#130F0D",
          1: "#dad6cd",
        },
      },
    },
  },
  plugins: [],
};
