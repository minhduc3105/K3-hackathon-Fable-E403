import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2563eb", // cobalt
          hover: "#1d4ed8",
        },
        success: "#16a34a",
        warning: "#ea580c",
        error: "#dc2626",
      },
      borderRadius: {
        DEFAULT: "6px",
        input: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
