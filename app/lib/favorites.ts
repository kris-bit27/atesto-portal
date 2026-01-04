export const FAV_KEY = "atesto_favs_v1";

export function loadStringSet(key: string): Set<string> {
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

export function saveStringSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function loadFavSet(): Set<string> {
  return loadStringSet(FAV_KEY);
}

export function toggleFav(slug: string): Set<string> {
  const set = loadFavSet();
  if (set.has(slug)) set.delete(slug);
  else set.add(slug);
  saveStringSet(FAV_KEY, set);

  // informuj UI (HomeClient/TopicClient si to poslouchají)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("atesto-favs-updated"));
  }

  return set;
}
