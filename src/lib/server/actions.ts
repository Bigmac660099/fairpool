"use server";

import { cookies } from "next/headers";
import {
  castVoteSchema,
  loginSchema,
  registerSchema,
} from "@/lib/schemas";
import { isSupabaseConfigured, supabaseAnon, supabaseService } from "./supabase";
import { SESSION_COOKIE, signSession } from "./session";
import type { CastVoteResult } from "@/lib/types";

/**
 * Production server actions (Supabase path). These run only when Supabase is
 * configured; in local demo mode the UI uses src/lib/data.ts instead. Each
 * action validates input with Zod, then calls the SECURITY DEFINER RPC or a
 * service-role query. Vote writes ALWAYS go through cast_vote — never a direct
 * insert.
 */

function setSessionCookie(token: string) {
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
  const { data, error } = await svc
    .from("profiles")
    .upsert({ student_id: studentId, name: `শিক্ষার্থী ${studentId.slice(-4)}`, role }, { onConflict: "student_id" })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "login failed");

  const token = await signSession({ sub: data.id, role: data.role, studentId });
  setSessionCookie(token);
  return { id: data.id, role: data.role as "student" | "admin" };
}

export async function registerAction(raw: unknown) {
  const input = registerSchema.parse(raw);
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const role = input.password === "admin" ? "admin" : "student";
  const svc = supabaseService();
  const { data, error } = await svc
    .from("profiles")
    .upsert(
      {
        student_id: input.studentId,
        name: input.name,
        role,
        department_id: input.departmentId,
        semester: input.semester,
      },
      { onConflict: "student_id" },
    )
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "register failed");
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
    return { ok: false, code: "invalid_candidate", message: error.message };
  }
  return data as CastVoteResult;
}
