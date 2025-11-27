import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
            DEFAULT: "#ffffff",
            dark: "#f1f5f9", // slate-100
        },
        primary: {
            DEFAULT: "#0f172a", // slate-900
            foreground: "#ffffff",
        },
        secondary: "#64748b", // slate-500
        success: "#10b981", // emerald-500
        danger: "#ef4444", // red-500
        warning: "#f59e0b", // amber-500
        info: "#3b82f6", // blue-500
      },
    },
  },
  plugins: [],
};
export default config;
