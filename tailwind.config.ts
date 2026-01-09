import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#CCFF00', // Electric Lime
          hover: '#B3E600',
        }
      },
      boxShadow: {
        'neo': '5px 5px 0px 0px rgba(0,0,0,1)', // Hard shadow
      }
    },
  },
  plugins: [],
};
export default config;