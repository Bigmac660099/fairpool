"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getDepartments, login, register } from "@/lib/data";
import { isClerkMode } from "@/lib/auth-mode";
import { bn } from "@/i18n/bn";

const inputCls =
  "h-11 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-colors";

/** Domains that are well-known disposable / temp email providers. */
const BLOCKED_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwaway.email",
  "yopmail.com","sharklasers.com","trashmail.com","maildrop.cc",
  "dispostable.com","fakeinbox.com","mailnull.com","spamgourmet.com",
  "getairmail.com","mailnesia.com","mintemail.com","tempinbox.com",
  "tempr.email","discard.email","spamfree24.org","binkmail.com",
]);

function isMainstreamEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return domain.length > 0 && !BLOCKED_DOMAINS.has(domain);
}

/**
 * Glass auth card with animated login/register tabs. The parent controls the
 * shader palette so switching tabs also shifts the background colour.
 */
export function AuthModal({
  tab,
  onTabChange,
}: {
  tab: "login" | "register";
  onTabChange: (t: "login" | "register") => void;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
          F
        </div>
        <h1 className="text-2xl font-bold text-white">{bn.app.name}</h1>
        <p className="mt-1 text-sm text-white/60">{bn.app.tagline}</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => onTabChange(v as "login" | "register")}>
        <TabsList className="mx-auto mb-6 flex w-full justify-center">
          <TabsTrigger value="login" active={tab === "login"} className="flex-1">
            {bn.auth.login}
          </TabsTrigger>
          <TabsTrigger value="register" active={tab === "register"} className="flex-1">
            {bn.auth.register}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "login" ? (
              <TabsContent value="login" forceMount>
                <LoginForm />
              </TabsContent>
            ) : (
              <TabsContent value="register" forceMount>
                <RegisterForm />
              </TabsContent>
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

function GmailButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled={!isClerkMode}
      title={!isClerkMode ? bn.auth.gmailLocalNote : undefined}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-white/20 bg-white/10 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {/* Google "G" SVG */}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  );
}

