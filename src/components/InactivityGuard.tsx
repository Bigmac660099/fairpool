"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isInactive, touchActivity, logout, currentUser, isKnownDevice } from "@/lib/data";

/**
 * Inactivity + device guard (local-mode).
 *  - Re-auth is required after 3h of no activity (INACTIVITY_MS). On any
 *    user interaction we refresh the activity timestamp; on mount/focus we
 *    check idle time and sign out if exceeded.
 *  - A brand-new device (no remembered fingerprint) is flagged so the UI can
 *    require OTP. In Clerk mode, Clerk's own session lifetime + device
 *    verification settings handle both of these (see SETUP.md) and this guard
 *    is a no-op fallback.
 */
export function InactivityGuard() {
  const router = useRouter();

  useEffect(() => {
    function check() {
      const user = currentUser();
      if (!user) return;
      if (isInactive()) {
        logout();
        router.replace("/login?reason=inactivity");
        return;
      }
      // New, unrecognised device → require verification.
      if (!isKnownDevice(user.id)) {
        router.replace("/login?reason=newdevice");
      }
    }

    // Refresh activity on common interactions.
    const onActivity = () => touchActivity();
    const events = ["click", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", check);

    touchActivity();
    check();
    const interval = setInterval(check, 60_000); // re-check every minute

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", check);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
