import { z } from "zod";

/** Runtime validation for all server-action inputs (Zod). */

export const studentIdSchema = z
  .string()
  .regex(/^\d{14}$/, "১৪ সংখ্যার আইডি দিন");

export const loginSchema = z.object({
  studentId: studentIdSchema,
  password: z.string().min(1),
});

export const registerSchema = z.object({
  studentId: studentIdSchema,
  name: z.string().min(1).max(80),
  password: z.string().min(1),
  departmentId: z.string().min(1),
  semester: z.coerce.number().int().min(1).max(16),
});

export const castVoteSchema = z.object({
  electionId: z.string().min(1),
  candidateId: z.string().min(1),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
});

export const electionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(160),
  description: z.string().max(500).default(""),
  status: z.enum(["draft", "active", "closed"]),
  startsAt: z.string(),
  endsAt: z.string(),
  geoRequired: z.boolean(),
  geoLat: z.number().nullable(),
  geoLon: z.number().nullable(),
  geoRadiusM: z.number().int().positive().nullable(),
});

export const candidateSchema = z.object({
  id: z.string().optional(),
  electionId: z.string().min(1),
  name: z.string().min(1).max(120),
  departmentId: z.string().nullable(),
  photoUrl: z.string().url().nullable().or(z.literal(null)),
  symbolUrl: z.string().url().nullable().or(z.literal(null)),
  promises: z.array(z.string().max(200)).max(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CastVoteInput = z.infer<typeof castVoteSchema>;
