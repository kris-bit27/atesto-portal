"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { FAV_KEY, loadStringSet, saveStringSet } from "@/app/lib/favorites";

const READ_KEYS = ["atesto:read", "atesto_read_slugs"];
const LAST_OPENED_KEY = "atesto:lastOpened";

type LastOpened = { slug: string; at: number };

function loadReadUnion(): Set<string> {
  const out = new Set<string>();
  for (const key of READ_KEYS) {
    for (const slug of loadStringSet(key)) out.add(slug);
  }
  return out;
}

function saveReadUnion(set: Set<string>) {
  for (const key of READ_KEYS) saveStringSet(key, set);
}

function loadLastOpened(): LastOpened | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_OPENED_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as LastOpened;
    if (!obj?.slug || !obj?.at) return null;
    return obj;
  } catch {
    return null;
  }
}

function saveLastOpened(next: LastOpened | null) {
  if (typeof window === "undefined") return;
  try {
    if (!next) {
      window.localStorage.removeItem(LAST_OPENED_KEY);
      return;
    }
    window.localStorage.setItem(LAST_OPENED_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function ProgressSync() {
  const { data: session, status } = useSession();
  const syncingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const sync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const localRead = loadReadUnion();
        const localFav = loadStringSet(FAV_KEY);
        const localLast = loadLastOpened();

        const res = await fetch("/api/user/progress");
        const data = await res.json().catch(() => ({}));
        const remote = res.ok ? data?.progress : null;

        const mergedRead = new Set<string>(localRead);
        for (const s of Array.isArray(remote?.readSlugs) ? remote.readSlugs : []) mergedRead.add(s);

        const mergedFav = new Set<string>(localFav);
        for (const s of Array.isArray(remote?.favSlugs) ? remote.favSlugs : []) mergedFav.add(s);

        const remoteLast = remote?.lastOpenedSlug
          ? { slug: remote.lastOpenedSlug as string, at: new Date(remote?.lastOpenedAt).getTime() }
          : null;
        const bestLast =
          localLast && remoteLast
            ? localLast.at >= remoteLast.at
              ? localLast
              : remoteLast
            : localLast || remoteLast;

        saveReadUnion(mergedRead);
        saveStringSet(FAV_KEY, mergedFav);
        saveLastOpened(bestLast);

        await fetch("/api/user/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            readSlugs: Array.from(mergedRead),
            favSlugs: Array.from(mergedFav),
            lastOpenedSlug: bestLast?.slug ?? null,
            lastOpenedAt: bestLast?.at ?? null,
          }),
        });
      } finally {
        syncingRef.current = false;
      }
    };

    const onUpdate = () => void sync();
    window.addEventListener("atesto-read-updated", onUpdate);
    window.addEventListener("atesto-favs-updated", onUpdate);
    window.addEventListener("focus", onUpdate);

    void sync();

    return () => {
      window.removeEventListener("atesto-read-updated", onUpdate);
      window.removeEventListener("atesto-favs-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [session?.user?.id, status]);

  return null;
}
