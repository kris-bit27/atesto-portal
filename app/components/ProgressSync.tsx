"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { FAV_KEY, loadStringSet, saveStringSet } from "@/app/lib/favorites";

const READ_KEYS = ["atesto:read", "atesto_read_slugs"];
const FAV_KEYS = [FAV_KEY, "atesto:favs"];
const LAST_OPENED_KEY = "atesto:lastOpened";
const AUTH_MARKER_KEY = "atesto:authProgress";

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

function loadFavUnion(): Set<string> {
  const out = new Set<string>();
  for (const key of FAV_KEYS) {
    for (const slug of loadStringSet(key)) out.add(slug);
  }
  return out;
}

function saveFavUnion(set: Set<string>) {
  for (const key of FAV_KEYS) saveStringSet(key, set);
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    setReady(true);

    const sync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const localRead = loadReadUnion();
        const localFav = loadFavUnion();
        const localLast = loadLastOpened();

        const res = await fetch("/api/me/progress");
        const data = await res.json().catch(() => ({}));
        const remote = res.ok ? data : null;

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
        saveFavUnion(mergedFav);
        saveLastOpened(bestLast);
        try {
          window.localStorage.setItem(AUTH_MARKER_KEY, "1");
        } catch {
          // ignore
        }

        await fetch("/api/me/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sync: {
              readSlugs: Array.from(mergedRead),
              favSlugs: Array.from(mergedFav),
            },
          }),
        });
      } finally {
        syncingRef.current = false;
      }
    };

    const onUpdate = () => void sync();
    const onOpened = (e: Event) => {
      const detail = (e as CustomEvent<{ slug?: string }>).detail;
      if (!detail?.slug) return;
      const next = { slug: detail.slug, at: Date.now() };
      saveLastOpened(next);
      void fetch("/api/me/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ opened: { slug: detail.slug } }),
      });
    };
    window.addEventListener("atesto-read-updated", onUpdate);
    window.addEventListener("atesto-favs-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    window.addEventListener("atesto-opened", onOpened as EventListener);

    void sync();

    return () => {
      window.removeEventListener("atesto-read-updated", onUpdate);
      window.removeEventListener("atesto-favs-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
      window.removeEventListener("atesto-opened", onOpened as EventListener);
    };
  }, [session?.user?.email, status]);

  useEffect(() => {
    if (status === "unauthenticated" && ready) {
      try {
        window.localStorage.removeItem(AUTH_MARKER_KEY);
      } catch {
        // ignore
      }
    }
  }, [ready, status]);

  return null;
}
