import { Mail, MapPin, Phone } from "lucide-react";
import { LegalShell } from "@/components/marketing/LegalShell";

export const metadata = { title: "যোগাযোগ — ফেয়ারপুল" };

/**
 * Contact page reads the same CMS values the footer uses, so the admin's
 * Site Settings stay the single source of truth.
 */
export default function ContactPage() {
  // Static defaults mirror the seed; admins edit these in Site Settings.
  const items = [
    { icon: Mail, label: "ইমেইল", value: "support@fairpool.local", href: "mailto:support@fairpool.local" },
    { icon: Phone, label: "ফোন", value: "+৮৮০ ১২৩৪ ৫৬৭৮৯০", href: "tel:+8801234567890" },
    { icon: MapPin, label: "ঠিকানা", value: "শিক্ষার্থী সংসদ ভবন, কেন্দ্রীয় ক্যাম্পাস, ঢাকা-১২০৭", href: null },
  ];

  return (
    <LegalShell title="যোগাযোগ" subtitle="আমরা সাহায্য করতে প্রস্তুত">
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-card"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <it.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{it.label}</p>
              {it.href ? (
                <a href={it.href} className="font-medium text-foreground hover:text-primary">
                  {it.value}
                </a>
              ) : (
                <p className="font-medium text-foreground">{it.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </LegalShell>
  );
}
