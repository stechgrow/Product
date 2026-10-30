
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      colors: {
        "figma-ui3-main": "var(--figma-ui3-main)",
      },
    },
  },
  plugins: [],
};


