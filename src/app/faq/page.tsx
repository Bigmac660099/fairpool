import { LegalShell } from "@/components/marketing/LegalShell";

export const metadata = { title: "প্রশ্নোত্তর — ফেয়ারপুল" };

export default function FaqPage() {
  const faqs = [
    {
      q: "কীভাবে ভোট দেব?",
      a: "নিবন্ধন বা লগইন করুন → ড্যাশবোর্ডে চলমান নির্বাচন দেখুন → “ভোট দিন” চাপুন → GPS চালু করে এলাকার ভিতরে থাকুন → প্রার্থী নির্বাচন করে নিশ্চিত করুন।",
    },
    {
      q: "আমি কি একাধিকবার ভোট দিতে পারব?",
      a: "না। প্রতিটি নির্বাচনে একজন ব্যবহারকারী কেবল একবার ভোট দিতে পারেন। সার্ভার-সাইডে এক-ভোট নিয়ম কঠোরভাবে প্রয়োগ করা হয়।",
    },
    {
      q: "GPS কেন প্রয়োজন?",
      a: "কিছু নির্বাচনে নিশ্চিত করতে হয় যে আপনি নির্ধারিত ক্যাম্পাস এলাকার ভিতরে আছেন। আপনার অবস্থান কেবল যাচাইয়ের জন্য ব্যবহৃত হয়।",
    },
    {
      q: "আমার ভোট কি গোপন থাকবে?",
      a: "হ্যাঁ। আপনার ভোট সম্পূর্ণ গোপন। ফলাফল কেবল সমষ্টিগতভাবে দেখানো হয়।",
    },
    {
      q: "ছাত্র আইডি ভুলে গেলে?",
      a: "আপনি ইমেইল দিয়েও লগইন করতে পারবেন। পাসওয়ার্ড রিসেটের জন্য লগইন পৃষ্ঠার “পাসওয়ার্ড ভুলে গেছেন” ব্যবহার করুন।",
    },
  ];

  return (
    <LegalShell title="প্রশ্নোত্তর" subtitle="সাধারণ জিজ্ঞাসা ও উত্তর">
      <div className="space-y-4">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-border/70 bg-card p-4 shadow-card"
          >
            <summary className="cursor-pointer list-none font-semibold text-foreground marker:hidden">
              <span className="flex items-center justify-between gap-3">
                {f.q}
                <span className="text-primary transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-foreground/75">{f.a}</p>
          </details>
        ))}
      </div>
    </LegalShell>
  );
}
