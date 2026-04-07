import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brand: "0 4px 14px -3px rgba(37, 99, 235, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
