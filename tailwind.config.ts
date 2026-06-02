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

      /* ── Display type scale ── */
      fontSize: {
        "display-2xl": ["4.5rem",  { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-xl":  ["3.75rem", { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-lg":  ["3rem",    { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        "display-md":  ["2.25rem", { lineHeight: "1.2",  letterSpacing: "-0.01em" }],
        "display-sm":  ["1.875rem",{ lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "display-xs":  ["1.5rem",  { lineHeight: "1.3",  letterSpacing: "-0.005em" }],
      },

      letterSpacing: {
        "tightest": "-0.04em",
        "tighter-label": "0.08em",
        "widest-label":  "0.14em",
      },

      colors: {
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
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
          DEFAULT:              "hsl(var(--sidebar))",
          foreground:           "hsl(var(--sidebar-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },
        /* Extra brand tints for decorative use */
        teal: {
          50:  "#f0fdfc",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },

      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },

      boxShadow: {
        "glow-sm": "0 0 12px 2px hsl(185 65% 40% / 0.25)",
        "glow-md": "0 0 24px 6px hsl(185 65% 40% / 0.35)",
        "glow-lg": "0 0 48px 12px hsl(185 65% 40% / 0.25)",
        "card-raised": "0 8px 32px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)",
        "card-hover":  "0 16px 48px -8px rgba(0,0,0,0.18), 0 4px 12px -4px rgba(0,0,0,0.1)",
      },

      keyframes: {
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        shimmer: {
          "0%":   { transform: "translateX(-100%) skewX(-12deg)" },
          "100%": { transform: "translateX(200%) skewX(-12deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 2px hsl(185 65% 40% / 0.25)" },
          "50%":      { boxShadow: "0 0 24px 6px hsl(185 65% 40% / 0.50)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "border-run": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        ping:        "ping 1.6s cubic-bezier(0,0,0.2,1) infinite",
        "fade-in":   "fade-in 0.4s ease-out",
        shimmer:     "shimmer 2.2s ease-in-out infinite",
        float:       "float 4s ease-in-out infinite",
        "glow-pulse":"glow-pulse 2.4s ease-in-out infinite",
        "slide-up":  "slide-up 0.5s cubic-bezier(0.22,1,0.36,1)",
        "border-run":"border-run 4s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
