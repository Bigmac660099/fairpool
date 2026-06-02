import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHmac,
} from "node:crypto";

/**
 * ─── Encryption at rest (AES-256-GCM) ──────────────────────────────────────
 *
 * Mitigates: a database / backup compromise exposing plaintext PII.
 *
 * Sensitive fields are ciphered with AES-256-GCM (authenticated encryption —
 * detects tampering) BEFORE being written to Supabase. The key is read from
 * the ENCRYPTION_KEY env var and is NEVER hardcoded or committed.
 *
 * Key management / rotation (production):
 *   - Store ENCRYPTION_KEY in a secret manager (AWS KMS / HashiCorp Vault),
 *     not in the repo or plain env files.
 *   - Each ciphertext is prefixed with a key id ("v1:") so keys can be rotated:
 *     decrypt accepts old key ids, new writes use the current key. To rotate,
 *     add the new key, re-encrypt lazily on read, then retire the old key.
 *
 * Searchable fields (email, student_id) cannot use randomized encryption and
 * still be looked up. For those, use the deterministic blind index below
 * (HMAC) for equality lookups while keeping the value itself encrypted.
 */

const KEY_ID = "v1";

/** 32-byte key from base64 env. Returns null in demo mode (no key set). */
function getKey(): Buffer | null {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded AES-256 key)");
  }
  return key;
}

/** Whether at-rest encryption is active (key configured). */
export const isEncryptionConfigured = Boolean(process.env.ENCRYPTION_KEY);

/**
 * Encrypt a UTF-8 string → "v1:iv:tag:ciphertext" (all base64).
 * In demo mode (no key) returns the input unchanged so the app still runs.
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext == null) return null;
  const key = getKey();
  if (!key) return plaintext; // demo mode — no key configured
  const iv = randomBytes(12); // GCM standard 96-bit nonce
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${KEY_ID}:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

/** Decrypt a value produced by encryptField(). Passes through unencrypted values. */
export function decryptField(value: string | null | undefined): string | null {
  if (value == null) return null;
  const key = getKey();
  if (!key) return value;
  const parts = value.split(":");
  if (parts.length !== 4 || parts[0] !== KEY_ID) return value; // not ciphertext we wrote
  const [, ivB64, tagB64, dataB64] = parts;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Auth-tag failure = tampering or wrong key. Never leak details.
    return null;
  }
}

/**
 * Deterministic blind index for equality lookups on encrypted columns.
 * HMAC-SHA256(value) is stable for the same input, so you can WHERE on it
 * without ever storing the plaintext. Uses ENCRYPTION_KEY as the HMAC secret.
 */
export function blindIndex(value: string): string | null {
  const key = getKey();
  if (!key) return null;
  return createHmac("sha256", key).update(value.trim().toLowerCase()).digest("hex");
}
