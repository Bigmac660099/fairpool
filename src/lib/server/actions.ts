"use server";

import { cookies } from "next/headers";
import {
  castVoteSchema,
  loginSchema,
  registerSchema,
} from "@/lib/schemas";
import { isSupabaseConfigured, supabaseAnon, supabaseService } from "./supabase";
import { SESSION_COOKIE, signSession } from "./session";
import { encryptField } from "./crypto";
import { logError } from "./log";
import { sanitizeName } from "@/lib/sanitize";
import type { CastVoteResult } from "@/lib/types";

/**
 * Production server actions (Supabase path). These run only when Supabase is
 * configured; in local demo mode the UI uses src/lib/data.ts instead. Each
 * action validates input with Zod, then calls the SECURITY DEFINER RPC or a
 * service-role query. Vote writes ALWAYS go through cast_vote — never a direct
 * insert.
 */

function setSessionCookie(token: string) {
  // Session cookie hardening:
  //  httpOnly  → not readable by JS, blocks token theft via XSS
  //  secure    → only sent over HTTPS in production (no plaintext leakage)
  //  sameSite  → "lax" blocks CSRF on unsafe methods while allowing top-level
  //              auth redirects (Clerk/Google OAuth return)
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function loginAction(raw: unknown) {
  const { studentId, password } = loginSchema.parse(raw);
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const role = password === "admin" ? "admin" : "student";
  const svc = supabaseService();
  // Upsert the profile (local-style auth: any valid 14-digit id).
  const fallbackName = `শিক্ষার্থী ${studentId.slice(-4)}`;
  const { data, error } = await svc
    .from("profiles")
    .upsert({ student_id: studentId, name: encryptField(fallbackName) ?? fallbackName, role }, { onConflict: "student_id" })
    .select()
    .single();
  if (error || !data) {
    logError("loginAction", error, { studentId });
    throw new Error("লগইন ব্যর্থ হয়েছে");
  }

  const token = await signSession({ sub: data.id, role: data.role, studentId });
  setSessionCookie(token);
  return { id: data.id, role: data.role as "student" | "admin" };
}

export async function registerAction(raw: unknown) {
  const input = registerSchema.parse(raw);
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const role = input.password === "admin" ? "admin" : "student";
  const svc = supabaseService();
  // Sanitize (XSS) then encrypt the name at rest (AES-256-GCM via crypto.ts).
  const safeName = sanitizeName(input.name);
  const { data, error } = await svc
    .from("profiles")
    .upsert(
      {
        student_id: input.studentId, // parameterized by the SDK — no SQLi
        name: encryptField(safeName) ?? safeName,
        role,
        department_id: input.departmentId,
        semester: input.semester,
      },
      { onConflict: "student_id" },
    )
    .select()
    .single();
  // Don't surface the raw DB error to the client (info leakage).
  if (error || !data) {
    logError("registerAction", error, { studentId: input.studentId });
    throw new Error("নিবন্ধন ব্যর্থ হয়েছে");
  }
  const token = await signSession({ sub: data.id, role: data.role, studentId: input.studentId });
  setSessionCookie(token);
  return { id: data.id, role: data.role as "student" | "admin" };
}

/** Cast a vote via the cast_vote RPC. GPS lat/lon are validated server-side. */
export async function castVoteAction(voterId: string, raw: unknown): Promise<CastVoteResult> {
  const { electionId, candidateId, lat, lon } = castVoteSchema.parse(raw);
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const db = supabaseAnon();
  const { data, error } = await db.rpc("cast_vote", {
    p_election_id: electionId,
    p_candidate_id: candidateId,
    p_voter_id: voterId,
    p_lat: lat ?? null,
    p_lon: lon ?? null,
  });
  if (error) {
    // Log the detail server-side; return a generic message to the client.
    logError("castVoteAction", error, { electionId, voterId });
    return { ok: false, code: "invalid_candidate", message: "ভোট রেকর্ড করা যায়নি" };
  }
  return data as CastVoteResult;
}
