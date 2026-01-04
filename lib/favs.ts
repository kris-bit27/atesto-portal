export const FAV_KEY = "atesto_favs_v1";

export function loadStringSet(key: string = FAV_KEY): Set<string> {
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

export function saveStringSet(set: Set<string>, key: string = FAV_KEY) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
}

/** toggle slug v setu + persist */
export function toggleFav(slug: string, current: Set<string>) {
  const next = new Set(current);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  saveStringSet(next, FAV_KEY);

  // aby se UI překreslilo i v jiných komponentech
  try {
    window.dispatchEvent(new Event("atesto-favs-updated"));
  } catch {}
  return next;
}
