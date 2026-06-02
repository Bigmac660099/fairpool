"use client";

import type {
  Candidate,
  CastVoteResult,
  Department,
  Election,
  GpsLog,
  KnownDevice,
  Profile,
  SiteSettings,
  Tally,
  Vote,
} from "./types";
import { withinRadius, haversineMeters } from "./geo";

/**
 * FAIRPOOL local data layer.
 *
 * This is the demo/offline implementation that lets the whole app run with
 * zero backend. It persists to localStorage and exposes the same shape an
 * eventual Supabase data layer would (see PENDING WORKFLOWS in the README).
 *
 * All vote writes go through `castVote`, which enforces the same rules as the
 * server-side `cast_vote` RPC: active window, geo radius, idempotency,
 * one-vote-per-person, and a simple per-user rate limit.
 */

const STORAGE_KEY = "fairpool:v3";
const SESSION_KEY = "fairpool:session";
// Re-auth is required after this much inactivity (3 hours).
export const INACTIVITY_MS = 3 * 60 * 60 * 1000;

interface DB {
  departments: Department[];
  elections: Election[];
  candidates: Candidate[];
  votes: Vote[];
  profiles: Profile[];
  gpsLogs: GpsLog[];
  devices: KnownDevice[];
  settings: SiteSettings;
}

// ── Seed data ────────────────────────────────────────────────────────────
function nowPlusHours(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString();
}

function seed(): DB {
  const departments: Department[] = [
    { id: "dept-cse", name: "কম্পিউটার বিজ্ঞান ও প্রকৌশল", code: "CSE" },
    { id: "dept-eee", name: "তড়িৎ ও ইলেকট্রনিক প্রকৌশল", code: "EEE" },
    { id: "dept-bba", name: "ব্যবসায় প্রশাসন", code: "BBA" },
    { id: "dept-eng", name: "ইংরেজি", code: "ENG" },
  ];

  const elections: Election[] = [
    {
      id: "elec-cr-2026",
      title: "শিক্ষার্থী সংসদ নির্বাচন ২০২৬",
      description: "সাধারণ সম্পাদক পদের জন্য ভোট দিন।",
      status: "active",
      startsAt: nowPlusHours(-2),
      endsAt: nowPlusHours(48),
      geoRequired: true,
      geoLat: 23.7806, // Dhaka campus (demo)
      geoLon: 90.4074,
      geoRadiusM: 2000,
    },
    {
      id: "elec-club-2026",
      title: "বিজ্ঞান ক্লাব সভাপতি নির্বাচন",
      description: "বিজ্ঞান ক্লাবের নতুন সভাপতি নির্বাচন।",
      status: "active",
      startsAt: nowPlusHours(-1),
      endsAt: nowPlusHours(72),
      geoRequired: false,
      geoLat: null,
      geoLon: null,
      geoRadiusM: null,
    },
  ];

  const candidates: Candidate[] = [
    {
      id: "cand-1",
      electionId: "elec-cr-2026",
      name: "রাফসান আহমেদ",
      departmentId: "dept-cse",
      photoUrl: null,
      symbolUrl: null,
      promises: ["আধুনিক লাইব্রেরি", "ফ্রি ওয়াইফাই", "ক্যান্টিন সংস্কার"],
    },
    {
      id: "cand-2",
      electionId: "elec-cr-2026",
      name: "সুমাইয়া খাতুন",
      departmentId: "dept-eee",
      photoUrl: null,
      symbolUrl: null,
      promises: ["মেয়েদের হোস্টেল উন্নয়ন", "ক্যারিয়ার মেলা", "ক্রীড়া সুবিধা"],
    },
    {
      id: "cand-3",
      electionId: "elec-cr-2026",
      name: "তানভীর হাসান",
      departmentId: "dept-bba",
      photoUrl: null,
      symbolUrl: null,
      promises: ["স্বচ্ছ বাজেট", "নতুন বাস সার্ভিস", "মেডিকেল সেন্টার"],
    },
    {
      id: "cand-4",
      electionId: "elec-club-2026",
      name: "নুসরাত জাহান",
      departmentId: "dept-cse",
      photoUrl: null,
      symbolUrl: null,
      promises: ["মাসিক সেমিনার", "রোবোটিক্স ল্যাব"],
    },
    {
      id: "cand-5",
      electionId: "elec-club-2026",
      name: "আরিফুল ইসলাম",
      departmentId: "dept-eng",
      photoUrl: null,
      symbolUrl: null,
      promises: ["বিজ্ঞান অলিম্পিয়াড", "প্রজেক্ট ফান্ডিং"],
    },
  ];

  const profiles: Profile[] = [
    {
      id: "user-superadmin",
      studentId: "99999999999999",
      name: "প্রধান প্রশাসক",
      email: "superadmin@fairpool.local",
      role: "trueAdmin",
      departmentId: "dept-cse",
      semester: 8,
      active: true,
      blocked: false,
    },
    {
      id: "user-admin",
      studentId: "88888888888888",
      name: "সহকারী প্রশাসক",
      email: "admin@fairpool.local",
      role: "admin",
      departmentId: "dept-eee",
      semester: 8,
      active: true,
      blocked: false,
    },
  ];

  const settings: SiteSettings = {
    brandName: "ফেয়ারপুল",
    logoUrl: null,
    faviconUrl: null,
    heroBannerUrl: null,
    trustedUniversities: [
      "ঢাকা বিশ্ববিদ্যালয়",
      "BUET",
      "চট্টগ্রাম বিশ্ববিদ্যালয়",
      "রাজশাহী বিশ্ববিদ্যালয়",
      "NSU",
      "BRAC University",
    ],
    footer: {
      description: "স্বচ্ছ ও নিরাপদ বিশ্ববিদ্যালয় ভোটিং প্ল্যাটফর্ম।",
      address:
        "শিক্ষার্থী সংসদ ভবন, কেন্দ্রীয় ক্যাম্পাস, ঢাকা-১২০৭, বাংলাদেশ",
      phone: "+৮৮০ ১২৩৪ ৫৬৭৮৯০",
      email: "support@fairpool.local",
      facebookUrl: "https://facebook.com",
      facebookFans: "৪৪৬K",
      youtubeUrl: "https://youtube.com",
      youtubeSubs: "৬.৭৭K",
      columns: [
        {
          title: "ভোটিং",
          links: ["চলমান নির্বাচন", "ফলাফল", "প্রার্থী তালিকা"],
        },
        {
          title: "সহায়তা",
          links: ["কীভাবে ভোট দেবেন", "প্রশ্নোত্তর", "যোগাযোগ"],
        },
        {
          title: "নীতিমালা",
          links: ["শর্তাবলী", "গোপনীয়তা নীতি", "নিরপেক্ষতা"],
        },
      ],
      copyright: "সর্বস্বত্ব সংরক্ষিত © ২০২৪ - ২০২৬ । ফেয়ারপুল",
    },
  };

  return {
    departments,
    elections,
    candidates,
    votes: [],
    profiles,
    gpsLogs: [],
    devices: [],
    settings,
  };
}

