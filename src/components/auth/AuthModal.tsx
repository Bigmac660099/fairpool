"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, Eye, EyeOff, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GhostInput } from "@/components/ui/input";
import { getDepartments, login, register } from "@/lib/data";
import { isClerkMode } from "@/lib/auth-mode";
import { bn } from "@/i18n/bn";

/* ── Helpers ──────────────────────────────────────────────────── */
const BLOCKED_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwaway.email",
  "yopmail.com","sharklasers.com","trashmail.com","maildrop.cc",
  "dispostable.com","fakeinbox.com","mintemail.com","tempr.email",
]);

function isMainstreamEmail(email: string) {
  const d = email.split("@")[1]?.toLowerCase() ?? "";
  return d.length > 0 && !BLOCKED_DOMAINS.has(d);
}

const labelCls = "block text-xs font-medium text-white/60 mb-1.5";

/* ── Google button ────────────────────────────────────────────── */
function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled={!isClerkMode}
      title={!isClerkMode ? bn.auth.gmailLocalNote : undefined}
      className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-white/18 bg-white/8 text-sm font-medium text-white/85 transition-colors hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  );
}

/* ── Main card ────────────────────────────────────────────────── */
export function AuthModal({
  tab,
  onTabChange,
}: {
  tab: "login" | "register";
  onTabChange: (t: "login" | "register") => void;
}) {
  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-white/12 bg-white/5 px-7 py-8 shadow-2xl backdrop-blur-2xl">
      {/* Brand */}
      <div className="mb-7 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 text-sm font-black text-white">
          FP
        </div>
        <h1 className="text-xl font-bold text-white">{bn.app.name}</h1>
        <p className="mt-0.5 text-xs text-white/50">{bn.app.tagline}</p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => onTabChange(v as "login" | "register")}>
        <TabsList className="mb-6 w-full">
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
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

