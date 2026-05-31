"use client";

import { Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";

/**
 * Site footer, modelled on the Bangladesh Election Commission layout:
 * a social band (Facebook / YouTube stats) on top, then brand + address +
 * link columns, then a copyright bar. All text is admin-editable via the CMS
 * (Admin → সাইট কন্টেন্ট), so values come from site settings, not hardcoded.
 */
export function SiteFooter() {
  useStoreSync();
  const { brandName, logoUrl, footer } = getSettings();

  return (
    <footer className="mt-16 border-t border-border/60">
      {/* ── Social band ── */}
      <div className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
          <a
            href={footer.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-[#1877F2] px-5 py-3 text-white transition-transform hover:scale-105"
          >
            <Facebook className="h-7 w-7" />
            <div className="leading-tight">
              <div className="text-lg font-bold">{footer.facebookFans}</div>
              <div className="text-xs opacity-90">ফলোয়ার</div>
            </div>
          </a>

          <div className="text-center">
            <p className="text-sm font-semibold">সামাজিক যোগাযোগ মাধ্যম</p>
            <p className="text-xs text-muted-foreground">
              সর্বশেষ তথ্য ও আপডেটের জন্য আমাদের সাথে যুক্ত হন
            </p>
          </div>

          <a
            href={footer.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-[#FF0000] px-5 py-3 text-white transition-transform hover:scale-105"
          >
            <Youtube className="h-7 w-7" />
            <div className="leading-tight">
              <div className="text-lg font-bold">{footer.youtubeSubs}</div>
              <div className="text-xs opacity-90">সাবস্ক্রাইবার</div>
            </div>
          </a>
        </div>
      </div>

      {/* ── Main band ── */}
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        {/* Brand + contact */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brandName} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                {brandName.charAt(0)}
              </span>
            )}
            <span className="text-lg font-bold">{brandName}</span>
          </div>
          <p className="mb-4 max-w-xs text-sm text-muted-foreground">
            {footer.description}
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
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
              <a href={`mailto:${footer.email}`} className="hover:text-primary">
                {footer.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Link columns */}
        {footer.columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
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

      {/* ── Copyright bar ── */}
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        {footer.copyright}
      </div>
    </footer>
  );
}
