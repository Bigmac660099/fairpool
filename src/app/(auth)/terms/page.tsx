import Link from "next/link";
import { bn } from "@/i18n/bn";

/** Static Terms & Conditions page (linked from registration). */
export default function TermsPage() {
  const sections = [
    {
      h: "১. এক ব্যক্তি, এক ভোট",
      p: "প্রতিটি যাচাইকৃত শিক্ষার্থী প্রতিটি নির্বাচনে কেবল একবার ভোট দিতে পারবেন। ভোট একবার দেওয়া হলে তা পরিবর্তন করা যাবে না।",
    },
    {
      h: "২. অবস্থান যাচাই",
      p: "কিছু নির্বাচনে ভোট দেওয়ার জন্য নির্ধারিত ক্যাম্পাস এলাকার ভিতরে থাকা আবশ্যক। আপনার জিপিএস অবস্থান কেবল যাচাইয়ের জন্য ব্যবহৃত হয়।",
    },
    {
      h: "৩. গোপনীয়তা",
      p: "আপনার ভোট গোপন থাকবে। ফলাফল কেবল সমষ্টিগতভাবে প্রকাশ করা হয়; কে কাকে ভোট দিয়েছেন তা প্রকাশ করা হয় না।",
    },
    {
      h: "৪. নিরপেক্ষতা",
      p: "ফেয়ারপুল একটি স্বচ্ছ ও নিরপেক্ষ প্ল্যাটফর্ম। কোনো প্রকার কারচুপি শনাক্ত হলে অ্যাকাউন্ট স্থগিত করা হতে পারে।",
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">{bn.auth.terms}</h1>
      <p className="mb-8 text-muted-foreground">{bn.app.name} ব্যবহারের শর্তাবলী</p>

      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-1 text-lg font-semibold text-primary">{s.h}</h2>
            <p className="leading-relaxed text-foreground/80">{s.p}</p>
          </section>
        ))}
      </div>

      <Link
        href="/register"
        className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        ← {bn.auth.register}
      </Link>
    </main>
  );
}
