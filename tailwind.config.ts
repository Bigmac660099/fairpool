import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bengali: ["var(--font-bengali)", "system-ui", "sans-serif"],
      },

      /* Display type scale */
      fontSize: {
        "display-2xl": ["4rem",   { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-xl":  ["3.25rem",{ lineHeight: "1.12", letterSpacing: "-0.018em" }],
        "display-lg":  ["2.75rem",{ lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-md":  ["2.25rem",{ lineHeight: "1.2",  letterSpacing: "-0.012em" }],
        "display-sm":  ["1.875rem",{ lineHeight: "1.25",letterSpacing: "-0.01em" }],
        "display-xs":  ["1.5rem", { lineHeight: "1.3",  letterSpacing: "-0.008em" }],
      },

      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        sidebar: {
          DEFAULT:             "hsl(var(--sidebar))",
          foreground:          "hsl(var(--sidebar-foreground))",
          accent:              "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border:              "hsl(var(--sidebar-border))",
          ring:                "hsl(var(--sidebar-ring))",
        },
        teal: {
          50: "#f0fdfc", 100: "#ccfbf1", 200: "#99f6e4",
          300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6",
          600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a",
        },
      },

      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        xl:   "calc(var(--radius) + 4px)",
        "2xl":"calc(var(--radius) + 10px)",
        "3xl":"calc(var(--radius) + 18px)",
      },

      boxShadow: {
        "xs":         "0 1px 2px 0 rgba(0,0,0,0.05)",
        "card":       "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)",
        "card-md":    "0 4px 12px -2px rgba(0,0,0,0.09), 0 2px 6px -2px rgba(0,0,0,0.07)",
        "card-lg":    "0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -4px rgba(0,0,0,0.08)",
        "primary-sm": "0 1px 3px 0 hsl(185 65% 32% / 0.25)",
        "primary-md": "0 4px 12px -2px hsl(185 65% 32% / 0.3)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in":  "fade-in 0.35s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.22,1,0.36,1)",
        ping:       "ping 1.6s cubic-bezier(0,0,0.2,1) infinite",
        shimmer:    "shimmer 1.8s linear infinite",
        float:      "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
