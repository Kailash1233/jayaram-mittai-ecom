import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main)",
        foreground: "var(--text-main)",
        theme: {
          bg: "var(--bg-main)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
          cardHover: "var(--bg-card-hover)",
          border: "var(--border-theme)",
          borderActive: "var(--border-theme-active)",
          accent: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          badgeBg: "var(--accent-badge-bg)",
          badgeText: "var(--accent-badge-text)",
          text: "var(--text-main)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'DM Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 25px 70px rgba(0, 0, 0, 0.45)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.35s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