// ── Persistence ──────────────────────────────────────────────────────────
let memory: DB | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function load(): DB {
  if (memory) return memory;
  if (!isBrowser()) {
    memory = seed();
    return memory;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memory = raw ? (JSON.parse(raw) as DB) : seed();
  } catch {
    memory = seed();
  }
  return memory;
}

function persist(): void {
  if (!isBrowser() || !memory) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  emit();
}

// ── Simple pub/sub so components re-render after mutations ─────────────────
type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit(): void {
  listeners.forEach((fn) => fn());
}

// ── Read helpers ───────────────────────────────────────────────────────────
export function getDepartments(): Department[] {
  return load().departments;
}

export function getElections(): Election[] {
  return load().elections;
}

export function getElection(id: string): Election | undefined {
  return load().elections.find((e) => e.id === id);
}

export function getActiveElection(): Election | undefined {
  return load().elections.find((e) => e.status === "active");
}

export function getCandidates(electionId: string): Candidate[] {
  return load().candidates.filter((c) => c.electionId === electionId);
}

export function getTallies(electionId: string): Tally[] {
  const db = load();
  const counts = new Map<string, number>();
  for (const c of db.candidates.filter((c) => c.electionId === electionId)) {
    counts.set(c.id, 0);
  }
  for (const v of db.votes.filter((v) => v.electionId === electionId)) {
    counts.set(v.candidateId, (counts.get(v.candidateId) ?? 0) + 1);
  }
  return [...counts.entries()].map(([candidateId, count]) => ({
    candidateId,
    count,
  }));
}

export function hasVoted(electionId: string, voterId: string): boolean {
  return load().votes.some(
    (v) => v.electionId === electionId && v.voterId === voterId,
  );
}

// ── Vote casting (mirrors the cast_vote RPC contract) ──────────────────────
const lastVoteAttempt = new Map<string, number>();

