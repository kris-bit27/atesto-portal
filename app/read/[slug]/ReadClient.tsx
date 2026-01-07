"use client";

import { useEffect, useState } from "react";

const READ_KEY = "atesto_read_slugs";
const SRS_KEY = "atesto_srs_v1";

function loadStringSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveStringSet(key: string, s: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(Array.from(s)));
  window.dispatchEvent(new Event(key === READ_KEY ? "atesto-read-updated" : "atesto-srs-updated"));
}

type SrsState = Record<string, { dueAt?: number; intervalDays?: number; lastAt?: number }>;

function loadSrs(): SrsState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SRS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return {};
    return obj as SrsState;
  } catch {
    return {};
  }
}

function saveSrs(obj: SrsState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SRS_KEY, JSON.stringify(obj));
  window.dispatchEvent(new Event("atesto-srs-updated"));
}

export default function ReadClient({ slug }: { slug: string }) {
  const [isRead, setIsRead] = useState(false);
  const [inReview, setInReview] = useState(false);

  useEffect(() => {
    const rs = loadStringSet(READ_KEY);
    setIsRead(rs.has(slug));

    const srs = loadSrs();
    // "inReview" definujeme jako: existuje záznam
    setInReview(Boolean(srs[slug]));
  }, [slug]);

  function toggleRead() {
    const rs = loadStringSet(READ_KEY);
    if (rs.has(slug)) rs.delete(slug);
    else rs.add(slug);
    saveStringSet(READ_KEY, rs);
    setIsRead(rs.has(slug));
  }

  function addToReview() {
    const srs = loadSrs();
    // jednoduché MVP: když přidáš do review, dueAt = now (tj. hned due)
    srs[slug] = {
      dueAt: Date.now(),
      intervalDays: 0,
      lastAt: Date.now(),
    };
    saveSrs(srs);
    setInReview(true);
  }

  function removeFromReview() {
    const srs = loadSrs();
    delete srs[slug];
    saveSrs(srs);
    setInReview(false);
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

      {inReview ? (
        <button
          onClick={removeFromReview}
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
          onClick={addToReview}
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
