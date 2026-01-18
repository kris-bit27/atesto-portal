"use client";

import { useEffect, useState } from "react";
import { addToReview, isDue, isInReview, removeFromReview } from "@/app/lib/srs";

const READ_KEY = "atesto:read";
const READ_KEY_LEGACY = "atesto_read_slugs";
const FAV_KEY = "atesto:fav";
const FAV_KEYS_LEGACY = ["atesto:favs", "atesto_favs_v1"];

function loadStringSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    const rawLegacy = key === READ_KEY ? window.localStorage.getItem(READ_KEY_LEGACY) : null;
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
    addArr(rawLegacy);
    return set;
  } catch {
    return new Set();
  }
}

function saveStringSet(key: string, s: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(Array.from(s)));
  if (key === READ_KEY) {
    window.localStorage.setItem(READ_KEY_LEGACY, JSON.stringify(Array.from(s)));
  }
  window.dispatchEvent(new Event(key === READ_KEY ? "atesto-read-updated" : "atesto-srs-updated"));
}

function loadFavSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
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
  if (typeof window === "undefined") return;
  const arr = Array.from(set);
  window.localStorage.setItem(FAV_KEY, JSON.stringify(arr));
  for (const key of FAV_KEYS_LEGACY) {
    window.localStorage.setItem(key, JSON.stringify(arr));
  }
  window.dispatchEvent(new Event("atesto-favs-updated"));
}

export default function ReadClient({ slug }: { slug: string }) {
  const [isRead, setIsRead] = useState(false);
  const [inReview, setInReview] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [dueNow, setDueNow] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("atesto-opened", { detail: { slug } }));
    const rs = loadStringSet(READ_KEY);
    setIsRead(rs.has(slug));
    const fs = loadFavSet();
    setIsFav(fs.has(slug));

    setInReview(isInReview(slug));
    setDueNow(isDue(slug));

    const onSrs = () => {
      setInReview(isInReview(slug));
      setDueNow(isDue(slug));
    };
    window.addEventListener("atesto-srs-updated", onSrs);
    return () => {
      window.removeEventListener("atesto-srs-updated", onSrs);
    };
  }, [slug]);

  function toggleRead() {
    const rs = loadStringSet(READ_KEY);
    if (rs.has(slug)) rs.delete(slug);
    else rs.add(slug);
    saveStringSet(READ_KEY, rs);
    setIsRead(rs.has(slug));
    void fetch("/api/me/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ read: { slug, value: rs.has(slug) } }),
    }).catch(() => undefined);
  }

  function toggleFav() {
    const fs = loadFavSet();
    if (fs.has(slug)) fs.delete(slug);
    else fs.add(slug);
    saveFavSet(fs);
    setIsFav(fs.has(slug));
    void fetch("/api/me/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fav: { slug, value: fs.has(slug) } }),
    }).catch(() => undefined);
  }

  function addToReviewLocal() {
    addToReview(slug);
    setInReview(true);
    setDueNow(isDue(slug));
  }

  function removeFromReviewLocal() {
    removeFromReview(slug);
    setInReview(false);
    setDueNow(false);
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <button
        onClick={toggleRead}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.2)",
          background: "transparent",
          color: "inherit",
        }}
      >
        {isRead ? "✓ Přečteno" : "Označit jako přečtené"}
      </button>

      {dueNow ? <span style={{ fontSize: 12, opacity: 0.85 }}>Due for review</span> : null}

      <button
        onClick={toggleFav}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.2)",
          background: "transparent",
          color: "inherit",
        }}
      >
        {isFav ? "★ Oblíbené" : "☆ Přidat k oblíbeným"}
      </button>

      {inReview ? (
        <button
          onClick={removeFromReviewLocal}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.2)",
            background: "transparent",
            color: "inherit",
          }}
        >
          Odebrat z REVIEW
        </button>
      ) : (
        <button
          onClick={addToReviewLocal}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.2)",
            background: "transparent",
            color: "inherit",
          }}
        >
          Přidat do REVIEW
        </button>
      )}
    </div>
  );
}
