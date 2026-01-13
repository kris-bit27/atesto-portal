"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useTaxonomyFilters } from "@/app/lib/useTaxonomyFilters";
type Q = { slug: string; title: string; status: "DRAFT" | "PUBLISHED" };
type Topic = {
  id: string;
  title: string;
  slug: string;
  order: number;
  specialtyId?: string | null;
  domainId?: string | null;
  questions: Q[];
};

type Tax = { id: string; slug: string; title: string; order?: number };

type Props = {
  topics: Topic[];
  specialties?: Tax[];
  domains?: Tax[];
};

function makeIdMap(arr: {id: string}[]) {
  const m = new Map<string, any>();
  for (const it of arr || []) m.set(it.id, it);
  return m;
}

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

export default function ReadClient({ topics, specialties = [], domains = [] }: Props) {
  const {
    query,
    setQuery,
    q,
    onlyPublished,
    setOnlyPublished,
    onlyFav,
    setOnlyFav,
    hideEmpty,
    setHideEmpty,
    specialtyId,
    setSpecialtyId,
    domainId,
    setDomainId,
  } = useTaxonomyFilters({ defaultHideEmpty: true });

  useEffect(() => {
    if (specialtyId) setDomainId("");
  }, [specialtyId, setDomainId]);

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

  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => (specialtyId ? t.specialtyId === specialtyId : true))
      .filter((t) => (domainId ? t.domainId === domainId : true))
      .map((topic) => {
        const questions = (topic.questions || []).filter((it) => {
          if (onlyPublished && it.status !== "PUBLISHED") return false;
          if (onlyFav && !favSet.has(it.slug)) return false;

          if (!q) return true;

          return (
            it.title.toLowerCase().includes(q) ||
            it.slug.toLowerCase().includes(q) ||
            topic.title.toLowerCase().includes(q) ||
            topic.slug.toLowerCase().includes(q)
          );
        });

        return { ...topic, questions };
      })
      .filter((t) => (hideEmpty ? (t.questions || []).length > 0 : true));
  }, [topics, specialtyId, domainId, onlyPublished, onlyFav, hideEmpty, q, favSet]);

  const counts = useMemo(() => {
    const all = filteredTopics.flatMap((t) => t.questions || []);
    const total = all.length;
    const read = all.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    return { total, read, pct };
  }, [filteredTopics, readSet]);

  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-card">
        <div className="atesto-card-head">
          <h1 className="atesto-h1" style={{ marginBottom: 6 }}>
            Read
          </h1>
          <div className="atesto-subtle">Filtry jako Home • čtení podle taxonomy</div>
        </div>

        <div className="atesto-card-inner atesto-stack">
          {/* Filters row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="atesto-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledej (title/slug/topic)…"
              style={{ minWidth: 260 }}
            />

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

          {/* mini progress */}
          <div className="atesto-subtle" style={{ marginTop: 6 }}>
            Zobrazeno: <strong>{counts.read}</strong> / <strong>{counts.total}</strong> ({counts.pct}% přečteno v aktuálním filtru)
          </div>
        </div>
      </header>

      {/* Topics + questions */}
      <section className="atesto-stack">
        {filteredTopics.map((t) => (
          <div key={t.id} className="atesto-card">
            <div className="atesto-card-head" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div className="atesto-badge">{t.order}</div>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <strong>{t.title}</strong>

                    {/* badges */}
                    {t.specialtyId && specialtyById.get(t.specialtyId) ? (
                      <button type="button" className="atesto-badge atesto-badge-ok" title="Filtrovat podle specialty" onClick={() => { setSpecialtyId(t.specialtyId || ""); /*setDomainId("");*/ }}>{specialtyById.get(t.specialtyId)?.title}</button>
                    ) : null}
                    {t.domainId && domainById.get(t.domainId) ? (
                      <button type="button" className="atesto-badge" title="Filtrovat podle domény" onClick={() => { setDomainId(t.domainId || ""); /*setSpecialtyId("");*/ }}>{domainById.get(t.domainId)?.title}</button>
                    ) : null}
                  </div>
                  <div className="atesto-subtle">{t.slug}</div>
                </div>
              </div>

              <Link className="atesto-btn atesto-btn-ghost" href={`/topics/${t.slug}`}>
                Otevřít →
              </Link>
            </div>

            <div className="atesto-card-inner">
              {(t.questions || []).length === 0 ? (
                <div className="atesto-subtle">Žádné otázky (nebo skryté filtrem).</div>
              ) : (
                <div className="atesto-grid">
                  {t.questions.map((q) => (
                    <Link key={q.slug} className="atesto-card atesto-card-mini" href={`/questions/${q.slug}`}>
                      <div className="atesto-card-inner atesto-stack" style={{ gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                          <strong>{q.title}</strong>
                          <span className={q.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                            {q.status}
                          </span>
                        </div>
                        <div className="atesto-subtle" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <span>{q.slug}</span>
                          <span>{readSet.has(q.slug) ? "✓ READ" : ""}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
