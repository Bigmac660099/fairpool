import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { SESSION_COOKIE, verifySession } from "@/lib/server/session";
import { isClerkMode } from "@/lib/auth-mode";

/**
 * Auth guard with two modes:
 *
 *  - Clerk mode (NEXT_PUBLIC_AUTH_MODE=clerk + key present): delegate to
 *    clerkMiddleware so Clerk manages sessions, OTP, device verification, and
 *    the 3-hour inactivity lifetime (all configured in the Clerk dashboard).
 *
 *  - Local mode (default): the lightweight JWT cookie check below, which is a
 *    pass-through unless you also run the production server actions. The
 *    client-side useAuth guard handles redirects in demo mode, so this returns
 *    next() and lets the app preview with zero backend.
 */
const clerk = clerkMiddleware();

const PROTECTED = ["/dashboard", "/vote", "/results", "/profile", "/admin"];
const ADMIN_ONLY = ["/admin"];

export default async function middleware(req: NextRequest, ev: any) {
  if (isClerkMode) {
    // Let Clerk handle everything.
    return clerk(req, ev);
  }

  // ── Local mode ──
  const localMode = (process.env.NEXT_PUBLIC_AUTH_MODE ?? "local") === "local";
  if (localMode) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySession(token) : null;
  if (!claims) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && claims.role !== "admin" && claims.role !== "trueAdmin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Run on app routes; skip static assets and _next internals.
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
