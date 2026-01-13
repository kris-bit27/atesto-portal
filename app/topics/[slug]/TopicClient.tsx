"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Tax = { id: string; slug: string; title: string; order?: number };

type Question = { slug: string; title: string; status: "DRAFT" | "PUBLISHED" };

type Topic = {
  id: string;
  title: string;
  slug: string;
  order: number;
  specialtyId?: string | null;
  domainId?: string | null;
  questions: Question[];
};

type Props = {
  topic: Topic;
  specialties?: Tax[];
  domains?: Tax[];
};

function getSet(key: string) {
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

export default function TopicClient({ topic, specialties = [], domains = [] }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const [onlyPublished, setOnlyPublished] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(true);

  // “scoped” filtry (na topic stránce je to spíš UI konzistence; topic už je pevně daný)
  const [specialtyId, setSpecialtyId] = useState<string>("");
  const [domainId, setDomainId] = useState<string>("");

  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavSet(getSet("atesto:favs"));
    setReadSet(getSet("atesto:read"));
    const onStorage = () => {
      setFavSet(getSet("atesto:favs"));
      setReadSet(getSet("atesto:read"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const specialtyById = useMemo(() => {
    const m = new Map<string, Tax>();
    for (const it of specialties || []) m.set(it.id, it);
    return m;
  }, [specialties]);

  const domainById = useMemo(() => {
    const m = new Map<string, Tax>();
    for (const it of domains || []) m.set(it.id, it);
    return m;
  }, [domains]);

  const filteredQuestions = useMemo(() => {
    const qs = topic.questions || [];
    return qs
      .filter((it) => (onlyPublished ? it.status === "PUBLISHED" : true))
      .filter((it) => (onlyFav ? favSet.has(it.slug) : true))
      .filter((it) => {
        if (!q) return true;
        return it.title.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q) || topic.title.toLowerCase().includes(q);
      })
      .filter((it) => (hideEmpty ? true : true)); // placeholder (u otázky nemáme empty)
  }, [topic, onlyPublished, onlyFav, favSet, q, hideEmpty]);

  const shown = filteredQuestions.length;
  const total = (topic.questions || []).length;
  const readInFilter = filteredQuestions.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
  const pct = shown > 0 ? Math.round((readInFilter / shown) * 100) : 0;

  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-card">
        <div className="atesto-card-head">
          <div className="atesto-subtle" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span>{topic.order}.</span>
            <span>{topic.slug}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <h1 className="atesto-h1" style={{ margin: 0 }}>
              {topic.title}
            </h1>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {topic.specialtyId && specialtyById.get(topic.specialtyId) ? (
                <span className="atesto-badge atesto-badge-ok">{specialtyById.get(topic.specialtyId)?.title}</span>
              ) : null}
              {topic.domainId && domainById.get(topic.domainId) ? (
                <span className="atesto-badge">{domainById.get(topic.domainId)?.title}</span>
              ) : null}
              <Link className="atesto-btn atesto-btn-ghost" href="/">
                ← Home
              </Link>
            </div>
          </div>
        </div>

        <div className="atesto-card-inner atesto-stack">
          {/* Filtry (vzhledově jako Read) */}
          <input
            className="atesto-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledej v otázkách (title/slug)…"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select className="atesto-input" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
              <option value="">Všechny specialty</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <select className="atesto-input" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
              <option value="">Všechny domény</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <label className="atesto-subtle" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={onlyPublished} onChange={(e) => setOnlyPublished(e.target.checked)} />
              jen PUBLISHED
            </label>

            <label className="atesto-subtle" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} />
              jen ⭐
            </label>

            <label className="atesto-subtle" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
              schovat prázdné
            </label>
          </div>

          <div className="atesto-subtle">
            Zobrazeno: <strong>{shown}</strong> / {total} • přečteno v aktuálním filtru: <strong>{readInFilter}</strong> ({pct}%)
          </div>
        </div>
      </header>

      <section className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          {filteredQuestions.length === 0 ? (
            <div className="atesto-subtle">Žádné otázky (nebo skryté filtrem).</div>
          ) : (
            <div className="atesto-grid">
              {filteredQuestions.map((it) => (
                <Link key={it.slug} className="atesto-card atesto-card-mini" href={`/questions/${it.slug}`}>
                  <div className="atesto-card-inner atesto-stack" style={{ gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <strong>{it.title}</strong>
                      <span className={it.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                        {it.status}
                      </span>
                    </div>

                    <div className="atesto-subtle" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span>{it.slug}</span>
                      <span>{readSet.has(it.slug) ? "✓ READ" : ""}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
