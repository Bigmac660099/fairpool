import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { bn } from "@/i18n/bn";

/**
 * Shared chrome for public static pages (terms, privacy, faq, contact):
 * a minimal sticky header with the brand + theme toggle, the page content,
 * and the global footer so navigation stays consistent everywhere.
 */
export function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
              FP
            </span>
            <span className="font-accent text-lg font-bold tracking-tight">{bn.app.name}</span>
          </Link>
          <ThemeToggle className="h-9 w-9" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {bn.nav.back}
        </Link>

        <h1 className="text-display-xs font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}

        <div className="mt-8">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
