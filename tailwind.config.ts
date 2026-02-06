import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Note: In Tailwind v4, most theme customization happens in globals.css using @theme
      // We keep this file minimal and let CSS variables do the heavy lifting
    },
  },
  plugins: [],
};

export default config;