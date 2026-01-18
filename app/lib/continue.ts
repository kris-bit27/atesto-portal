"use client";

export function loadReadSet(key = "atesto:read"): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    const arr = JSON.parse(raw);
    return new Set<string>(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set<string>();
  }
}

export function loadReadList(key = "atesto:read"): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function pickMostRecentRead(readList: string[]): string | null {
  if (!readList.length) return null;
  return readList[readList.length - 1] || null;
}

export function pickNextUnread(
  topics: Array<{ questions?: Array<{ slug: string }> }>,
  readSet: Set<string>
): string | null {
  for (const t of topics || []) {
    for (const q of t.questions || []) {
      if (!readSet.has(q.slug)) return q.slug;
    }
  }
  return null;
}
