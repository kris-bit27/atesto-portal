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

type Props = {
  slug: string;
};

export default function ReadBadgeClient({ slug }: Props) {
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

  if (!isRead) return null;

  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid rgba(0,200,120,.5)",
        color: "rgb(0,200,120)",
        opacity: 0.9,
        whiteSpace: "nowrap",
      }}
    >
      PŘEČTENO
    </span>
  );
}