export function castVote(
  electionId: string,
  candidateId: string,
  voterId: string,
  coords?: { lat: number; lon: number },
): CastVoteResult {
  const db = load();

  // Rate limit: 1 attempt per 3s per user (demo of throttling).
  const key = `${voterId}`;
  const last = lastVoteAttempt.get(key) ?? 0;
  if (Date.now() - last < 3000) {
    return { ok: false, code: "rate_limited", message: "একটু পরে আবার চেষ্টা করুন" };
  }
  lastVoteAttempt.set(key, Date.now());

  const election = db.elections.find((e) => e.id === electionId);
  if (!election) {
    return { ok: false, code: "invalid_candidate", message: "নির্বাচন পাওয়া যায়নি" };
  }

  // Active window check.
  const now = Date.now();
  const active =
    election.status === "active" &&
    now >= new Date(election.startsAt).getTime() &&
    now <= new Date(election.endsAt).getTime();
  if (!active) {
    return { ok: false, code: "election_inactive", message: "নির্বাচন চলমান নয়" };
  }

  // Valid candidate check.
  const candidate = db.candidates.find(
    (c) => c.id === candidateId && c.electionId === electionId,
  );
  if (!candidate) {
    return { ok: false, code: "invalid_candidate", message: "প্রার্থী সঠিক নয়" };
  }

  // Geo check.
  if (election.geoRequired && election.geoLat != null && election.geoLon != null) {
    if (!coords) {
      return { ok: false, code: "outside_geo", message: "অবস্থান পাওয়া যায়নি" };
    }
    const ok = withinRadius(
      coords.lat,
      coords.lon,
      election.geoLat,
      election.geoLon,
      election.geoRadiusM ?? 1000,
    );
    if (!ok) {
      return { ok: false, code: "outside_geo", message: "আপনি নির্ধারিত এলাকার বাইরে" };
    }
  }

  // Idempotency / one-vote-per-person.
  if (hasVoted(electionId, voterId)) {
    return { ok: false, code: "already_voted", message: "আপনি ইতিমধ্যে ভোট দিয়েছেন" };
  }

  db.votes.push({
    id: `vote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    electionId,
    candidateId,
    voterId,
    castAt: new Date().toISOString(),
  });
  persist();
  return { ok: true, code: "ok", message: "ভোট গৃহীত হয়েছে" };
}

// ── Auth (local demo mode) ─────────────────────────────────────────────────
export function currentUser(): Profile | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

function setSession(profile: Profile | null): void {
  if (!isBrowser()) return;
  if (profile) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  emit();
}

/**
 * Local auth: accepts either a 14-digit student ID or an email address.
 * Passwords escalate role for the demo: "super" → trueAdmin, "admin" → admin,
 * anything else → student. Blocked users are rejected.
 */
export function login(identifier: string, password: string): Profile | null {
  const db = load();
  const isEmail = identifier.includes("@");
  const role: Profile["role"] =
    password === "super" ? "trueAdmin" : password === "admin" ? "admin" : "student";

  let profile: Profile | undefined;

  if (isEmail) {
    // Email login — must match an existing profile
    profile = db.profiles.find((p) => p.email === identifier);
    if (!profile) return null;
  } else {
    // Student ID login
    if (!/^\d{14}$/.test(identifier)) return null;
    profile = db.profiles.find((p) => p.studentId === identifier);
    if (!profile) {
      // Auto-create a demo profile for unknown IDs
      profile = {
        id: `user-${identifier}`,
        studentId: identifier,
        name:
          role === "trueAdmin"
            ? "প্রধান প্রশাসক"
            : role === "admin"
              ? "প্রশাসক"
              : `শিক্ষার্থী ${identifier.slice(-4)}`,
        email: `${identifier}@fairpool.local`,
        role,
        departmentId: db.departments[0]?.id ?? null,
        semester: 1,
        active: true,
        blocked: false,
      };
      db.profiles.push(profile);
    }
  }

  if (profile.blocked) return null;
  // Allow demo role escalation but never demote the true admin.
  if (role !== "student" && profile.role !== "trueAdmin") profile.role = role;

  persist();
  rememberDevice(profile.id);
  touchActivity();
  setSession(profile);
  return profile;
}

export function register(input: {
  studentId: string;
  name: string;
  email?: string;
  password: string;
  departmentId: string;
  semester: number;
}): Profile | null {
  if (!/^\d{14}$/.test(input.studentId)) return null;
  const db = load();
  const role: Profile["role"] =
    input.password === "super"
      ? "trueAdmin"
      : input.password === "admin"
        ? "admin"
        : "student";
  const resolvedEmail = input.email?.trim() || `${input.studentId}@fairpool.local`;
  let profile = db.profiles.find((p) => p.studentId === input.studentId);
  if (profile) {
    if (profile.blocked) return null;
    profile.name = input.name;
    profile.email = resolvedEmail;
    profile.departmentId = input.departmentId;
    profile.semester = input.semester;
    if (role !== "student" && profile.role !== "trueAdmin") profile.role = role;
  } else {
    profile = {
      id: `user-${input.studentId}`,
      studentId: input.studentId,
      name: input.name,
      email: resolvedEmail,
      role,
      departmentId: input.departmentId,
      semester: input.semester,
      active: true,
      blocked: false,
    };
    db.profiles.push(profile);
  }
  persist();
  rememberDevice(profile.id);
  touchActivity();
  setSession(profile);
  return profile;
}

export function logout(): void {
  setSession(null);
}

// ── Admin CRUD ─────────────────────────────────────────────────────────────
export function upsertElection(e: Election): void {
  const db = load();
  const idx = db.elections.findIndex((x) => x.id === e.id);
  if (idx >= 0) db.elections[idx] = e;
  else db.elections.push(e);
  persist();
}

export function deleteElection(id: string): void {
  const db = load();
  db.elections = db.elections.filter((e) => e.id !== id);
  db.candidates = db.candidates.filter((c) => c.electionId !== id);
  db.votes = db.votes.filter((v) => v.electionId !== id);
  persist();
}

export function upsertCandidate(c: Candidate): void {
  const db = load();
  const idx = db.candidates.findIndex((x) => x.id === c.id);
  if (idx >= 0) db.candidates[idx] = c;
  else db.candidates.push(c);
  persist();
}

export function deleteCandidate(id: string): void {
  const db = load();
  db.candidates = db.candidates.filter((c) => c.id !== id);
  db.votes = db.votes.filter((v) => v.candidateId !== id);
  persist();
}

export function upsertDepartment(d: Department): void {
  const db = load();
  const idx = db.departments.findIndex((x) => x.id === d.id);
  if (idx >= 0) db.departments[idx] = d;
  else db.departments.push(d);
  persist();
}

export function deleteDepartment(id: string): void {
  const db = load();
  db.departments = db.departments.filter((d) => d.id !== id);
  persist();
}

export function getProfiles(): Profile[] {
  return load().profiles;
}

export function getKpis() {
  const db = load();
  return {
    users: db.profiles.length,
    elections: db.elections.length,
    candidates: db.candidates.length,
    votes: db.votes.length,
  };
}

/** Reset all demo data (useful from the admin settings page). */
export function resetDemoData(): void {
  memory = seed();
  persist();
}

// ════════════════════════════════════════════════════════════════════════
// Site settings / CMS  (admin can change any text + image)
// ════════════════════════════════════════════════════════════════════════
export function getSettings(): SiteSettings {
  return load().settings;
}

export function updateSettings(patch: Partial<SiteSettings>): void {
  const db = load();
  db.settings = { ...db.settings, ...patch };
  persist();
}

export function updateFooter(patch: Partial<SiteSettings["footer"]>): void {
  const db = load();
  db.settings.footer = { ...db.settings.footer, ...patch };
  persist();
}

export function updateTrustedUniversities(list: string[]): void {
  const db = load();
  db.settings.trustedUniversities = list;
  persist();
}

// ════════════════════════════════════════════════════════════════════════
// GPS logs  (admin audit of where votes were attempted)
// ════════════════════════════════════════════════════════════════════════
export function recordGps(entry: Omit<GpsLog, "id" | "at">): void {
  const db = load();
  db.gpsLogs.unshift({
    ...entry,
    id: `gps-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
  });
  // Keep the log bounded.
  if (db.gpsLogs.length > 500) db.gpsLogs = db.gpsLogs.slice(0, 500);
  persist();
}

