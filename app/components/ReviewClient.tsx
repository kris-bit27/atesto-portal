"use client";

import Link from "next/link";
import { loadFavSet, toggleFav } from "@/app/lib/favorites";
import { useEffect, useMemo, useState } from "react";

type Q = {
  slug: string;
  title: string;
  status: string;
  topic: { title: string; slug: string } | null;
};

type Props = { questions: Q[] };

type Srs = {
  ease: number;         // 1.3 .. 2.8 (typicky)
  intervalDays: number; // 0,1,3,7,...
  dueAt: number;        // ms timestamp
  lastSeen: number;     // ms
  ok: number;
  bad: number;
  skip: number;
  lastGrade: "OK" | "BAD" | "SKIP" | null;
};

const KEY = "atesto_srs_v1";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function loadSrs(): Record<string, Srs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return {};
    return obj;
  } catch {
    return {};
  }
}

function saveSrs(srs: Record<string, Srs>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(srs));
}

function getSrs(srs: Record<string, Srs>, slug: string): Srs {
  return (
    srs[slug] ?? {
      ease: 2.0,
      intervalDays: 0,
      dueAt: 0, // 0 = never scheduled yet => považuj za due
      lastSeen: 0,
      ok: 0,
      bad: 0,
      skip: 0,
      lastGrade: null,
    }
  );
}

function msFromDays(d: number) {
  return d * 24 * 60 * 60 * 1000;
}

function isDue(s: Srs) {
  return s.dueAt === 0 || s.dueAt <= Date.now();
}

// výběr další: prefer due, pak nejvíc overdue, plus malé náhodné míchání
function rankScore(q: Q, s: Srs) {
  const overdueDays =
    s.dueAt === 0 ? 999 : Math.max(0, (Date.now() - s.dueAt) / msFromDays(1));
  const badBias = Math.min(s.bad / 10, 1); // 0..1
  const neverSeen = s.lastSeen === 0 ? 1 : 0;

  // vyšší = dřív
  return overdueDays * 2 + badBias + neverSeen * 3;
}

