/** @type {import('next').NextConfig} */

/*
 * ─── Security headers ──────────────────────────────────────────────────────
 * Applied to every route. Each header mitigates a specific attack class
 * (noted inline). TLS 1.3 itself is terminated at the edge/host (Cloudflare /
 * Vercel) — these headers enforce the browser-side half of the policy.
 */
const securityHeaders = [
  {
    // HSTS — forces HTTPS for 2 years incl. subdomains; defeats SSL-strip /
    // protocol-downgrade MITM attacks. (No effect over plain http, e.g. localhost.)
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Clickjacking — disallow the app being framed by any origin.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // MIME-sniffing — stop the browser guessing content types (XSS vector).
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Referrer leakage — never send full URLs (which may carry ids) cross-origin.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Least privilege for powerful browser APIs. Geolocation stays on (voting),
    // everything else is denied.
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
  },
  {
    // Isolate cross-origin popups/windows.
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    /*
     * Content-Security-Policy — the primary XSS / injection containment layer.
     * Origins are limited to exactly what the app loads:
     *   - CartoDB basemap tiles (Leaflet)         → img-src
     *   - Clerk auth + Supabase API               → connect/script/frame
     *   - self-hosted fonts, inline Next styles
     * NOTE: 'unsafe-inline'/'unsafe-eval' on script-src are required by the
     * Next.js 14 App Router runtime (no nonce pipeline yet). Tightening to a
     * per-request nonce is the documented production upgrade (see SECURITY.md).
     */
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.clerk.com https://img.clerk.com https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev https://*.basemaps.cartocdn.com",
      "frame-src 'self' https://*.clerk.com https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      "object-src 'none'",       // block <object>/<embed> (legacy plugin XSS)
      "base-uri 'self'",          // stop <base> tag hijacking of relative URLs
      "form-action 'self'",       // forms can only post back to us
      "frame-ancestors 'none'",   // belt-and-suspenders clickjacking block
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise the framework/version (recon hardening)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