export function getGpsLogs(userId?: string): GpsLog[] {
  const logs = load().gpsLogs;
  return userId ? logs.filter((l) => l.userId === userId) : logs;
}

// ════════════════════════════════════════════════════════════════════════
// Two-tier admin user management
//  - trueAdmin (the one true admin): can block/delete/reset ANYONE except self
//  - admin: can block/delete/reset everyone EXCEPT a trueAdmin (and not self)
// ════════════════════════════════════════════════════════════════════════

/** Whether `actor` is permitted to act on `target` (block/delete/reset). */
export function canManage(actorRole: Profile["role"], target: Profile, actorId: string): boolean {
  if (target.id === actorId) return false; // never act on self
  if (actorRole === "trueAdmin") return true; // true admin can touch anyone else
  if (actorRole === "admin") return target.role !== "trueAdmin"; // admin can't touch the true admin
  return false; // students manage no one
}

export function setBlocked(
  actor: { id: string; role: Profile["role"] },
  targetId: string,
  blocked: boolean,
): { ok: boolean; message: string } {
  const db = load();
  const target = db.profiles.find((p) => p.id === targetId);
  if (!target) return { ok: false, message: "ব্যবহারকারী পাওয়া যায়নি" };
  if (!canManage(actor.role, target, actor.id)) {
    return { ok: false, message: "এই কাজের অনুমতি নেই" };
  }
  target.blocked = blocked;
  persist();
  return { ok: true, message: blocked ? "ব্লক করা হয়েছে" : "আনব্লক করা হয়েছে" };
}

