"use client";

import { Facebook, Youtube, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";

/**
 * Site footer — always dark (#08112A) with pure white text regardless of
 * the app theme. High contrast is guaranteed in both light and dark modes.
 */
export function SiteFooter() {
  useStoreSync();
  const { brandName, logoUrl, footer } = getSettings();

  return (
    <footer className="mt-16 bg-neutral-900 text-white dark:bg-[#08112A]">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ── Social band ─────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between">
          <a
            href={footer.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-[#1877F2] px-5 py-3 text-white shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            <Facebook className="h-5 w-5" />
            <div className="leading-tight">
              <div className="text-sm font-bold">{footer.facebookFans}</div>
              <div className="text-xs text-white/80">ফলোয়ার</div>
            </div>
          </a>

          <div className="text-center">
            <p className="text-sm font-semibold text-white">সামাজিক যোগাযোগ মাধ্যম</p>
            <p className="mt-0.5 text-xs text-white/55">সর্বশেষ আপডেটের জন্য অনুসরণ করুন</p>
          </div>

          <a
            href={footer.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-[#FF0000] px-5 py-3 text-white shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            <Youtube className="h-5 w-5" />
            <div className="leading-tight">
              <div className="text-sm font-bold">{footer.youtubeSubs}</div>
              <div className="text-xs text-white/80">সাবস্ক্রাইবার</div>
            </div>
          </a>
        </div>
      </div>

      {/* ── Main band ─────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        {/* Brand + contact */}
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brandName} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xs font-black text-[#08112A]">
                FP
              </span>
            )}
            <span className="font-accent text-lg font-bold tracking-tight text-white">{brandName}</span>
          </div>
          <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/65">
            {footer.description}
          </p>
          <ul className="space-y-2.5 text-sm text-white/65">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <span>{footer.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-white/50" />
              <span>{footer.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-white/50" />
              <a
                href={`mailto:${footer.email}`}
                className="transition-colors hover:text-white"
              >
                {footer.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Link columns */}
        {footer.columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold tracking-tight text-white">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <span className="cursor-pointer text-sm text-white/55 transition-colors hover:text-white">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Thin divider */}
      <div className="h-px bg-white/10" />

      {/* ── Copyright bar ────────────────────────────────────── */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <span suppressHydrationWarning className="text-xs text-white/50">
          {footer.copyright}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-white/50">
          <ShieldCheck className="h-3.5 w-3.5 text-white/70" />
          SSL সুরক্ষিত
        </span>
      </div>
    </footer>
  );
}
