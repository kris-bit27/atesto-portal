"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useTaxonomyFilters } from "@/app/lib/useTaxonomyFilters";
type Q = {
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  topic?: { slug: string; title: string } | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
};
type Tax = { id: string; slug: string; title: string; order?: number };
type SubTax = Tax & { categoryId: string };

type Props = {
  questions: (Q & { specialtyId?: string | null; domainId?: string | null })[];
  specialties?: Tax[];
  domains?: Tax[];
  categories?: Tax[];
  subcategories?: (Tax & { categoryId: string })[];
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

export default function SearchClient({ questions, specialties = [], domains = [], categories = [], subcategories = [] }: Props) {
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
    categoryId,
    setCategoryId,
    subcategoryId,
    setSubcategoryId,
    resetFilters,
  } = useTaxonomyFilters({ defaultHideEmpty: false, defaultOnlyPublished: true });
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [items, setItems] = useState(questions);
  const [nextCursor, setNextCursor] = useState<string | null>(questions.length ? questions[questions.length - 1].slug : null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (categoryId) setSubcategoryId("");
  }, [categoryId, setSubcategoryId]);

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

  useEffect(() => {
    setItems(questions);
    setNextCursor(questions.length ? questions[questions.length - 1].slug : null);
  }, [questions]);

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

  const categoryById = useMemo(() => {
    const m = new Map<string, Tax>();
    for (const it of categories || []) m.set(it.id, it);
    return m;
  }, [categories]);

  const subcategoryById = useMemo(() => {
    const m = new Map<string, SubTax>();
    for (const it of subcategories || []) m.set(it.id, it as SubTax);
    return m;
  }, [subcategories]);

  const filteredSubcategories = useMemo(() => {
    if (!categoryId) return subcategories;
    return subcategories.filter((s) => s.categoryId === categoryId);
  }, [subcategories, categoryId]);

  const applyCategoryFilter = (id: string) => {
    setCategoryId(id);
    setSubcategoryId("");
  };

  const applySubcategoryFilter = (id: string) => {
    setSubcategoryId(id);
    const sub = subcategoryById.get(id);
    if (!categoryId && sub?.categoryId) setCategoryId(sub.categoryId);
  };

  const filtered = useMemo(() => {
    return (items || [])
      .filter((x) => (specialtyId ? x.specialtyId === specialtyId : true))
      .filter((x) => (domainId ? x.domainId === domainId : true))
      .filter((x) => (categoryId ? x.categoryId === categoryId : true))
      .filter((x) => (subcategoryId ? x.subcategoryId === subcategoryId : true))
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
  }, [items, specialtyId, domainId, categoryId, subcategoryId, onlyPublished, onlyFav, favSet, q]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("take", "300");
      params.set("cursor", nextCursor);
      if (query.trim()) params.set("q", query.trim());
      if (specialtyId) params.set("specialtyId", specialtyId);
      if (categoryId) params.set("categoryId", categoryId);
      if (subcategoryId) params.set("subcategoryId", subcategoryId);
      if (onlyPublished) params.set("published", "1");

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");

      const newItems = Array.isArray(data.items) ? data.items : [];
      setItems((prev) => {
        const seen = new Set(prev.map((x) => x.slug));
        const merged = [...prev];
        for (const it of newItems) {
          if (it?.slug && !seen.has(it.slug)) {
            merged.push(it);
            seen.add(it.slug);
          }
        }
        return merged;
      });
      setNextCursor(data.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

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
              <button type="button" className="atesto-btn" onClick={resetFilters}>Reset</button>

            <select className="atesto-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Všechny kategorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <select
              className="atesto-input"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!filteredSubcategories.length}
            >
              <option value="">Všechny subkategorie</option>
              {filteredSubcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
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
            Nalezeno: <strong>{filtered.length}</strong> / {items.length}
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
                      {x.categoryId && categoryById.get(x.categoryId) ? (
                        <button
                          type="button"
                          className="atesto-badge"
                          onClick={(e) => {
                            e.preventDefault();
                            applyCategoryFilter(x.categoryId as string);
                          }}
                        >
                          {categoryById.get(x.categoryId)?.title}
                        </button>
                      ) : null}
                      {x.subcategoryId && subcategoryById.get(x.subcategoryId) ? (
                        <button
                          type="button"
                          className="atesto-badge"
                          onClick={(e) => {
                            e.preventDefault();
                            applySubcategoryFilter(x.subcategoryId as string);
                          }}
                        >
                          {subcategoryById.get(x.subcategoryId)?.title}
                        </button>
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

      {nextCursor ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="button" className="atesto-btn" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </main>
  );
}
