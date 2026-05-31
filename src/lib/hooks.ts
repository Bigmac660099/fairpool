"use client";

import { useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { currentUser, subscribe } from "./data";
import type { Profile, Role } from "./types";

/**
 * Subscribe a component to the data store so it re-renders after any mutation
 * (vote cast, admin edit, login/logout). Returns a tick counter that callers
 * can ignore — its only purpose is to trigger re-render.
 */
export function useStoreSync(): number {
  const [tick, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => subscribe(force), []);
  return tick;
}

/**
 * Reads the current session and (optionally) guards a route. When `require`
 * is set, unauthenticated users are sent to /login and users lacking the
 * required role are sent to /dashboard — mirroring requireSession/requireAdmin.
 */
export function useAuth(require?: Role): {
  user: Profile | null;
  ready: boolean;
} {
  useStoreSync();
  const router = useRouter();
  // currentUser() reads localStorage, so it is null during SSR. We resolve it
  // on the client after mount to avoid hydration mismatches.
  const [ready, setReady] = useReducer(() => true, false);
  const user = currentUser();

  useEffect(() => {
    setReady();
    if (!require) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (require === "admin" && !(user.role === "admin" || user.role === "trueAdmin")) {
      router.replace("/dashboard");
    }
  }, [require, router, user]);

  return { user, ready };
}