export function deleteUser(
  actor: { id: string; role: Profile["role"] },
  targetId: string,
): { ok: boolean; message: string } {
  const db = load();
  const target = db.profiles.find((p) => p.id === targetId);
  if (!target) return { ok: false, message: "ব্যবহারকারী পাওয়া যায়নি" };
  if (!canManage(actor.role, target, actor.id)) {
    return { ok: false, message: "এই কাজের অনুমতি নেই" };
  }
  // Remove the user AND all their data (votes, gps logs, devices).
  db.profiles = db.profiles.filter((p) => p.id !== targetId);
  db.votes = db.votes.filter((v) => v.voterId !== targetId);
  db.gpsLogs = db.gpsLogs.filter((l) => l.userId !== targetId);
  db.devices = db.devices.filter((d) => d.userId !== targetId);
  persist();
  return { ok: true, message: "ব্যবহারকারী ও তার সকল তথ্য মুছে ফেলা হয়েছে" };
}

/**
 * Reset a user's password. In local demo mode there is no stored password, so
 * this clears the user's known devices — forcing a fresh OTP/device check on
 * next sign-in. In Clerk mode this maps to the Clerk Backend API password
 * reset (see SETUP.md).
 */
export function resetUserPassword(
  actor: { id: string; role: Profile["role"] },
  targetId: string,
): { ok: boolean; message: string } {
  const db = load();
  const target = db.profiles.find((p) => p.id === targetId);
  if (!target) return { ok: false, message: "ব্যবহারকারী পাওয়া যায়নি" };
  if (!canManage(actor.role, target, actor.id)) {
    return { ok: false, message: "এই কাজের অনুমতি নেই" };
  }
  db.devices = db.devices.filter((d) => d.userId !== targetId);
  persist();
  return { ok: true, message: "পাসওয়ার্ড রিসেট — পরবর্তী লগইনে যাচাই লাগবে" };
}

// ════════════════════════════════════════════════════════════════════════
// Inactivity lock + remembered devices
//  - Re-auth required after INACTIVITY_MS (3h) of no activity.
//  - A new device (no remembered fingerprint) should trigger OTP — in local
//    mode we flag it; in Clerk mode Clerk's device verification handles it.
// ════════════════════════════════════════════════════════════════════════
const ACTIVITY_KEY = "fairpool:lastActivity";
const DEVICE_KEY = "fairpool:device";

export function touchActivity(): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
}

/** True when the session has been idle longer than the 3-hour threshold. */
export function isInactive(): boolean {
  if (!isBrowser()) return false;
  const last = Number(window.localStorage.getItem(ACTIVITY_KEY) ?? 0);
  if (!last) return false;
  return Date.now() - last > INACTIVITY_MS;
}

function deviceFingerprint(): string {
  if (!isBrowser()) return "server";
  const ua = navigator.userAgent;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Lightweight, stable per-browser fingerprint (not for security — demo only).
  let hash = 0;
  const s = `${ua}|${lang}|${tz}`;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return `dev-${Math.abs(hash)}`;
}

/** Is the current browser a recognised device for this user? */
export function isKnownDevice(userId: string): boolean {
  if (!isBrowser()) return true;
  const fp = window.localStorage.getItem(DEVICE_KEY) ?? deviceFingerprint();
  return load().devices.some((d) => d.id === fp && d.userId === userId);
}

export function rememberDevice(userId: string): void {
  if (!isBrowser()) return;
  const fp = deviceFingerprint();
  window.localStorage.setItem(DEVICE_KEY, fp);
  const db = load();
  const existing = db.devices.find((d) => d.id === fp && d.userId === userId);
  if (existing) {
    existing.lastSeen = new Date().toISOString();
  } else {
    db.devices.push({
      id: fp,
      userId,
      label: navigator.userAgent.slice(0, 60),
      lastSeen: new Date().toISOString(),
    });
  }
  persist();
}

export function getUserDevices(userId: string): KnownDevice[] {
  return load().devices.filter((d) => d.userId === userId);
}