/* ── Login form ───────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  function submit() {
    const isEmail = identifier.includes("@");
    if (!isEmail && !/^\d{14}$/.test(identifier))
      return setError(bn.auth.invalidIdentifier);
    if (isEmail && !isMainstreamEmail(identifier))
      return setError(bn.auth.disposableEmail);
    setLoading(true);
    const user = login(identifier, password);
    setLoading(false);
    if (!user) return setError(bn.auth.invalidIdentifier);
    router.push(user.role === "student" ? "/dashboard" : "/admin");
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>{bn.auth.studentId} / {bn.auth.email.split(" ")[0]}</label>
        <GhostInput
          value={identifier}
          onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={bn.auth.identifierHint}
          autoComplete="username"
        />
      </div>
      <div>
        <label className={labelCls}>{bn.auth.password}</label>
        <div className="relative">
          <GhostInput
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••"
            autoComplete="current-password"
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
      )}

      <Button
        onClick={submit}
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {bn.auth.loginCta}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] text-white/35">অথবা</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton label={bn.auth.gmailLogin} />

      <p className="text-center text-[11px] text-white/30">
        ডেমো: ১৪-সংখ্যার আইডি · &quot;admin&quot; পাসওয়ার্ড দিলে অ্যাডমিন
      </p>
    </div>
  );
}

/* ── Register form ────────────────────────────────────────────── */
function RegisterForm() {
  const router = useRouter();
  const departments = getDepartments();

  const [form, setForm] = useState({
    name: "", studentId: "", email: "",
    departmentId: departments[0]?.id ?? "",
    semester: "1", password: "", confirm: "",
  });
  const [showPw, setShowPw]   = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  /* Character-by-character match analysis */
  const { matchPct, mismatchPct, mismatchOffset, fullyMatched } = useMemo(() => {
    const pw = form.password; const cf = form.confirm;
    if (!pw || !cf) return { matchPct: 0, mismatchPct: 0, mismatchOffset: 0, fullyMatched: false };
    let m = 0;
    while (m < Math.min(pw.length, cf.length) && pw[m] === cf[m]) m++;
    const total = Math.max(pw.length, 1);
    return {
      matchPct:      m / total * 100,
      mismatchPct:   Math.min(cf.length - m, pw.length - m) / total * 100,
      mismatchOffset:m / total * 100,
      fullyMatched:  pw.length > 0 && pw === cf,
    };
  }, [form.password, form.confirm]);

  const selectedDept = departments.find((d) => d.id === form.departmentId);
  const maxSem = selectedDept?.maxSemester ?? 12;

  function submit() {
    if (!form.name.trim())                  return setError("নাম দিন");
    if (!/^\d{14}$/.test(form.studentId))   return setError(bn.auth.invalidId);
    if (form.email && !isMainstreamEmail(form.email)) return setError(bn.auth.disposableEmail);
    const sem = Number(form.semester);
    if (!sem || sem < 1 || sem > maxSem)
      return setError(`সেমিস্টার ১ থেকে ${maxSem}-এর মধ্যে হতে হবে`);
    if (!fullyMatched)                      return setError(bn.auth.passwordMismatch);
    if (!accepted)                          return setError("শর্তাবলী মেনে নিন");
    setLoading(true);
    const user = register({
      name: form.name.trim(), studentId: form.studentId,
      email: form.email, departmentId: form.departmentId,
      semester: Number(form.semester), password: form.password,
    });
    setLoading(false);
    if (!user) return setError(bn.auth.invalidId);
    router.push(user.role === "student" ? "/dashboard" : "/admin");
  }

  const inputCls = "h-10 w-full rounded-lg border border-white/15 bg-white/8 px-3.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/35 focus:bg-white/12 focus:ring-2 focus:ring-white/10 transition-colors";

  return (
    <div className="fp-scroll max-h-[68vh] space-y-4 overflow-y-auto pr-0.5">
      {/* Name */}
      <div>
        <label className={labelCls}>{bn.auth.name}</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)}
          placeholder="পূর্ণ নাম লিখুন" autoComplete="name" className={inputCls} />
      </div>

      {/* Student ID */}
      <div>
        <label className={labelCls}>{bn.auth.studentId}</label>
        <input
          value={form.studentId}
          onChange={(e) => set("studentId", e.target.value.replace(/\D/g, "").slice(0, 14))}
          inputMode="numeric" placeholder={bn.auth.studentIdHint}
          autoComplete="username" className={inputCls}
        />
      </div>

      {/* Email */}
      <div>
        <label className={labelCls}>{bn.auth.email} <span className="text-white/30">(ঐচ্ছিক)</span></label>
        <input value={form.email} onChange={(e) => set("email", e.target.value)}
          type="email" placeholder="gmail.com / outlook.com"
          autoComplete="email" className={inputCls} />
      </div>

      {/* Dept + Semester */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{bn.auth.department}</label>
          <select value={form.departmentId}
            onChange={(e) => set("departmentId", e.target.value)}
            className={`${inputCls} cursor-pointer`}>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0a1628]">{d.code}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{bn.auth.semester} <span className="text-white/30">(১–{maxSem})</span></label>
          <input value={form.semester}
            onChange={(e) => set("semester", e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric" placeholder="১" className={inputCls} />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className={labelCls}>{bn.auth.password}</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••" autoComplete="new-password"
            className={`${inputCls} pr-10`} />
          <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/65">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label className={labelCls}>{bn.auth.confirmPassword}</label>
        <div className="relative">
          <input
            type="password" value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            placeholder="••••••••" autoComplete="new-password"
            className={`${inputCls} pr-10 ${fullyMatched ? "border-emerald-400/50 bg-emerald-400/8" : form.confirm && !form.password.startsWith(form.confirm) ? "border-red-400/50" : ""}`}
          />
          <AnimatePresence>
            {fullyMatched && (
              <motion.div
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
              >
                <Check className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Match progress strip */}
        {form.password.length > 0 && form.confirm.length > 0 && (
          <div className="relative mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute left-0 top-0 h-full bg-emerald-400"
              animate={{ width: `${matchPct}%` }}
              transition={{ duration: 0.06 }}
            />
            {mismatchPct > 0 && (
              <motion.div
                className="absolute top-0 h-full bg-rose-400/75"
                animate={{ left: `${mismatchOffset}%`, width: `${mismatchPct}%` }}
                transition={{ duration: 0.06 }}
              />
            )}
          </div>
        )}
      </div>

      {/* T&C */}
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/60">
        <input type="checkbox" checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary flex-shrink-0" />
        <span>
          {bn.auth.acceptTerms}{" "}
          <Link href="/terms" className="text-primary hover:underline">
            ({bn.auth.terms})
          </Link>
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
      )}

      <Button onClick={submit} size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {bn.auth.registerCta}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] text-white/35">অথবা</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton label={bn.auth.gmailRegister} />
    </div>
  );
}
