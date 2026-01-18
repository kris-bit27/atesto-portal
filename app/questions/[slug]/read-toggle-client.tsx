"use client";

import { useEffect, useState } from "react";

const READ_KEY = "atesto:read";
const READ_KEY_LEGACY = "atesto_read_slugs";
const FAV_KEY = "atesto:fav";
const FAV_KEYS_LEGACY = ["atesto:favs", "atesto_favs_v1"];

function loadReadSet(): Set<string> {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    const rawLegacy = window.localStorage.getItem(READ_KEY_LEGACY);
    const set = new Set<string>();
    const push = (v: string) => {
      if (typeof v === "string") set.add(v);
    };
    const addArr = (val: string | null) => {
      if (!val) return;
      const arr = JSON.parse(val);
      if (!Array.isArray(arr)) return;
      for (const item of arr) push(item);
    };
    addArr(raw);
    addArr(rawLegacy);
    return set;
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<string>) {
  const arr = Array.from(set);
  window.localStorage.setItem(READ_KEY, JSON.stringify(arr));
  window.localStorage.setItem(READ_KEY_LEGACY, JSON.stringify(arr));
  window.dispatchEvent(new Event("atesto-read-updated"));
}

function loadFavSet(): Set<string> {
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    const set = new Set<string>();
    const addArr = (val: string | null) => {
      if (!val) return;
      const arr = JSON.parse(val);
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (typeof item === "string") set.add(item);
      }
    };
    addArr(raw);
    for (const key of FAV_KEYS_LEGACY) addArr(window.localStorage.getItem(key));
    return set;
  } catch {
    return new Set();
  }
}

function saveFavSet(set: Set<string>) {
  const arr = Array.from(set);
  window.localStorage.setItem(FAV_KEY, JSON.stringify(arr));
  for (const key of FAV_KEYS_LEGACY) {
    window.localStorage.setItem(key, JSON.stringify(arr));
  }
  window.dispatchEvent(new Event("atesto-favs-updated"));
}

export default function ReadToggleClient({ slug }: { slug: string }) {
  const [isRead, setIsRead] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("atesto-opened", { detail: { slug } }));
    const s = loadReadSet();
    setIsRead(s.has(slug));
    const f = loadFavSet();
    setIsFav(f.has(slug));
  }, [slug]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button
        type="button"
        className={isRead ? "atesto-btn atesto-btn-primary" : "atesto-btn"}
        onClick={() => {
          const s = loadReadSet();
          if (s.has(slug)) s.delete(slug);
          else s.add(slug);
          saveReadSet(s);
          setIsRead(s.has(slug));
          void fetch("/api/me/progress", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ read: { slug, value: s.has(slug) } }),
          }).catch(() => undefined);
        }}
      >
        {isRead ? "Přečteno ✓" : "Označit jako přečtené"}
      </button>

      <button
        type="button"
        className={isFav ? "atesto-btn atesto-btn-primary" : "atesto-btn"}
        onClick={() => {
          const f = loadFavSet();
          if (f.has(slug)) f.delete(slug);
          else f.add(slug);
          saveFavSet(f);
          setIsFav(f.has(slug));
          void fetch("/api/me/progress", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ fav: { slug, value: f.has(slug) } }),
          }).catch(() => undefined);
        }}
      >
        {isFav ? "★ Oblíbené" : "☆ Přidat k oblíbeným"}
      </button>
    </div>
  );
}
