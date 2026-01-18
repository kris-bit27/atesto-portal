export const SRS_KEY = "atesto_srs_v1";

export type SrsGrade = "hard" | "ok" | "easy";
export type SrsItem = { nextDueAt: number; intervalDays: number; lastGrade: SrsGrade | null };

function loadObj(): Record<string, SrsItem> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SRS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return {};
    const out: Record<string, SrsItem> = {};
    for (const slug of Object.keys(obj)) {
      const it = (obj as Record<string, any>)[slug] || {};
      const nextDueAt =
        typeof it.nextDueAt === "number"
          ? it.nextDueAt
          : typeof it.dueAt === "number"
            ? it.dueAt
            : 0;
      const intervalDays = typeof it.intervalDays === "number" ? it.intervalDays : 0;
      const lastGrade =
        it.lastGrade === "hard" || it.lastGrade === "ok" || it.lastGrade === "easy"
          ? it.lastGrade
          : null;
      out[slug] = { nextDueAt, intervalDays, lastGrade };
    }
    return out;
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
  if (!obj[slug]) obj[slug] = { nextDueAt: Date.now(), intervalDays: 0, lastGrade: null };
  saveObj(obj);
}

export function removeFromReview(slug: string) {
  const obj = loadObj();
  delete obj[slug];
  saveObj(obj);
}

export function markReviewed(slug: string, grade: SrsGrade) {
  const obj = loadObj();
  const it = obj[slug] || { nextDueAt: Date.now(), intervalDays: 0, lastGrade: null };
  const prevInterval = typeof it.intervalDays === "number" ? it.intervalDays : 0;
  let nextInterval = 0;

  if (grade === "hard") {
    nextInterval = prevInterval > 0 ? Math.max(1, Math.round(prevInterval * 0.5)) : 1;
  } else if (grade === "ok") {
    nextInterval = prevInterval > 0 ? Math.max(1, Math.round(prevInterval * 2)) : 3;
  } else {
    nextInterval = prevInterval > 0 ? Math.max(1, Math.round(prevInterval * 3)) : 7;
  }

  obj[slug] = {
    nextDueAt: Date.now() + nextInterval * 24 * 60 * 60 * 1000,
    intervalDays: nextInterval,
    lastGrade: grade,
  };
  saveObj(obj);
}

export function listDue(): string[] {
  const obj = loadObj();
  const now = Date.now();
  return Object.keys(obj)
    .filter((slug) => {
      const dueAt = typeof obj[slug]?.nextDueAt === "number" ? obj[slug].nextDueAt : 0;
      return dueAt <= now;
    })
    .sort((a, b) => {
      const aDue = typeof obj[a]?.nextDueAt === "number" ? obj[a].nextDueAt : 0;
      const bDue = typeof obj[b]?.nextDueAt === "number" ? obj[b].nextDueAt : 0;
      return aDue - bDue;
    });
}

export function isInReview(slug: string): boolean {
  const obj = loadObj();
  return !!obj[slug];
}

export function isDue(slug: string): boolean {
  const obj = loadObj();
  const dueAt = typeof obj[slug]?.nextDueAt === "number" ? obj[slug].nextDueAt : 0;
  return dueAt > 0 && dueAt <= Date.now();
}
