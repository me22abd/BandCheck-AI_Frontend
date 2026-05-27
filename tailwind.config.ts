import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4EFE5",
        "paper-card": "#FBF7EC",
        "paper-2": "#EAE3D2",
        ink: "#14120D",
        "ink-2": "#4A4435",
        "ink-3": "#8A8472",
        accent: "#C8431C",
        "accent-deep": "#9E311A",
        forest: "#0F5C3E",
        hairline: "rgba(20, 18, 13, 0.10)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        editorial: "18px",
      },
      boxShadow: {
        editorial: "0 12px 28px -10px rgba(20, 18, 13, 0.10)",
        "editorial-sm": "0 1px 2px rgba(20, 18, 13, 0.04)",
        "btn-accent": "0 6px 18px -6px rgba(200, 67, 28, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
