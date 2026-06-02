import { LegalShell } from "@/components/marketing/LegalShell";
import { bn } from "@/i18n/bn";

/** Static Terms & Conditions page (linked from registration + footer). */
export default function TermsPage() {
  const sections = [
    {
      id: "one-vote",
      h: "১. এক ব্যক্তি, এক ভোট",
      p: "প্রতিটি যাচাইকৃত শিক্ষার্থী প্রতিটি নির্বাচনে কেবল একবার ভোট দিতে পারবেন। ভোট একবার দেওয়া হলে তা পরিবর্তন করা যাবে না।",
    },
    {
      id: "location",
      h: "২. অবস্থান যাচাই",
      p: "কিছু নির্বাচনে ভোট দেওয়ার জন্য নির্ধারিত ক্যাম্পাস এলাকার ভিতরে থাকা আবশ্যক। আপনার জিপিএস অবস্থান কেবল যাচাইয়ের জন্য ব্যবহৃত হয়, সংরক্ষণ করা হয় কেবল নিরীক্ষার প্রয়োজনে।",
    },
    {
      id: "privacy",
      h: "৩. গোপনীয়তা",
      p: "আপনার ভোট গোপন থাকবে। ফলাফল কেবল সমষ্টিগতভাবে প্রকাশ করা হয়; কে কাকে ভোট দিয়েছেন তা কখনো প্রকাশ করা হয় না।",
    },
    {
      id: "fairness",
      h: "৪. নিরপেক্ষতা",
      p: "ফেয়ারপুল একটি স্বচ্ছ ও নিরপেক্ষ প্ল্যাটফর্ম। কোনো প্রকার কারচুপি শনাক্ত হলে সংশ্লিষ্ট অ্যাকাউন্ট স্থগিত করা হতে পারে এবং নিরীক্ষা লগে তা সংরক্ষিত থাকে।",
    },
  ];

  return (
    <LegalShell title={bn.auth.terms} subtitle={`${bn.app.name} ব্যবহারের শর্তাবলী`}>
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20">
            <h2 className="mb-1.5 text-lg font-semibold text-primary">{s.h}</h2>
            <p className="leading-relaxed text-foreground/80">{s.p}</p>
          </section>
        ))}
      </div>
    </LegalShell>
  );
}
