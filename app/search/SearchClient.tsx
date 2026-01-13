"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useTaxonomyFilters } from "@/app/lib/useTaxonomyFilters";
type Q = { slug: string; title: string; status: "DRAFT" | "PUBLISHED"; topic?: { slug: string; title: string } | null };
type Tax = { id: string; slug: string; title: string; order?: number };

type Props = {
  questions: (Q & { specialtyId?: string | null; domainId?: string | null })[];
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

export default function SearchClient({ questions, specialties = [], domains = [] }: Props) {
  const {
    query,
    setQuery,
    q,
    onlyPublished,
    setOnlyPublished,
    onlyFav,
    setOnlyFav,
    specialtyId,
    setSpecialtyId,
    domainId,
    setDomainId,
    resetFilters,
  } = useTaxonomyFilters({ defaultHideEmpty: false });
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

  const filtered = useMemo(() => {
    return (questions || [])
      .filter((x) => (specialtyId ? x.specialtyId === specialtyId : true))
      .filter((x) => (domainId ? x.domainId === domainId : true))
      .filter((x) => (onlyPublished ? x.status === "PUBLISHED" : true))
      .filter((x) => (onlyFav ? favSet.has(x.slug) : true))
      .filter((x) => {
        if (!q) return true;
        const topicTitle = x.topic?.title ?? "";
        const topicSlug = x.topic?.slug ?? "";
        return (
          x.title.toLowerCase().includes(q) ||
          x.slug.toLowerCase().includes(q) ||
          topicTitle.toLowerCase().includes(q) ||
          topicSlug.toLowerCase().includes(q)
        );
      });
  }, [questions, specialtyId, domainId, onlyPublished, onlyFav, favSet, q]);

  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-card">
        <div className="atesto-card-head">
          <h1 className="atesto-h1" style={{ marginBottom: 6 }}>
            Search
          </h1>
          <div className="atesto-subtle">Hledání napříč otázkami • taxonomy filtry</div>
        </div>

        <div className="atesto-card-inner atesto-stack">
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
          </div>

          <div className="atesto-subtle" style={{ marginTop: 6 }}>
            Nalezeno: <strong>{filtered.length}</strong> / {questions.length}
          </div>
        </div>
      </header>

      <section className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          {filtered.length === 0 ? (
            <div className="atesto-subtle">Nic nenalezeno.</div>
          ) : (
            <div className="atesto-grid">
              {filtered.map((x) => (
                <Link key={x.slug} className="atesto-card atesto-card-mini" href={`/questions/${x.slug}`}>
                  <div className="atesto-card-inner atesto-stack" style={{ gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <strong>{x.title}</strong>
                      <span className={x.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                        {x.status}
                      </span>
                    </div>

                    <div className="atesto-subtle" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {x.specialtyId && specialtyById.get(x.specialtyId) ? (
                        <span className="atesto-badge atesto-badge-ok">{specialtyById.get(x.specialtyId)?.title}</span>
                      ) : null}
                      {x.domainId && domainById.get(x.domainId) ? (
                        <span className="atesto-badge">{domainById.get(x.domainId)?.title}</span>
                      ) : null}
                      {x.topic?.title ? <span className="atesto-subtle">• {x.topic.title}</span> : null}
                    </div>

                    <div className="atesto-subtle" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span>{x.slug}</span>
                      <span>{readSet.has(x.slug) ? "✓ READ" : ""}</span>
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