function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // studentId OR email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const isEmail = identifier.includes("@");
    if (!isEmail && !/^\d{14}$/.test(identifier)) {
      return setError(bn.auth.invalidIdentifier);
    }
    if (isEmail && !isMainstreamEmail(identifier)) {
      return setError(bn.auth.disposableEmail);
    }
    const user = login(identifier, password);
    if (!user) return setError(bn.auth.invalidIdentifier);
    router.push(user.role === "admin" || user.role === "trueAdmin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-white/60">
          {bn.auth.studentId} / {bn.auth.email.split(" ")[0]}
        </label>
        <input
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoComplete="username"
          placeholder={bn.auth.identifierHint}
          className={inputCls}
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-white/60">{bn.auth.password}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={bn.auth.password}
          autoComplete="current-password"
          className={inputCls}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      <Button onClick={submit} size="lg" className="w-full">
        <LogIn className="h-4 w-4" />
        {bn.auth.loginCta}
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-white/15" />
        <span className="text-xs text-white/40">অথবা</span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <GmailButton label={bn.auth.gmailLogin} />

      <p className="rounded-lg bg-white/5 p-3 text-center text-xs text-white/50">
        ডেমো: যেকোনো ১৪-সংখ্যার আইডি · পাসওয়ার্ড <strong>&quot;admin&quot;</strong> দিলে অ্যাডমিন
      </p>
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const departments = getDepartments();
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    email: "",
    departmentId: departments[0]?.id ?? "",
    semester: "1",
    password: "",
    confirm: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  // Character-by-character match analysis
  const { matchedChars, mismatchStart, mismatchLen, fullyMatched } = useMemo(() => {
    const pw = form.password;
    const cf = form.confirm;
    if (!pw || !cf) return { matchedChars: 0, mismatchStart: 0, mismatchLen: 0, fullyMatched: false };
    let m = 0;
    while (m < Math.min(pw.length, cf.length) && pw[m] === cf[m]) m++;
    const total = Math.max(pw.length, 1);
    const mismatchLen = Math.min(cf.length - m, pw.length - m);
    return {
      matchedChars: m,
      mismatchStart: m / total,
      mismatchLen: mismatchLen / total,
      fullyMatched: pw.length > 0 && pw === cf,
    };
  }, [form.password, form.confirm]);

  const showMatchBar = form.password.length > 0 && form.confirm.length > 0;
  const matchProgress = matchedChars / Math.max(form.password.length, 1);

  function submit() {
    if (!form.name.trim()) return setError("নাম দিন");
    if (!/^\d{14}$/.test(form.studentId)) return setError(bn.auth.invalidId);
    if (form.email && !isMainstreamEmail(form.email)) return setError(bn.auth.disposableEmail);
    if (!fullyMatched) return setError(bn.auth.passwordMismatch);
    if (!accepted) return setError("শর্তাবলী মেনে নিন");
    const user = register({
      name: form.name.trim(),
      studentId: form.studentId,
      email: form.email,
      departmentId: form.departmentId,
      semester: Number(form.semester),
      password: form.password,
    });
    if (!user) return setError(bn.auth.invalidId);
    router.push(user.role === "admin" || user.role === "trueAdmin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="fp-scroll max-h-[70vh] space-y-3 overflow-y-auto pr-1">
      {/* Name */}
      <input
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder={bn.auth.name}
        autoComplete="name"
        className={inputCls}
      />
      {/* Student ID — labeled ছাত্র আইডি */}
      <div className="space-y-0.5">
        <label className="block text-xs font-medium text-white/60">{bn.auth.studentId}</label>
        <input
          value={form.studentId}
          onChange={(e) => set("studentId", e.target.value.replace(/\D/g, "").slice(0, 14))}
          inputMode="numeric"
          placeholder={bn.auth.studentIdHint}
          autoComplete="username"
          className={inputCls}
        />
      </div>
      {/* Email */}
      <input
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        type="email"
        placeholder={`${bn.auth.email} (Gmail, Outlook…)`}
        autoComplete="email"
        className={inputCls}
      />
      {/* Department + Semester */}
      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.departmentId}
          onChange={(e) => set("departmentId", e.target.value)}
          className={inputCls}
        >
          {departments.map((d) => (
            <option key={d.id} value={d.id} className="bg-[#0A1628]">
              {d.code}
            </option>
          ))}
        </select>
        <input
          value={form.semester}
          onChange={(e) => set("semester", e.target.value.replace(/\D/g, "").slice(0, 2))}
          inputMode="numeric"
          placeholder={bn.auth.semester}
          className={inputCls}
        />
      </div>
      {/* Password */}
      <input
        type="password"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        placeholder={bn.auth.password}
        autoComplete="new-password"
        className={inputCls}
      />
      {/* Confirm password — with character-by-character match animation */}
      <div className="space-y-1">
        <div className="relative">
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            placeholder={bn.auth.confirmPassword}
            autoComplete="new-password"
            className={`${inputCls} ${
              fullyMatched
                ? "border-green-400 bg-green-500/10 focus:border-green-400 focus:ring-green-400/30"
                : form.confirm && !form.password.startsWith(form.confirm)
                ? "border-red-400/60 bg-red-500/5"
                : ""
            }`}
          />
          {/* Animated SVG checkmark — only when fully matched */}
          <AnimatePresence>
            {fullyMatched && (
              <motion.div
                key="check"
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <motion.path
                    d="M5 11.5 L9.5 16 L18 7"
                    stroke="#4ade80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Character-match progress strip */}
        {showMatchBar && (
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
            {/* Green = matched characters */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-green-400"
              animate={{ width: `${matchProgress * 100}%` }}
              transition={{ duration: 0.06 }}
            />
            {/* Red = mismatched characters after the matched prefix */}
            {mismatchLen > 0 && (
              <motion.div
                className="absolute top-0 h-full bg-rose-400/80"
                animate={{
                  left: `${mismatchStart * 100}%`,
                  width: `${mismatchLen * 100}%`,
                }}
                transition={{ duration: 0.06 }}
              />
            )}
          </div>
        )}
      </div>

      {/* Terms */}
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span>
          {bn.auth.acceptTerms}{" "}
          <Link href="/terms" className="text-primary hover:underline">
            ({bn.auth.terms})
          </Link>
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      <Button onClick={submit} size="lg" className="w-full">
        <UserPlus className="h-4 w-4" />
        {bn.auth.registerCta}
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-white/15" />
        <span className="text-xs text-white/40">অথবা</span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <GmailButton label={bn.auth.gmailRegister} />
    </div>
  );
}
