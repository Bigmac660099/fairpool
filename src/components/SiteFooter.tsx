"use client";

import { Facebook, Youtube, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";

export function SiteFooter() {
  useStoreSync();
  const { brandName, logoUrl, footer } = getSettings();

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Gradient top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* ── Social band ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary/6 via-transparent to-teal-400/4">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between">
          <a
            href={footer.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-[#1877F2] px-5 py-3 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <Facebook className="h-6 w-6" />
            <div className="leading-tight">
              <div className="text-base font-bold">{footer.facebookFans}</div>
              <div className="text-xs opacity-80">ফলোয়ার</div>
            </div>
          </a>

          <div className="text-center">
            <p className="text-sm font-semibold">সামাজিক যোগাযোগ মাধ্যম</p>
            <p className="text-xs text-muted-foreground">সর্বশেষ আপডেটের জন্য অনুসরণ করুন</p>
          </div>

          <a
            href={footer.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-[#FF0000] px-5 py-3 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <Youtube className="h-6 w-6" />
            <div className="leading-tight">
              <div className="text-base font-bold">{footer.youtubeSubs}</div>
              <div className="text-xs opacity-80">সাবস্ক্রাইবার</div>
            </div>
          </a>
        </div>
      </div>

      {/* ── Main band ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-muted/30 to-background">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand + contact */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={brandName} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 font-black text-white shadow-glow-sm">
                  FP
                </span>
              )}
              <span className="fp-gradient text-lg font-black tracking-tighter">{brandName}</span>
            </div>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {footer.description}
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{footer.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>{footer.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${footer.email}`} className="transition-colors hover:text-primary">
                  {footer.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Link columns */}
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-semibold tracking-tight">{col.title}</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-pointer transition-colors hover:text-primary">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />

      {/* ── Copyright bar ────────────────────────────────────────── */}
      <div className="bg-background/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 text-xs text-muted-foreground">
          <span>{footer.copyright}</span>
          <span className="flex items-center gap-1.5 text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            SSL সুরক্ষিত
          </span>
        </div>
      </div>
    </footer>
  );
}
