/**
 * Data masking / redaction for UI + logs.
 *
 * Mitigates: accidental PII exposure (shoulder-surfing, screenshots, support
 * tickets, log aggregators). Sensitive identifiers are partially hidden in
 * admin tables and audit views; the full value is never rendered unless a
 * privileged action explicitly requires it.
 */

/** "ho•••@gmail.com" — keep 2 leading chars + domain, mask the rest. */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  const head = user.slice(0, 2);
  return `${head}${"•".repeat(Math.max(3, user.length - 2))}@${domain}`;
}

/** "20••••••••••34" — keep first 2 + last 2 digits of a 14-digit student id. */
export function maskStudentId(id: string | null | undefined): string {
  if (!id) return "—";
  if (id.length <= 4) return "•".repeat(id.length);
  return `${id.slice(0, 2)}${"•".repeat(id.length - 4)}${id.slice(-2)}`;
}

/** Keep last 3 digits of a phone number. */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 3) return "•".repeat(digits.length);
  return `${"•".repeat(digits.length - 3)}${digits.slice(-3)}`;
}
