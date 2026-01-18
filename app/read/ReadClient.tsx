"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useTaxonomyFilters } from "@/app/lib/useTaxonomyFilters";
type Q = { slug: string; title: string; status: "DRAFT" | "PUBLISHED"; categoryId?: string | null; subcategoryId?: string | null };
type Topic = {
  id: string;
  title: string;
  slug: string;
  order: number;
  specialtyId?: string | null;
  domainId?: string | null;
  questions: Q[];
};

type Tax = { id: string; slug: string; title: string; order?: number; isActive?: boolean; _count?: { questions?: number } };

type Props = {
  topics: Topic[];
  specialties?: Tax[];
  domains?: Tax[];
  categories?: Tax[];
  subcategories?: (Tax & { categoryId: string })[];
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

export default function ReadClient({ topics, specialties = [], domains = [], categories = [], subcategories = [] }: Props) {
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
    categoryId,
    setCategoryId,
    subcategoryId,
    setSubcategoryId,
    resetFilters,
  } = useTaxonomyFilters({ defaultHideEmpty: true, defaultOnlyPublished: true });
  const searchParams = useSearchParams();
  useEffect(() => {
    if (specialtyId) setDomainId("");
  }, [specialtyId, setDomainId]);
  useEffect(() => {
    if (categoryId) setSubcategoryId("");
  }, [categoryId, setSubcategoryId]);

  useEffect(() => {
    if (!searchParams) return;
    const cat = searchParams.get("categoryId") || "";
    const sub = searchParams.get("subcategoryId") || "";
    setCategoryId(cat);
    setSubcategoryId(sub);
  }, [searchParams, setCategoryId, setSubcategoryId]);

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

  const categoryQuestionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of topics) {
      for (const q of t.questions || []) {
        if (!q.categoryId) continue;
        counts.set(q.categoryId, (counts.get(q.categoryId) || 0) + 1);
      }
    }
    return counts;
  }, [topics]);

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.isActive !== false && (categoryQuestionCounts.get(c.id) || 0) > 0);
  }, [categories, categoryQuestionCounts]);

  const activeSubcategories = useMemo(() => {
    return subcategories.filter((s) => s.isActive !== false);
  }, [subcategories]);

  const categoryById = useMemo(() => {
    const m = new Map<string, Tax>();
    for (const it of activeCategories) m.set(it.id, it);
    return m;
  }, [activeCategories]);

  const subcategoryById = useMemo(() => {
    const m = new Map<string, Tax & { categoryId: string }>();
    for (const it of activeSubcategories) m.set(it.id, it as Tax & { categoryId: string });
    return m;
  }, [activeSubcategories]);

  const applyCategoryFilter = (id: string) => {
    setCategoryId(id);
    setSubcategoryId("");
  };

  const applySubcategoryFilter = (id: string) => {
    setSubcategoryId(id);
    const sub = subcategoryById.get(id);
    if (!categoryId && sub?.categoryId) setCategoryId(sub.categoryId);
  };

  const filteredSubcategories = useMemo(() => {
    const list = activeSubcategories;
    if (!categoryId) return list;
    return list.filter((s) => s.categoryId === categoryId);
  }, [activeSubcategories, categoryId]);

  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => (specialtyId ? t.specialtyId === specialtyId : true))
      .filter((t) => (domainId ? t.domainId === domainId : true))
      .map((topic) => {
        const questions = (topic.questions || []).filter((it) => {
          if (onlyPublished && it.status !== "PUBLISHED") return false;
          if (onlyFav && !favSet.has(it.slug)) return false;
          if (categoryId && it.categoryId !== categoryId) return false;
          if (subcategoryId && it.subcategoryId !== subcategoryId) return false;

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
  }, [topics, specialtyId, domainId, categoryId, subcategoryId, onlyPublished, onlyFav, hideEmpty, q, favSet]);

  const counts = useMemo(() => {
    const all = filteredTopics.flatMap((t) => t.questions || []);
    const total = all.length;
    const read = all.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    return { total, read, pct };
  }, [filteredTopics, readSet]);

  const domainList = useMemo(() => {
    return domains.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [domains]);

  const chapterTopics = useMemo(() => {
    return filteredTopics.filter((t) => t.slug.startsWith("ch-"));
  }, [filteredTopics]);

  const legacyTopics = useMemo(() => {
    if (domainList.length === 0) return filteredTopics;
    return filteredTopics.filter((t) => !t.slug.startsWith("ch-") || !t.domainId);
  }, [filteredTopics, domainList.length]);

  const domainGroups = useMemo(() => {
    if (domainList.length === 0) return [];
    const map = new Map<string, Topic[]>();
    for (const t of chapterTopics) {
      if (!t.domainId) continue;
      const arr = map.get(t.domainId) || [];
      arr.push(t);
      map.set(t.domainId, arr);
    }
    return domainList
      .map((d) => {
        const topics = (map.get(d.id) || []).slice().sort((a, b) => {
          const byOrder = (a.order ?? 0) - (b.order ?? 0);
          if (byOrder !== 0) return byOrder;
          return a.title.localeCompare(b.title);
        });
        const questionCount = topics.reduce((acc, t) => acc + (t.questions || []).length, 0);
        return { domain: d, topics, questionCount };
      })
      .filter((g) => g.topics.length > 0);
  }, [domainList, chapterTopics]);

  const legacyCounts = useMemo(() => {
    const total = legacyTopics.reduce((acc, t) => acc + (t.questions || []).length, 0);
    return { topics: legacyTopics.length, total };
  }, [legacyTopics]);

  const renderTopic = (t: Topic) => (
    <div key={t.id} className="atesto-card">
      <div
        className="atesto-card-head"
        style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="atesto-badge">{t.order}</div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <strong>{t.title}</strong>

              {t.specialtyId && specialtyById.get(t.specialtyId) ? (
                <button
                  type="button"
                  className="atesto-badge atesto-badge-ok"
                  title="Filtrovat podle specialty"
                  onClick={() => {
                    setSpecialtyId(t.specialtyId || "");
                    /*setDomainId("");*/
                  }}
                >
                  {specialtyById.get(t.specialtyId)?.title}
                </button>
              ) : null}
              {t.domainId && domainById.get(t.domainId) ? (
                <button
                  type="button"
                  className="atesto-badge"
                  title="Filtrovat podle domény"
                  onClick={() => {
                    setDomainId(t.domainId || "");
                    /*setSpecialtyId("");*/
                  }}
                >
                  {domainById.get(t.domainId)?.title}
                </button>
              ) : null}
            </div>
            <div className="atesto-subtle">{t.slug}</div>
            {(() => {
              const catCounts = new Map<string, number>();
              const subCounts = new Map<string, number>();
              for (const q of t.questions || []) {
                if (q.categoryId) catCounts.set(q.categoryId, (catCounts.get(q.categoryId) || 0) + 1);
                if (q.subcategoryId) subCounts.set(q.subcategoryId, (subCounts.get(q.subcategoryId) || 0) + 1);
              }
              const topCategories = Array.from(catCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([id]) => ({ id, title: categoryById.get(id)?.title }))
                .filter((it) => it.title);
              const topSubcategories = Array.from(subCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([id]) => ({ id, title: subcategoryById.get(id)?.title }))
                .filter((it) => it.title);
              if (topCategories.length === 0 && topSubcategories.length === 0) return null;
              return (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {topCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="atesto-badge atesto-badge-ok"
                      onClick={() => {
                        applyCategoryFilter(c.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {c.title}
                    </button>
                  ))}
                  {topSubcategories.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="atesto-badge"
                      onClick={() => {
                        applySubcategoryFilter(s.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              );
            })()}
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
            {t.questions.map((q) => {
              const category = q.categoryId ? categoryById.get(q.categoryId) : undefined;
              const subcategory = q.subcategoryId ? subcategoryById.get(q.subcategoryId) : undefined;
              return (
                <Link key={q.slug} className="atesto-card atesto-card-mini" href={`/questions/${q.slug}`}>
                  <div className="atesto-card-inner atesto-stack" style={{ gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <strong>{q.title}</strong>
                    <span className={q.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                      {q.status}
                    </span>
                  </div>
                  {category || subcategory ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {category ? (
                        <button
                          type="button"
                          className="atesto-badge atesto-badge-ok"
                          onClick={(e) => {
                            e.preventDefault();
                            applyCategoryFilter(q.categoryId as string);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          {category.title}
                        </button>
                      ) : null}
                      {subcategory ? (
                        <button
                          type="button"
                          className="atesto-badge"
                          onClick={(e) => {
                            e.preventDefault();
                            applySubcategoryFilter(q.subcategoryId as string);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          {subcategory.title}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="atesto-subtle" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span>{q.slug}</span>
                    <span>{readSet.has(q.slug) ? "✓ READ" : ""}</span>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-card">
        <div className="atesto-card-head">
          <h1 className="atesto-h1" style={{ marginBottom: 6 }}>
            Read
          </h1>
          <div className="atesto-subtle">Filtry jako Dashboard • čtení podle taxonomy</div>
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
              <button type="button" className="atesto-btn" onClick={resetFilters}>Reset</button>

            <select className="atesto-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Všechny kategorie</option>
              {activeCategories.map((c) => (
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
        {domainGroups.map((g) => (
          <section key={g.domain.id} className="atesto-stack">
            <div className="atesto-card">
              <div className="atesto-card-head" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <h2 className="atesto-h2" style={{ margin: 0 }}>{g.domain.title}</h2>
                  <div className="atesto-subtle">
                    {g.topics.length} témat • {g.questionCount} otázek
                  </div>
                </div>
              </div>
            </div>
            {g.topics.map((t) => renderTopic(t))}
          </section>
        ))}

        {legacyCounts.topics > 0 ? (
          <section className="atesto-stack">
            <div className="atesto-card">
              <div className="atesto-card-head">
                <h2 className="atesto-h2" style={{ margin: 0 }}>Unsorted / Legacy</h2>
                <div className="atesto-subtle">
                  {legacyCounts.topics} témat • {legacyCounts.total} otázek
                </div>
              </div>
            </div>
            {legacyTopics.map((t) => renderTopic(t))}
          </section>
        ) : null}
      </section>
    </main>
  );
}
