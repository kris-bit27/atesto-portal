"use client";

import { useEffect, useMemo, useState } from "react";
import { FAV_KEY, loadFavSet, toggleFav } from "@/app/lib/favorites";

const KEY = "atesto_read_slugs";

function loadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveSet(s: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(Array.from(s)));
  window.dispatchEvent(new CustomEvent("atesto-read-updated"));
}

type Props = {
  slug: string;
};

export default function ReadProgressClient({ slug }: Props) {
  const [set, setSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSet(loadSet());

    const onUpdate = () => setSet(loadSet());
    window.addEventListener("atesto-read-updated", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("atesto-read-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const isRead = useMemo(() => set.has(slug), [set, slug]);

  function toggle() {
    const next = new Set(set);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSet(next);
    saveSet(next);
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
      <span>
        Stav: <b>{isRead ? "PŘEČTENO" : "NEPŘEČTENO"}</b>
      </span>
      <button
        type="button"
        onClick={toggle}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,.3)",
          background: "rgba(255,255,255,.05)",
          cursor: "pointer",
        }}
      >
        {isRead ? "Zrušit přečtení" : "Označit jako přečtené"}
      </button>
    </div>
  );
}
