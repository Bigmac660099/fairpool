"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import {
  MapPin, ShieldCheck, Zap, Users, Lock, BarChart3, CheckCircle2,
  ChevronRight, Globe, Fingerprint, Eye, FileText, QrCode, Vote,
  ArrowRight, Star, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { toBn } from "@/lib/utils";
import { bn } from "@/i18n/bn";
import { getSettings } from "@/lib/data";

const HeroGeometric = dynamic(
  () => import("@/components/ui/hero-geometric").then((m) => m.HeroGeometric),
  { ssr: false },
);

/* ─── Animated counter ───────────────────────────────────────────── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); return; }
      setVal(Math.floor(start));
    }, 28);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{toBn(val)}{suffix}</span>;
}

/* ─── Feature data ───────────────────────────────────────────────── */
const FEATURES = [
  { icon: MapPin,       title: "GPS যাচাই",            desc: "জিপিএস জিওফেন্সিং দ্বারা ভোটারের অবস্থান নিশ্চিত করা হয়।" },
  { icon: ShieldCheck,  title: "এক ব্যক্তি এক ভোট",    desc: "ডিভাইস ফিঙ্গারপ্রিন্ট ও অ্যাকাউন্ট যাচাই দ্বারা প্রতারণা রোধ।" },
  { icon: Zap,          title: "রিয়েল-টাইম ফলাফল",    desc: "ভোট গণনা তাৎক্ষণিক আপডেট হয় — লাইভ ড্যাশবোর্ডে দেখুন।" },
  { icon: Lock,         title: "এন্ড-টু-এন্ড এনক্রিপশন","desc": "সমস্ত ভোট AES-256 ও TLS দ্বারা সুরক্ষিত।" },
  { icon: FileText,     title: "অডিট ট্রেইল",           desc: "প্রতিটি কার্যক্রম লগ করা হয় — সম্পূর্ণ স্বচ্ছতা নিশ্চিত।" },
  { icon: BarChart3,    title: "লাইভ অ্যানালিটিক্স",   desc: "প্রশাসকরা ভোটার টার্নআউট ও নির্বাচনের স্বাস্থ্য পর্যবেক্ষণ করতে পারেন।" },
  { icon: QrCode,       title: "QR চেক-ইন",             desc: "QR কোড স্ক্যানের মাধ্যমে দ্রুত ভোটার যাচাই।" },
  { icon: Fingerprint,  title: "ডিভাইস ফিঙ্গারপ্রিন্ট",desc: "পরিচিত ডিভাইস ট্র্যাকিং — নতুন ডিভাইসে OTP চ্যালেঞ্জ।" },
  { icon: Globe,        title: "মাল্টি-ডিভাইস",        desc: "মোবাইল, ট্যাবলেট ও ডেস্কটপ — সব ডিভাইসে নির্বিঘ্নে কাজ করে।" },
];

const STEPS = [
  { num: "০১", icon: Users,       title: "নিবন্ধন করুন",       desc: "শিক্ষার্থী আইডি, ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট তৈরি করুন।" },
  { num: "০২", icon: MapPin,      title: "অবস্থান যাচাই",      desc: "ভোটের সময় GPS চালু রাখুন — সিস্টেম স্বয়ংক্রিয়ভাবে আপনার অবস্থান যাচাই করবে।" },
  { num: "০৩", icon: Vote,        title: "প্রার্থী নির্বাচন",   desc: "প্রার্থীর প্রোফাইল দেখুন ও পছন্দের প্রার্থীকে ভোট দিন।" },
  { num: "০৪", icon: BarChart3,   title: "ফলাফল দেখুন",        desc: "ভোট দেওয়ার সাথে সাথে রিয়েল-টাইম ফলাফল ড্যাশবোর্ডে দেখুন।" },
];

const TRUST_STATS = [
  { value: 12,  suffix: "+",  label: "বিশ্ববিদ্যালয়" },
  { value: 50000, suffix: "+", label: "নিবন্ধিত ভোটার" },
  { value: 200,  suffix: "+",  label: "নির্বাচন পরিচালিত" },
  { value: 100,  suffix: "%",  label: "স্বচ্ছ প্রক্রিয়া" },
];