export default function ReviewClient({ questions }: Props) {
  const [srsMap, setSrsMap] = useState<Record<string, Srs>>({});
  const [onlyPublished, setOnlyPublished] = useState(true);

  // NEW: SRS modes
  const [mode, setMode] = useState<"DUE" | "ALL">("DUE");

  
const [onlyFav, setOnlyFav] = useState(false);
const [favSet, setFavSet] = useState<Set<string>>(() => new Set());

useEffect(() => {
  const update = () => setFavSet(loadFavSet());
  update();
  window.addEventListener("atesto-fav-updated", update as any);
  window.addEventListener("storage", update);
  return () => {
    window.removeEventListener("atesto-fav-updated", update as any);
    window.removeEventListener("storage", update);
  };
}, []);
const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  useEffect(() => {
    setSrsMap(loadSrs());
  }, []);

  const base = useMemo(() => {
    return onlyPublished
      ? questions.filter((q) => q.status === "PUBLISHED")
      : questions.slice();
  }, [questions, onlyPublished]);

  

const baseFav = useMemo(() => {
  if (!onlyFav) return base;
  return base.filter((q) => favSet.has(q.slug));
}, [base, onlyFav, favSet]);
const duePool = useMemo(() => {
    return baseFav.filter((q) => isDue(getSrs(srsMap, q.slug)));
  }, [base, srsMap]);

  const pool = useMemo(() => {
    return mode === "DUE" ? duePool : baseFav;
  }, [mode, duePool, base]);

  const current = useMemo(() => {
    if (!currentSlug) return null;
    return pool.find((q) => q.slug === currentSlug) ?? null;
  }, [pool, currentSlug]);

  const pickNext = () => {
    if (pool.length === 0) {
      setCurrentSlug(null);
      return;
    }

    const ranked = pool
      .map((q) => ({ q, s: getSrs(srsMap, q.slug), sc: rankScore(q, getSrs(srsMap, q.slug)) }))
      .sort((a, b) => b.sc - a.sc);

    const topN = Math.min(7, ranked.length);
    const idx = Math.floor(Math.random() * topN);
    setCurrentSlug(ranked[idx].q.slug);
  };

  useEffect(() => {
    if (!currentSlug) pickNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.length, mode]);

  const grade = (slug: string, g: "OK" | "BAD" | "SKIP") => {
    const next = { ...srsMap };
    const s = { ...getSrs(next, slug) };
    s.lastSeen = Date.now();
    s.lastGrade = g;

    if (g === "SKIP") {
      s.skip += 1;
      // SKIP: nic nepřepočítává, jen "viděno"
      // aby se to netočilo pořád dokola, posuň due aspoň na pár hodin
      s.dueAt = Math.max(s.dueAt, Date.now() + 6 * 60 * 60 * 1000);
    }

    if (g === "BAD") {
      s.bad += 1;
      s.ease = clamp(s.ease - 0.2, 1.3, 2.8);
      s.intervalDays = 1;
      s.dueAt = Date.now() + msFromDays(1);
    }

    if (g === "OK") {
      s.ok += 1;
      s.ease = clamp(s.ease + 0.08, 1.3, 2.8);

      // růst intervalů: pokud ještě nic, dej 3; pak *ease a zaokrouhli
      let nextInt =
        s.intervalDays <= 0 ? 3 : Math.max(3, Math.round(s.intervalDays * s.ease));

      // pojistka proti šíleným skokům
      nextInt = clamp(nextInt, 3, 90);

      s.intervalDays = nextInt;
      s.dueAt = Date.now() + msFromDays(nextInt);
    }

    next[slug] = s;
    setSrsMap(next);
    saveSrs(next);

    setTimeout(() => pickNext(), 50);
  };

  const reset = () => {
    setSrsMap({});
    saveSrs({});
    setTimeout(() => pickNext(), 50);
  };

  const total = questions.length;
  const dueCount = duePool.length;

  return (
    <main style={{ display: "grid", gap: 14 }}>
      <header
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <h1 style={{ margin: 0 }}>SRS Review</h1>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Otázek: <b>{total}</b> • Dnes k opakování: <b>{dueCount}</b> • Pool:{" "}
            <b>{pool.length}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={onlyPublished}
              onChange={(e) => setOnlyPublished(e.target.checked)}
            />
            Jen PUBLISHED
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="radio" checked={mode === "DUE"} onChange={() => setMode("DUE")} />
            DUE NOW
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
            <input type="radio" checked={mode === "ALL"} onChange={() => setMode("ALL")} />
            ALL
          </label>

          <button
            onClick={pickNext}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "transparent",
            }}
          >
            Další
          </button>

          <button
            onClick={reset}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "transparent",
            }}
          >
            Reset SRS
          </button>

          <Link
            href="/"
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)" }}
          >
            Zpět
          </Link>
        </div>
      </header>

      {pool.length === 0 && (
        <div style={{ border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: 14, opacity: 0.9 }}>
          Nic k opakování. Přepni režim na <b>ALL</b> nebo vypni filtry.
        </div>
      )}

      {current && (
        <div style={{ border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: 14, display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              {current.topic ? (
                <>
                  Téma:{" "}
                  <Link href={`/topics/${current.topic.slug}`} style={{ opacity: 0.9 }}>
                    {current.topic.title}
                  </Link>
                </>
              ) : (
                <>Bez tématu</>
              )}
              {" • "}
              <span style={{ opacity: 0.9 }}>{current.status}</span>
            </div>

            <h2 style={{ margin: 0 }}>{current.title}</h2>
            <div style={{ opacity: 0.75, fontSize: 13 }}>{current.slug}</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href={`/read/${current.slug}`}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.25)" }}
            >
              Otevřít (READ)
            </Link>

            

            <button
              onClick={() => toggleFav(current.slug)}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.25)", background: "transparent" }}
            >
              {favSet.has(current.slug) ? "★" : "☆"}
            </button>

            <Link
              href={`/questions/${current.slug}`}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.25)" }}
            >
              Upravit (EDIT)
            </Link>

            <div style={{ flex: 1 }} />

            <button
              onClick={() => grade(current.slug, "OK")}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.25)", background: "transparent" }}
            >
              ✅ OK
            </button>

            <button
              onClick={() => grade(current.slug, "BAD")}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.25)", background: "transparent" }}
            >
              ❌ BAD
            </button>

            <button
              onClick={() => grade(current.slug, "SKIP")}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.25)", background: "transparent" }}
            >
              ⏭️ Skip
            </button>
          </div>

          <div style={{ opacity: 0.85, fontSize: 13, display: "grid", gap: 4 }}>
            {(() => {
              const s = getSrs(srsMap, current.slug);
              const dueText =
                s.dueAt === 0 ? "teď (nové)" : new Date(s.dueAt).toLocaleString();
              return (
                <>
                  <div>
                    SRS: ease <b>{s.ease.toFixed(2)}</b> • interval <b>{s.intervalDays}</b> dní • due{" "}
                    <b>{dueText}</b>
                  </div>
                  <div>
                    Stats: OK <b>{s.ok}</b> • BAD <b>{s.bad}</b> • Skip <b>{s.skip}</b> • poslední:{" "}
                    <b>{s.lastGrade ?? "—"}</b>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
