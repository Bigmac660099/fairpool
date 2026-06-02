/** Domain types for FAIRPOOL. Mirrors the Supabase schema. */

export type Role = "student" | "admin" | "trueAdmin";

export interface Profile {
  id: string;
  studentId: string; // 14-digit student id
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
  semester: number | null;
  active: boolean;
  blocked: boolean; // blocked users cannot sign in
}

/** A recorded geolocation sample tied to a vote attempt (admin audit). */
export interface GpsLog {
  id: string;
  userId: string;
  userName: string;
  electionId: string;
  lat: number;
  lon: number;
  distanceM: number;
  inside: boolean;
  at: string; // ISO
}

/** A remembered device. New devices trigger an OTP challenge. */
export interface KnownDevice {
  id: string; // fingerprint
  userId: string;
  label: string;
  lastSeen: string; // ISO
}

/** Editable site content (CMS) — admin can change any of these. */
export interface SiteSettings {
  brandName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  heroBannerUrl: string | null;
  /** List of trusted partner universities shown on the public landing page. */
  trustedUniversities: string[];
  footer: {
    description: string;
    address: string;
    phone: string;
    email: string;
    facebookUrl: string;
    facebookFans: string;
    youtubeUrl: string;
    youtubeSubs: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    copyright: string;
  };
}

export interface Department {
  id: string;
  name: string; // Bengali department name
  code: string;
  maxSemester: number; // highest semester offered (used to cap registration)
}

export type ElectionStatus = "draft" | "active" | "closed";

export interface Election {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  startsAt: string; // ISO
  endsAt: string; // ISO
  geoRequired: boolean;
  geoLat: number | null;
  geoLon: number | null;
  geoRadiusM: number | null;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  departmentId: string | null;
  photoUrl: string | null;
  symbolUrl: string | null;
  promises: string[]; // up to 8 items
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  castAt: string; // ISO
}

/** Aggregated tally returned to results/dashboard views. */
export interface Tally {
  candidateId: string;
  count: number;
}

/** Result of a cast_vote attempt (mirrors the RPC contract). */
export interface CastVoteResult {
  ok: boolean;
  code:
    | "ok"
    | "already_voted"
    | "election_inactive"
    | "outside_geo"
    | "invalid_candidate"
    | "rate_limited";
  message: string;
}
