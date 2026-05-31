"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getDepartments, login, register } from "@/lib/data";
import { bn } from "@/i18n/bn";

const inputCls =
  "h-11 w-full rounded-lg border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40";

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

function LoginForm() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!/^\d{14}$/.test(studentId)) return setError(bn.auth.invalidId);
    const user = login(studentId, password);
    if (!user) return setError(bn.auth.invalidId);
    router.push(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="space-y-4">
      <input
        value={studentId}
        onChange={(e) => {
          setStudentId(e.target.value.replace(/\D/g, "").slice(0, 14));
          setError("");
        }}
        inputMode="numeric"
        placeholder={bn.auth.studentIdHint}
        className={inputCls}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={bn.auth.password}
        className={inputCls}
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button onClick={submit} size="lg" className="w-full">
        <LogIn className="h-4 w-4" />
        {bn.auth.loginCta}
      </Button>
      <p className="rounded-lg bg-white/5 p-3 text-center text-xs text-white/50">
        ডেমো: যেকোনো ১৪-সংখ্যার আইডি · পাসওয়ার্ড &ldquo;admin&rdquo; দিলে অ্যাডমিন
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
    departmentId: departments[0]?.id ?? "",
    semester: "1",
    password: "",
    confirm: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const match = form.password.length > 0 && form.password === form.confirm;

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  function submit() {
    if (!form.name.trim()) return setError("নাম দিন");
    if (!/^\d{14}$/.test(form.studentId)) return setError(bn.auth.invalidId);
    if (!match) return setError(bn.auth.passwordMismatch);
    if (!accepted) return setError("শর্তাবলী মেনে নিন");
    const user = register({
      name: form.name.trim(),
      studentId: form.studentId,
      departmentId: form.departmentId,
      semester: Number(form.semester),
      password: form.password,
    });
    if (!user) return setError(bn.auth.invalidId);
    router.push(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="space-y-3">
      <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={bn.auth.name} className={inputCls} />
      <input
        value={form.studentId}
        onChange={(e) => set("studentId", e.target.value.replace(/\D/g, "").slice(0, 14))}
        inputMode="numeric"
        placeholder={bn.auth.studentIdHint}
        className={inputCls}
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)} className={inputCls}>
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
      <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={bn.auth.password} className={inputCls} />
      <div className="relative">
        <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder={bn.auth.confirmPassword} className={inputCls} />
        <div className="absolute inset-y-0 right-3 flex items-center transition-opacity duration-300" style={{ opacity: match ? 1 : 0 }}>
          <Check className="h-5 w-5 text-green-400" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-4 w-4 accent-primary" />
        <span>
          {bn.auth.acceptTerms}{" "}
          <Link href="/terms" className="text-primary hover:underline">
            ({bn.auth.terms})
          </Link>
        </span>
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button onClick={submit} size="lg" className="w-full">
        <UserPlus className="h-4 w-4" />
        {bn.auth.registerCta}
      </Button>
    </div>
  );
}
