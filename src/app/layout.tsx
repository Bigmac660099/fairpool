import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

/**
 * Self-hosted Bengali type system (all woff2, display: swap).
 *
 *  --font-bengali : FN Shorif Opekkha Unicode — body / default (regular+italic)
 *  --font-display : Helal Hafiz Bold          — hero & section headings
 *  --font-accent  : Insaf                      — brand wordmark accent
 *
 * Noto Sans Bengali is kept in each Tailwind stack as the conjunct-safe
 * fallback so no glyph ever fails to render.
 */
const bengali = localFont({
  src: [
    { path: "./fonts/ShorifOpekkha.woff2",       weight: "400", style: "normal" },
    { path: "./fonts/ShorifOpekkhaItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/ShorifOpekkha.woff2",       weight: "600", style: "normal" },
    { path: "./fonts/ShorifOpekkha.woff2",       weight: "700", style: "normal" },
  ],
  variable: "--font-bengali",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const display = localFont({
  src: "./fonts/HelalHafiz.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "700",
  fallback: ["system-ui", "sans-serif"],
});

const accent = localFont({
  src: "./fonts/Insaf.woff2",
  variable: "--font-accent",
  display: "swap",
  weight: "400",
  fallback: ["system-ui", "sans-serif"],
});

/** Conjunct-safe fallback — used only when a primary font lacks a glyph. */
const notoBengali = localFont({
  src: "./fonts/NotoSansBengali.woff2",
  variable: "--font-noto-bengali",
  display: "swap",
  weight: "400 700",
});

export const metadata: Metadata = {
  title: "ফেয়ারপুল — স্বচ্ছ ভোটিং প্ল্যাটফর্ম",
  description: "মোবাইল-ফার্স্ট, জিপিএস-যাচাইকৃত বিশ্ববিদ্যালয় ভোটিং প্ল্যাটফর্ম।",
};

export const viewport: Viewport = {
  themeColor: "#0891B2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${bengali.variable} ${display.variable} ${accent.variable} ${notoBengali.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
