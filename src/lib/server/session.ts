import "server-only";
import { SignJWT, jwtVerify } from "jose";

/**
 * JWT session helpers (jose — works in the Edge runtime / middleware).
 * The token is stored in an HTTP-only cookie and signed with SESSION_SECRET.
 */
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-change-me-please-32+chars-long",
);

export interface SessionClaims {
  sub: string; // profile id
  role: "student" | "admin" | "trueAdmin";
  studentId: string;
}

export const SESSION_COOKIE = "fp_session";

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}
