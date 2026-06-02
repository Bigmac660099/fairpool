"use client";

import { useState } from "react";
import { Info, Save, Plus, Trash2, GraduationCap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { PhotoUpload } from "@/components/ui/photo-upload";
import {
  getSettings, updateSettings, updateFooter,
  updateTrustedUniversities, resetDemoData,
} from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";

export default function AdminSettingsPage() {
  useStoreSync();
  const s = getSettings();
  const [footer, setFooter] = useState(s.footer);
  const [unis, setUnis] = useState<string[]>(s.trustedUniversities ?? []);
  const [newUni, setNewUni] = useState("");

  function addUni() {
    const trimmed = newUni.trim();
    if (!trimmed || unis.includes(trimmed)) return;
    const updated = [...unis, trimmed];
    setUnis(updated);
    updateTrustedUniversities(updated);
    setNewUni("");
  }

  function removeUni(name: string) {
    const updated = unis.filter((u) => u !== name);
    setUnis(updated);
    updateTrustedUniversities(updated);
  }

  return (
    <div className="space-y-4">
      {/* ── Branding ────────────────────────────────────────────── */}
      <Card>
        <CardBody className="space-y-5">
          <h2 className="font-semibold">ব্র্যান্ডিং</h2>
          <Field label="সাইটের নাম">
            <Input
              defaultValue={s.brandName}
              onChange={(e) => updateSettings({ brandName: e.target.value })}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <PhotoUpload
              label="লোগো"
              value={s.logoUrl}
              onChange={(url) => updateSettings({ logoUrl: url })}
              aspect="square"
            />
            <PhotoUpload
              label="ফেভিকন"
              value={s.faviconUrl}
              onChange={(url) => updateSettings({ faviconUrl: url })}
              aspect="square"
            />
          </div>
          <PhotoUpload
            label="হিরো ব্যানার"
            value={s.heroBannerUrl}
            onChange={(url) => updateSettings({ heroBannerUrl: url })}
            aspect="wide"
          />
        </CardBody>
      </Card>

      {/* ── Trusted Universities ─────────────────────────────────── */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">বিশ্বস্ত বিশ্ববিদ্যালয়</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            হোমপেজের &ldquo;বিশ্বস্ত প্রতিষ্ঠানসমূহ&rdquo; বিভাগে দেখানো হবে।
          </p>

          {/* Current list */}
          {unis.length > 0 ? (
            <ul className="space-y-2">
              {unis.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5"
                >
                  <span className="text-sm font-medium">{name}</span>
                  <button
                    type="button"
                    onClick={() => removeUni(name)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`${name} মুছুন`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
              কোনো বিশ্ববিদ্যালয় যোগ করা হয়নি
            </p>
          )}

          {/* Add new */}
          <div className="flex gap-2">
            <Input
              value={newUni}
              onChange={(e) => setNewUni(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUni()}
              placeholder="বিশ্ববিদ্যালয়ের নাম লিখুন"
              className="flex-1"
            />
            <Button onClick={addUni} variant="outline" size="md">
              <Plus className="h-4 w-4" />
              যোগ করুন
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ── Footer content ───────────────────────────────────────── */}
      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-semibold">ফুটার কন্টেন্ট</h2>
          <Field label="বিবরণ">
            <Input
              value={footer.description}
              onChange={(e) => setFooter({ ...footer, description: e.target.value })}
            />
          </Field>
          <Field label="ঠিকানা">
            <Input
              value={footer.address}
              onChange={(e) => setFooter({ ...footer, address: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ফোন">
              <Input
                value={footer.phone}
                onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
              />
            </Field>
            <Field label="ইমেইল">
              <Input
                value={footer.email}
                onChange={(e) => setFooter({ ...footer, email: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ফেসবুক ফলোয়ার">
              <Input
                value={footer.facebookFans}
                onChange={(e) => setFooter({ ...footer, facebookFans: e.target.value })}
              />
            </Field>
            <Field label="ইউটিউব সাবস্ক্রাইবার">
              <Input
                value={footer.youtubeSubs}
                onChange={(e) => setFooter({ ...footer, youtubeSubs: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ফেসবুক লিংক">
              <Input
                value={footer.facebookUrl}
                onChange={(e) => setFooter({ ...footer, facebookUrl: e.target.value })}
              />
            </Field>
            <Field label="ইউটিউব লিংক">
              <Input
                value={footer.youtubeUrl}
                onChange={(e) => setFooter({ ...footer, youtubeUrl: e.target.value })}
              />
            </Field>
          </div>
          <Field label="কপিরাইট">
            <Input
              value={footer.copyright}
              onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
            />
          </Field>
          <Button onClick={() => updateFooter(footer)}>
            <Save className="h-4 w-4" />
            ফুটার সংরক্ষণ
          </Button>
        </CardBody>
      </Card>

      {/* ── Runtime / reset ──────────────────────────────────────── */}
      <Card>
        <CardBody className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Info className="h-4 w-4 text-primary" /> রানটাইম তথ্য
          </h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>মোড: লোকাল ডেমো (in-browser store)</li>
            <li>অথেন্টিকেশন: AUTH_MODE অনুযায়ী local / clerk</li>
            <li>থিম: লাইট / ডার্ক</li>
          </ul>
          <Button
            variant="outline"
            onClick={() => confirm("সব ডেটা রিসেট করবেন?") && resetDemoData()}
          >
            {bn.admin.seedDemo}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
