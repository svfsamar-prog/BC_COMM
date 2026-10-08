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
        background: "#FFFFFF",
        surface: "#FAFAFA",
        border: "#E5E7EB",
        primary: {
          DEFAULT: "#0F2942",
          hover: "#0A1D30",
          light: "#F0F4F8",
        },
        foreground: {
          DEFAULT: "#0A0A0A",
          muted: "#6B7280",
          light: "#9CA3AF",
        },
        status: {
          green: "#15803D",
          greenLight: "#F0FDF4",
          amber: "#D97706",
          amberLight: "#FFFBEB",
          red: "#DC2626",
          redLight: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
