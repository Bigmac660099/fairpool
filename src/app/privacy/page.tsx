import { LegalShell } from "@/components/marketing/LegalShell";

export const metadata = { title: "গোপনীয়তা নীতি — ফেয়ারপুল" };

export default function PrivacyPage() {
  const sections = [
    {
      h: "আমরা কী সংগ্রহ করি",
      p: "শুধুমাত্র নিবন্ধনের জন্য প্রয়োজনীয় তথ্য: নাম, ছাত্র আইডি, ইমেইল ও বিভাগ। ভোটের সময় কেবল অবস্থান যাচাইয়ের জন্য জিপিএস স্থানাঙ্ক ব্যবহৃত হয়।",
    },
    {
      h: "আপনার ভোট গোপন",
      p: "ভোট সম্পূর্ণ গোপন। কোনো ভোট কোনো নির্দিষ্ট ব্যবহারকারীর সাথে যুক্ত করে প্রকাশ করা হয় না — ফলাফল কেবল সমষ্টিগতভাবে দেখানো হয়।",
    },
    {
      h: "ডেটা সুরক্ষা",
      p: "সংবেদনশীল তথ্য এনক্রিপ্ট করে সংরক্ষণ করা হয় এবং সব সংযোগ TLS দ্বারা সুরক্ষিত। ইমেইল ও ছাত্র আইডি প্রদর্শনের সময় আংশিকভাবে গোপন (masked) রাখা হয়।",
    },
    {
      h: "আপনার অধিকার",
      p: "আপনি যেকোনো সময় আপনার অ্যাকাউন্ট ও তথ্য মুছে ফেলার অনুরোধ করতে পারেন। অনুরোধের জন্য যোগাযোগ পৃষ্ঠা ব্যবহার করুন।",
    },
  ];

  return (
    <LegalShell title="গোপনীয়তা নীতি" subtitle="আপনার তথ্য কীভাবে সুরক্ষিত থাকে">
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-1.5 text-lg font-semibold text-primary">{s.h}</h2>
            <p className="leading-relaxed text-foreground/80">{s.p}</p>
          </section>
        ))}
      </div>
    </LegalShell>
  );
}
