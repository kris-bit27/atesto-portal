"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReadBadgeClient from "@/app/components/read/ReadBadgeClient";
import { toggleFav, loadFavSet } from "@/app/lib/favorites";

const READ_KEY = "atesto_read_slugs";

function loadReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
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

type Question = { slug: string; title: string; status: string };
type Topic = { slug: string; title: string; order: number; questions: Question[] };

type Props = {
  topics: Topic[];
};

export default function HomeClient({ topics }: Props) {
  const [query, setQuery] = useState("");

  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  const [onlyPublished, setOnlyPublished] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);

  useEffect(() => {
    // favs
    setFavSet(loadFavSet());
    const onFavsUpdate = () => setFavSet(loadFavSet());
    window.addEventListener("atesto-favs-updated", onFavsUpdate);
    window.addEventListener("storage", onFavsUpdate);

    // read
    setReadSet(loadReadSet());
    const onReadUpdate = () => setReadSet(loadReadSet());
    window.addEventListener("atesto-read-updated", onReadUpdate);
    window.addEventListener("storage", onReadUpdate);

    return () => {
      window.removeEventListener("atesto-favs-updated", onFavsUpdate);
      window.removeEventListener("storage", onFavsUpdate);
      window.removeEventListener("atesto-read-updated", onReadUpdate);
      window.removeEventListener("storage", onReadUpdate);
    };
  }, []);

  const q = query.trim().toLowerCase();

  // Flatten všech otázek podle filtrů (jen pro globální progress)
  const allQuestions = useMemo(() => {
    const out: Question[] = [];
    for (const t of topics) {
      for (const it of t.questions) {
        if (onlyPublished && it.status !== "PUBLISHED") continue;
        out.push(it);
      }
    }
    return out;
  }, [topics, onlyPublished]);

  const globalProgress = useMemo(() => {
    const total = allQuestions.length;
    const read = allQuestions.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    return { total, read, pct };
  }, [allQuestions, readSet]);

  // topics pro zobrazení (filtry + meta)
  const filteredTopics = useMemo(() => {
    return topics
      .map((t) => {
        const all = t.questions ?? [];

        const publishedAll = all.filter((x) => x.status === "PUBLISHED");
        const readPublished = publishedAll.filter((x) => readSet.has(x.slug));
        const favAll = all.filter((x) => favSet.has(x.slug));

        const questions = all.filter((it) => {
          if (onlyPublished && it.status !== "PUBLISHED") return false;
          if (onlyFav && !favSet.has(it.slug)) return false;

          if (!q) return true;

          return (
            it.title.toLowerCase().includes(q) ||
            it.slug.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            t.slug.toLowerCase().includes(q)
          );
        });

        return {
          ...t,
          questions,
          meta: {
            totalAll: all.length,
            publishedAll: publishedAll.length,
            readPublished: readPublished.length,
            favAll: favAll.length,
          },
        };
      })
      .filter((t: any) => (hideEmpty ? t.questions.length > 0 : true));
  }, [topics, onlyPublished, onlyFav, hideEmpty, q, favSet, readSet]);

  return (
    <main style={{ display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0 }}>Atesto portál</h1>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/"
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }}
            >
              READ
            </Link>
            <Link
              href="/review"
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }}
            >
              REVIEW
            </Link>
            <Link
              href="/search"
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }}
            >
              SEARCH
            </Link>

            <Link
              href="/editor"
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }}
            >
              EDIT
            </Link>
          </div>
        </div>

        {/* GLOBAL PROGRESS */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 14,
            padding: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ opacity: 0.9 }}>
              Celkem přečteno <b>{globalProgress.read}</b> / <b>{globalProgress.total}</b> ({globalProgress.pct}%)
            </div>

            <div
              style={{
                width: 260,
                height: 8,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.18)",
                overflow: "hidden",
              }}
            >
              <div style={{ width: `${globalProgress.pct}%`, height: "100%", background: "rgba(255,255,255,.35)" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input
              placeholder="Hledej (např. hojení, lipofilling, jizvy…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: 260,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.2)",
                background: "transparent",
                color: "inherit",
              }}
            />

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={onlyPublished} onChange={(e) => setOnlyPublished(e.target.checked)} />
              Jen PUBLISHED
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} />
              Jen ⭐
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
              Skrýt prázdná témata
            </label>
          </div>
        </div>
      </header>

      {/* TOPICS LIST */}
      <section style={{ display: "grid", gap: 14 }}>
        {filteredTopics.map((t: any) => (
          <div
            key={t.slug}
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 16,
              padding: 12,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <strong>
                  {t.order}. {t.title}
                </strong>
                <span style={{ opacity: 0.65, fontSize: 12 }}>{t.slug}</span>

                {/* PER-TOPIC META */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0.85, fontSize: 12 }}>
                  <span>
                    Otázky: <b>{t.meta.publishedAll}</b>/<b>{t.meta.totalAll}</b> (PUBLISHED/ALL)
                  </span>
                  <span>
                    Přečteno: <b>{t.meta.readPublished}</b>/<b>{t.meta.publishedAll}</b> (READ/PUBLISHED)
                  </span>
                  <span>
                    ⭐: <b>{t.meta.favAll}</b>
                  </span>
                </div>
              </div>

              <Link
                href={`/topics/${t.slug}`}
                style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)" }}
              >
                Otevřít seznam →
              </Link>
            </div>

            {t.questions.length === 0 ? (
              <div style={{ opacity: 0.7 }}>Žádné otázky (nebo skryté filtrem).</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {t.questions.map((it: Question) => (
                  <div
                    key={it.slug}
                    style={{
                      border: "1px solid rgba(255,255,255,.10)",
                      borderRadius: 12,
                      padding: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <span>{it.title}</span>
                        <ReadBadgeClient slug={it.slug} />
                      </div>
                      <div style={{ opacity: 0.6, fontSize: 12 }}>{it.slug}</div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ opacity: 0.7, fontSize: 12 }}>{it.status}</span>
                      <button
                        onClick={() => toggleFav(it.slug)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,.2)",
                          background: "transparent",
                          color: "inherit",
                        }}
                      >
                        {favSet.has(it.slug) ? "★" : "☆"}
                      </button>
                      <Link
                        href={`/read/${it.slug}`}
                        style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)" }}
                      >
                        Číst
                      </Link>
                      <Link
                        href={`/questions/${it.slug}`}
                        style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)" }}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
