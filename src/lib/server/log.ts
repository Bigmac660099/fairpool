import "server-only";

/**
 * Safe server logging with secret/PII redaction.
 *
 * Mitigates: credential & PII leakage into logs / log aggregators. Before
 * anything is written, known-sensitive keys are scrubbed and long token-like
 * strings are truncated. In production, verbose objects are suppressed so
 * internal details never reach stdout where they could be harvested.
 */

const SENSITIVE_KEYS = [
  "password", "pass", "pwd",
  "token", "accesstoken", "refreshtoken",
  "authorization", "cookie", "secret",
  "apikey", "api_key", "key",
  "email", "studentid", "student_id",
  "ssn", "card", "cvv",
];

const isProd = process.env.NODE_ENV === "production";

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.includes(key.toLowerCase())) return "[REDACTED]";
  if (typeof value === "string" && value.length > 40 && /^[A-Za-z0-9._-]+$/.test(value)) {
    // Looks like a token/JWT — keep a short prefix only.
    return `${value.slice(0, 6)}…[REDACTED]`;
  }
  return value;
}

function deepRedact(obj: unknown, depth = 0): unknown {
  if (depth > 4 || obj == null) return obj;
  if (Array.isArray(obj)) return obj.map((v) => deepRedact(v, depth + 1));
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const red = redactValue(k, v);
      out[k] = red === v ? deepRedact(v, depth + 1) : red;
    }
    return out;
  }
  return obj;
}

/** Redacted error log. Use instead of console.error in server paths. */
export function logError(scope: string, err: unknown, context?: Record<string, unknown>): void {
  const safeContext = context ? deepRedact(context) : undefined;
  if (isProd) {
    // Production: message only, no stack/details that could leak internals.
    const message = err instanceof Error ? err.message : "error";
    console.error(`[${scope}] ${message}`, safeContext ?? "");
  } else {
    console.error(`[${scope}]`, err, safeContext ?? "");
  }
}

/** Redacted info log. */
export function logInfo(scope: string, context?: Record<string, unknown>): void {
  console.log(`[${scope}]`, context ? deepRedact(context) : "");
}
