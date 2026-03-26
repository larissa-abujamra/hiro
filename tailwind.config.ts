import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hiro: {
          bg: "#F0EDE6",
          card: "#E8E4DC",
          "card-active": "#2D5C3F",
          text: "#1C2B1E",
          muted: "#6B7A6D",
          green: "#2D5C3F",
          amber: "#C68B2F",
          red: "#D94F4F",
          "badge-bg": "#D6E8DC",
          "badge-fg": "#2D5C3F",
        },
      },
    },
  },
};

export default config;
