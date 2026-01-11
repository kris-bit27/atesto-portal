export const SRS_KEY = "atesto_srs_v1";

export type SrsItem = { dueAt: number; intervalDays: number; ease: number };

function loadObj(): Record<string, SrsItem> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SRS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return {};
    return obj as Record<string, SrsItem>;
  } catch {
    return {};
  }
}

function saveObj(obj: Record<string, SrsItem>) {
  window.localStorage.setItem(SRS_KEY, JSON.stringify(obj));
  window.dispatchEvent(new Event("atesto-srs-updated"));
}

export function addToReview(slug: string) {
  const obj = loadObj();
  if (!obj[slug]) obj[slug] = { dueAt: Date.now(), intervalDays: 1, ease: 2.3 };
  saveObj(obj);
}

export function removeFromReview(slug: string) {
  const obj = loadObj();
  delete obj[slug];
  saveObj(obj);
}

export function markReviewed(slug: string) {
  const obj = loadObj();
  const it = obj[slug] || { dueAt: Date.now(), intervalDays: 1, ease: 2.3 };

  // super jednoduché: interval roste cca *2, ease mírně roste
  const nextInterval = Math.min(60, Math.round(it.intervalDays * 2));
  const nextEase = Math.min(2.8, it.ease + 0.05);

  obj[slug] = {
    dueAt: Date.now() + nextInterval * 24 * 60 * 60 * 1000,
    intervalDays: nextInterval,
    ease: nextEase,
  };
  saveObj(obj);
}

export function listDue(): string[] {
  const obj = loadObj();
  const now = Date.now();
  return Object.keys(obj).filter((slug) => {
    const dueAt = typeof obj[slug]?.dueAt === "number" ? obj[slug].dueAt : 0;
    return dueAt <= now;
  });
}

export function isInReview(slug: string): boolean {
  const obj = loadObj();
  return !!obj[slug];
}
