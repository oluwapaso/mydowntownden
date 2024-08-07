import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily:{
        nunito: ["Nunito Sans", "sans-serif"],
        Jost: ["Jost","sans-serif"],
        poppins: ["Poppins","sans-serif"],
        WorkSans: ["Work Sans","sans-serif"],
        CormorantGaramond: ["Cormorant Garamond"],
      },
      colors:{
        "primary":"#323232",
        "secondary":"#1C2E3B",
      },
      screens: {
        '2xs': '420px',
        'xs': '540px',
        'tab': '960px',
        'lgScrn': '1450px',
      },
      boxShadow: {
        'custom-shadow-r': '0 0 0 950px #323232',
        'custom-shadow-l': '0 0 0 950px #252525',
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ['before'],
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
export default config;
