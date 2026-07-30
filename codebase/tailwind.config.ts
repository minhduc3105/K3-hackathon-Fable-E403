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
        // VLearn navy brand
        brand: {
          50: "#eef2fb",
          100: "#d5def4",
          200: "#aec0e9",
          300: "#7f99d9",
          400: "#5372c4",
          500: "#3552a8",
          600: "#274088",
          700: "#1e3270",
          800: "#182a5e", // primary navy (logo / header)
          900: "#132146",
        },
        accent: {
          DEFAULT: "#2563eb", // interactive blue
          hover: "#1d4ed8",
          soft: "#eff4ff",
        },
        success: "#16a34a",
        warning: "#ea580c",
        error: "#dc2626",
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f6f7fb",
          sunken: "#eef0f6",
        },
        line: "#e4e7ef",
      },
      borderRadius: {
        DEFAULT: "6px",
        input: "8px",
        panel: "12px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(19,33,70,0.05), 0 1px 3px rgba(19,33,70,0.08)",
        pop: "0 8px 24px rgba(19,33,70,0.12)",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem" }],
      },
    },
  },
  plugins: [],
};
export default config;
