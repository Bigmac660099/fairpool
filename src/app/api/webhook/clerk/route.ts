import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { isSupabaseConfigured, supabaseService } from "@/lib/server/supabase";

/**
 * Clerk webhook handler — syncs Clerk user lifecycle events to the Supabase
 * `profiles` table. Configure in the Clerk dashboard:
 *   Webhooks → Add endpoint → URL: https://<your-domain>/api/webhook/clerk
 *   Events: user.created, user.updated, user.deleted
 *   Set CLERK_WEBHOOK_SECRET in .env.local from the Clerk webhook signing secret.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Verify the signature with svix
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    // App is running without Supabase — acknowledge and skip.
    return NextResponse.json({ ok: true, skipped: "supabase_not_configured" });
  }

  const svc = supabaseService();
  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const clerkId = data.id;
    const email =
      data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
        ?.email_address ?? null;
    const name =
      [data.first_name, data.last_name].filter(Boolean).join(" ") ||
      data.username ||
      email?.split("@")[0] ||
      "শিক্ষার্থী";
    const studentId = data.username ?? null; // username = student ID in Clerk
    const role = (data.public_metadata?.role as string) ?? "student";

    const payload = {
      clerk_id: clerkId,
      name,
      email,
      role,
      ...(studentId ? { student_id: studentId } : {}),
    };

    const { error } = await svc
      .from("profiles")
      .upsert(payload, { onConflict: "clerk_id" });

    if (error) {
      console.error("[clerk-webhook] upsert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (type === "user.deleted") {
    const { error } = await svc
      .from("profiles")
      .delete()
      .eq("clerk_id", data.id);
    if (error) {
      console.error("[clerk-webhook] delete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

// ── Type helpers ─────────────────────────────────────────────────────────────

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserData {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailAddress[];
  public_metadata: Record<string, unknown>;
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserData;
}
