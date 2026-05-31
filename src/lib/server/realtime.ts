"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Subscribe to live vote inserts for an election (Supabase Realtime / WebSocket).
 * Returns an unsubscribe function. Used on the results page when Supabase is
 * configured; in demo mode the local store's pub/sub drives live updates instead.
 */
export function subscribeToVotes(electionId: string, onChange: () => void): () => void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return () => {};

  const client = createClient(url, key);
  const channel = client
    .channel(`votes:${electionId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votes", filter: `election_id=eq.${electionId}` },
      onChange,
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
