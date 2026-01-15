import type { Config } from "tailwindcss";

const config: Config = {
  // We keep the content scanner so Tailwind knows where to look for class names
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // We remove the specific 'brand' and 'neo' definitions here 
  // because they are now handled by globals.css
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;