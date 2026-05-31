"use client";

import { useState } from "react";
import { Info, Save } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { getSettings, updateSettings, updateFooter, resetDemoData } from "@/lib/data";
import { useStoreSync } from "@/lib/hooks";
import { bn } from "@/i18n/bn";

/**
 * Site CMS. Admins can change any brand text + image and all footer content.
 * Images are file-upload driven (PhotoUpload → data URL in demo mode; Supabase
 * Storage in production). Changes are live everywhere immediately.
 */
export default function AdminSettingsPage() {
  useStoreSync();
  const s = getSettings();
  const [footer, setFooter] = useState(s.footer);

  return (
    <div className="space-y-4">
      {/* ── Branding ── */}
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

      {/* ── Footer content ── */}
      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-semibold">ফুটার কন্টেন্ট</h2>
          <Field label="বিবরণ">
            <Input value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} />
          </Field>
          <Field label="ঠিকানা">
            <Input value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ফোন">
              <Input value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} />
            </Field>
            <Field label="ইমেইল">
              <Input value={footer.email} onChange={(e) => setFooter({ ...footer, email: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ফেসবুক ফলোয়ার">
              <Input value={footer.facebookFans} onChange={(e) => setFooter({ ...footer, facebookFans: e.target.value })} />
            </Field>
            <Field label="ইউটিউব সাবস্ক্রাইবার">
              <Input value={footer.youtubeSubs} onChange={(e) => setFooter({ ...footer, youtubeSubs: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ফেসবুক লিংক">
              <Input value={footer.facebookUrl} onChange={(e) => setFooter({ ...footer, facebookUrl: e.target.value })} />
            </Field>
            <Field label="ইউটিউব লিংক">
              <Input value={footer.youtubeUrl} onChange={(e) => setFooter({ ...footer, youtubeUrl: e.target.value })} />
            </Field>
          </div>
          <Field label="কপিরাইট">
            <Input value={footer.copyright} onChange={(e) => setFooter({ ...footer, copyright: e.target.value })} />
          </Field>
          <Button onClick={() => updateFooter(footer)}>
            <Save className="h-4 w-4" /> ফুটার সংরক্ষণ
          </Button>
        </CardBody>
      </Card>

      {/* ── Runtime / reset ── */}
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
