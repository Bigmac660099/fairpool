"use client";

import { useRef, useState } from "react";
import { Upload, Link, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  /** Square for photos, wide for banners. */
  aspect?: "square" | "wide";
}

type Tab = "upload" | "url";

/**
 * Dual-mode photo input:
 * - Upload tab  → FileReader converts to base64 data URL, previews instantly
 *   (works in demo/localStorage mode; in production this would call a
 *   Supabase Storage upload and use the returned public URL instead).
 * - URL tab     → paste a remote URL directly.
 *
 * The value passed to onChange is always a displayable URL string (data: or
 * https:) so the rest of the app doesn't need to know which mode was used.
 */
export function PhotoUpload({ value, onChange, label, aspect = "square" }: Props) {
  const [tab, setTab] = useState<Tab>("upload");
  const [urlInput, setUrlInput] = useState(value?.startsWith("http") ? value : "");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) readFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  }

  function applyUrl() {
    const url = urlInput.trim();
    onChange(url || null);
  }

  function clear() {
    onChange(null);
    setUrlInput("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-foreground/90">{label}</p>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
        {(["upload", "url"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition-colors",
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "upload" ? (
              <><Upload className="h-3.5 w-3.5" /> ফাইল আপলোড</>
            ) : (
              <><Link className="h-3.5 w-3.5" /> URL</>
            )}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      {tab === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors",
            dragging
              ? "border-primary bg-primary/10"
              : "border-border/60 hover:border-primary/60 hover:bg-accent/40",
          )}
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">ছবি টেনে আনুন বা ক্লিক করুন</p>
            <p className="mt-0.5 text-xs">JPG, PNG, WEBP — সর্বোচ্চ ৪ MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onFileChange}
          />
        </div>
      )}

      {/* URL input */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            সেট
          </button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className={cn(
          "group relative overflow-hidden rounded-xl border border-border/60 bg-muted",
          aspect === "square" ? "aspect-square max-w-[140px]" : "aspect-video",
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          {/* Gradient overlay with remove button */}
          <div className="absolute inset-0 flex items-start justify-end bg-gradient-to-b from-black/40 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="rounded-full bg-black/60 p-1 text-white hover:bg-destructive"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
