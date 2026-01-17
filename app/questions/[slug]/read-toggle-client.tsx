"use client";

import { useEffect, useState } from "react";

const READ_KEY = "atesto_read_slugs";
const LAST_OPENED_KEY = "atesto:lastOpened";

function loadReadSet(): Set<string> {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<string>) {
  const arr = Array.from(set);
  window.localStorage.setItem(READ_KEY, JSON.stringify(arr));
  window.dispatchEvent(new Event("atesto-read-updated"));
}

export default function ReadToggleClient({ slug }: { slug: string }) {
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_OPENED_KEY, JSON.stringify({ slug, at: Date.now() }));
    } catch {
      // ignore
    }
    const s = loadReadSet();
    setIsRead(s.has(slug));
  }, [slug]);

  return (
    <button
      type="button"
      className={isRead ? "atesto-btn atesto-btn-primary" : "atesto-btn"}
      onClick={() => {
        const s = loadReadSet();
        if (s.has(slug)) s.delete(slug);
        else s.add(slug);
        saveReadSet(s);
        setIsRead(s.has(slug));
      }}
    >
      {isRead ? "Přečteno ✓" : "Označit jako přečtené"}
    </button>
  );
}