/* ─── Navbar ─────────────────────────────────────────────────────── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-background/90 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
            FP
          </span>
          <span className={`font-accent text-lg font-bold tracking-tight ${scrolled ? "text-foreground" : "text-white"}`}>
            {bn.app.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {[
            { href: "#features", label: "বৈশিষ্ট্য" },
            { href: "#security", label: "নিরাপত্তা" },
            { href: "#how",      label: "কীভাবে কাজ করে" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/75 hover:text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className={scrolled ? "" : "text-white hover:bg-white/10"}>
              লগইন
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">নিবন্ধন</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <LandingNav />

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-center justify-center px-5 pb-20 pt-24 text-white">
        <HeroGeometric color1="#0891B2" color2="#08112A" />

        {/* Floating geometric decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="fp-float absolute right-[8%] top-[18%] h-32 w-32 rounded-3xl border border-teal-400/25 bg-teal-400/5 backdrop-blur-sm" style={{ animationDelay: "0s" }} />
          <div className="fp-float absolute left-[6%] top-[35%] h-20 w-20 rounded-2xl border border-primary/30 bg-primary/8 backdrop-blur-sm" style={{ animationDelay: "1.2s" }} />
          <div className="fp-float absolute bottom-[20%] right-[12%] h-16 w-16 rounded-full border border-emerald-400/30 bg-emerald-400/6" style={{ animationDelay: "0.6s" }} />
          {/* Orbiting ring */}
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/3" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Label chip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-sm font-medium text-teal-300 backdrop-blur-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            বাংলাদেশের প্রথম GPS-যাচাইকৃত ভোটিং প্ল্যাটফর্ম
          </motion.div>

          {/* Headline — tear-reveal, line by line. Generous leading so the
              two Bengali lines never overlap on desktop. */}
          <h1 className="text-display-xl font-display font-bold md:text-display-2xl">
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span
                className="block text-white"
                initial={{ y: "108%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                স্বচ্ছ নির্বাচন,
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span
                className="fp-gradient block"
                initial={{ y: "108%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.32, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                নিরাপদ ভবিষ্যৎ
              </motion.span>
            </span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70"
          >
            জিপিএস-যাচাইকৃত, রিয়েল-টাইম বিশ্ববিদ্যালয় ভোটিং প্ল্যাটফর্ম।
            প্রতিটি ভোট সুরক্ষিত, প্রতিটি ফলাফল স্বচ্ছ।
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/register">
              <Button size="xl" className="w-full sm:w-auto">
                এখনই শুরু করুন
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="xl"
                variant="ghost"
                className="w-full border border-white/20 text-white hover:bg-white/10 sm:w-auto"
              >
                লগইন করুন
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust micro-copy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-white/45"
          >
            কোনো ক্রেডিট কার্ড প্রয়োজন নেই · বিনামূল্যে শুরু করুন
          </motion.p>
        </div>

        {/* Scroll indicator — desktop only, hidden on mobile */}
        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:flex"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 pt-1.5">
            <div className="h-2 w-1 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </section>

      {/* ══ STATS BAND ═════════════════════════════════════════════ */}
      <section className="border-y border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-teal-400/5 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-5 md:grid-cols-4">
          {TRUST_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="fp-gradient text-display-md font-black tabular-nums">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-1 text-sm font-medium text-foreground/60">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="fp-label"
            >
              <Star className="h-3 w-3" />
              বৈশিষ্ট্য
            </motion.span>
            <div className="mt-4 overflow-hidden pb-[0.12em]">
              <motion.h2
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-display-md font-bold tracking-tight"
              >
                একটি সম্পূর্ণ{" "}
                <span className="fp-gradient">ভোটিং সমাধান</span>
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-4 max-w-xl text-foreground/65"
            >
              আধুনিক প্রযুক্তি ও নিরাপত্তার সমন্বয়ে তৈরি একটি বিশ্বমানের ভোটিং অভিজ্ঞতা।
            </motion.p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card variant="raised" className="group h-full">
                  <CardBody className="flex flex-col gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-teal-400/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:from-primary/25 group-hover:to-teal-400/20">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-tight">{f.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/65">{f.desc}</p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECURITY SECTION ═══════════════════════════════════════ */}
      <section id="security" className="relative overflow-hidden bg-gradient-to-b from-background via-primary/3 to-background py-24 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="fp-label">
              <Lock className="h-3 w-3" />
              নিরাপত্তা
            </span>
            <div className="mt-4 overflow-hidden pb-[0.12em]">
              <motion.h2
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-display-md font-bold tracking-tight"
              >
                এন্টারপ্রাইজ-মানের{" "}
                <span className="fp-gradient">সুরক্ষা</span>
              </motion.h2>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* E2E Encryption card */}
            <SecurityCard
              icon={<Lock className="h-7 w-7" />}
              title="এন্ড-টু-এন্ড এনক্রিপশন"
              desc="AES-256 এনক্রিপশন ও TLS 1.3 দ্বারা প্রতিটি ভোট সুরক্ষিত।"
              visual={<EncryptionVisual />}
              delay={0}
            />
            {/* GPS Geofence card */}
            <SecurityCard
              icon={<MapPin className="h-7 w-7" />}
              title="GPS জিওফেন্সিং"
              desc="নির্ধারিত ক্যাম্পাস এলাকার মধ্যে থেকে ভোট দিতে হবে।"
              visual={<GeofenceVisual />}
              delay={0.1}
            />
            {/* Audit Trail card */}
            <SecurityCard
              icon={<Eye className="h-7 w-7" />}
              title="অডিট ট্রেইল"
              desc="প্রতিটি ভোটের সময়, অবস্থান ও ডিভাইস তথ্য লগ করা হয়।"
              visual={<AuditVisual />}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════ */}
      <section id="how" className="py-24 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <span className="fp-label">
              <CheckCircle2 className="h-3 w-3" />
              প্রক্রিয়া
            </span>
            <div className="mt-4 overflow-hidden pb-[0.12em]">
              <motion.h2
                initial={{ y: "110%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-display-md font-bold tracking-tight"
              >
                ৪ ধাপে ভোট দিন
              </motion.h2>
            </div>
          </div>

          <div className="relative grid gap-6 md:grid-cols-4">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step circle */}
                <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 to-teal-400/8">
                  <step.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-400 text-[10px] font-black text-white">
                    {toBn(i + 1)}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold tracking-tight text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST BAND ═════════════════════════════════════════════ */}
      <section className="border-y border-border/50 py-16 px-5">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-foreground">
            বিশ্বস্ত প্রতিষ্ঠানসমূহ
          </p>
          <TrustedUniversities />
        </div>
      </section>

      {/* ══ CTA BAND ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 px-5">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-teal-400/6 to-emerald-400/8" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-teal-400/8 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="overflow-hidden pb-[0.12em]">
            <motion.h2
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-display-md font-bold tracking-tight"
            >
              আজই{" "}
              <span className="fp-gradient">ফেয়ারপুল</span>
              -এ যোগ দিন
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-foreground"
          >
            স্বচ্ছ, নিরাপদ ও আধুনিক বিশ্ববিদ্যালয় নির্বাচনের জন্য এখনই নিবন্ধন করুন।
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Link href="/register">
              <Button size="xl">
                বিনামূল্যে নিবন্ধন করুন
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="xl" variant="outline">
                ইতিমধ্যে অ্যাকাউন্ট আছে?
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ─── Trusted universities (reads live from admin CMS) ──────────── */
function TrustedUniversities() {
  const unis = getSettings().trustedUniversities ?? [];
  if (unis.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {unis.map((name) => (
        <div
          key={name}
          className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-card"
        >
          <Building2 className="h-4 w-4 text-primary" />
          {name}
        </div>
      ))}
    </div>
  );
}

/* ─── Security card ──────────────────────────────────────────────── */
function SecurityCard({
  icon, title, desc, visual, delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  visual: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card variant="raised" className="h-full">
        <CardBody className="flex flex-col gap-4">
          {/* Visual illustration */}
          <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-primary/8 to-teal-400/5">
            {visual}
          </div>
          <div className="flex items-center gap-2 text-primary">{icon}</div>
          <div>
            <h3 className="font-semibold tracking-tight">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">{desc}</p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

/* ─── Inline SVG visuals ─────────────────────────────────────────── */
function EncryptionVisual() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="text-primary">
      {/* Data blocks */}
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={8 + i * 36}
          y={28}
          width={28}
          height={20}
          rx={4}
          fill="currentColor"
          fillOpacity={0.12}
          stroke="currentColor"
          strokeOpacity={0.4}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
          style={{ transformOrigin: `${22 + i * 36}px 38px` }}
        />
      ))}
      {/* Lock icon */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        style={{ transformOrigin: "60px 40px" }}
      >
        <rect x="50" y="42" width="20" height="14" rx="3" fill="currentColor" fillOpacity={0.25} stroke="currentColor" strokeOpacity={0.8} />
        <path d="M54 42v-5a6 6 0 0112 0v5" stroke="currentColor" strokeOpacity={0.8} strokeWidth="1.5" />
        <circle cx="60" cy="49" r="2" fill="currentColor" />
      </motion.g>
      {/* Connecting lines */}
      {[22, 58].map((x) => (
        <motion.line
          key={x} x1={x} y1={38} x2={x + 14} y2={38}
          stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
      ))}
    </svg>
  );
}

function GeofenceVisual() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
      {/* Concentric rings */}
      {[48, 34, 20].map((r, i) => (
        <motion.circle
          key={r} cx="60" cy="40" r={r}
          stroke="hsl(185 65% 44%)"
          strokeOpacity={0.15 + i * 0.15}
          strokeDasharray={i === 0 ? "5 3" : "none"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "60px 40px" }}
        />
      ))}
      {/* User pin */}
      <motion.circle
        cx="60" cy="40" r="5"
        fill="hsl(185 65% 44%)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        style={{ transformOrigin: "60px 40px" }}
      />
      <motion.circle
        cx="60" cy="40" r="10"
        fill="hsl(185 65% 44%)" fillOpacity={0.15}
        animate={{ r: [5, 14, 5], opacity: [0.4, 0, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </svg>
  );
}

function AuditVisual() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="text-primary">
      {[0, 1, 2, 3].map((i) => (
        <motion.g key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}>
          <circle cx="24" cy={20 + i * 14} r="3" fill="currentColor" fillOpacity={0.7} />
          <rect x="32" y={17 + i * 14} width={i === 0 ? 60 : i === 1 ? 50 : i === 2 ? 45 : 55} height="5" rx="2.5"
            fill="currentColor" fillOpacity={0.12} />
          <rect x="32" y={17 + i * 14} width={i === 0 ? 40 : i === 1 ? 30 : i === 2 ? 35 : 42} height="5" rx="2.5"
            fill="currentColor" fillOpacity={0.25} />
        </motion.g>
      ))}
    </svg>
  );
}
