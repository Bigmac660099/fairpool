import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

/**
 * Bengali typeface (self-hosted variable woff2) wired to the
 * --font-bengali CSS variable. Self-hosting keeps the build offline-friendly
 * and avoids a runtime dependency on Google Fonts.
 */
const bengali = localFont({
  src: "./fonts/NotoSansBengali.woff2",
  variable: "--font-bengali",
  display: "swap",
  weight: "400 700",
});

export const metadata: Metadata = {
  title: "ফেয়ারপুল — স্বচ্ছ ভোটিং প্ল্যাটফর্ম",
  description: "মোবাইল-ফার্স্ট, জিপিএস-যাচাইকৃত বিশ্ববিদ্যালয় ভোটিং প্ল্যাটফর্ম।",
};

export const viewport: Viewport = {
  themeColor: "#1B7C8A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={bengali.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
