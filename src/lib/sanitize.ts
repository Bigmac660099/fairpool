/**
 * Input sanitization (XSS defense-in-depth).
 *
 * Mitigates: stored / reflected Cross-Site Scripting. React escapes text nodes,
 * but we sanitize on WRITE so malicious markup never enters the data store (and
 * stays safe if later rendered raw, exported to CSV, or shown in a tool that
 * doesn't auto-escape). Strategy: strict allowlist — strip ALL HTML tags and
 * control characters rather than blocklisting "dangerous" ones.
 */

// ASCII control chars (0x00-0x1F and 0x7F) written as escapes — no literal bytes.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;

/** Remove every HTML tag, angle bracket, and control char; collapse whitespace. */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Names: letters (incl. Bengali), spaces, dots, hyphens, apostrophes only. */
export function sanitizeName(input: string): string {
  return sanitizeText(input)
    .replace(/[^\p{L}\p{M}\s.'-]/gu, "")
    .slice(0, 80);
}

/** Lowercased, trimmed email with surrounding markup stripped. */
export function sanitizeEmail(input: string): string {
  return sanitizeText(input).toLowerCase().slice(0, 254);
}

/** Digits only (student id, phone) capped to a max length. */
export function sanitizeDigits(input: string, max = 14): string {
  return input.replace(/\D/g, "").slice(0, max);
}
