"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadReadSet, pickNextUnread } from "@/app/lib/continue";

import { useTaxonomyFilters } from "@/app/lib/useTaxonomyFilters";
type Topic = {
  id: string;
  title: string;
  slug: string;
  order: number;
  specialtyId?: string | null;
  domainId?: string | null;
  questions: { slug: string; title: string; status: "DRAFT" | "PUBLISHED"; kind?: string; source?: string; specialtyId?: string | null }[];
};

type Tax = { id: string; slug: string; title: string; order?: number };

type Props = {
  topics: Topic[];
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


export default function HomeClient(props: Props) {
  const { topics, specialties = [], domains = [] } = props;
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
    resetFilters,
  } = useTaxonomyFilters({ defaultHideEmpty: true });

  // MVP2: když změníš specialty, resetni doménu (aby nevznikl prázdný filtr)
  useEffect(() => {
    if (specialtyId) setDomainId("");
  }, [specialtyId, setDomainId]);

  // lookup maps (MVP2 badges)
  const specialtyById = useMemo(() => {
    const m = new Map<string, any>();
    for (const it of specialties || []) m.set(it.id, it);
    return m;
  }, [specialties]);

  const domainById = useMemo(() => {
    const m = new Map<string, any>();
    for (const it of domains || []) m.set(it.id, it);
    return m;
  }, [domains]);

  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [lastOpenedSlug, setLastOpenedSlug] = useState<string | null>(null);

  useEffect(() => {
    setFavSet(getSet("atesto:favs"));
    setReadSet(loadReadSet());
    const onStorage = () => {
      setFavSet(getSet("atesto:favs"));
      setReadSet(loadReadSet());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readLastOpened = () => {
      try {
        const marker = window.localStorage.getItem("atesto:authProgress");
        if (!marker) return setLastOpenedSlug(null);
        const raw = window.localStorage.getItem("atesto:lastOpened");
        if (!raw) return setLastOpenedSlug(null);
        const obj = JSON.parse(raw) as { slug?: string };
        setLastOpenedSlug(typeof obj?.slug === "string" ? obj.slug : null);
      } catch {
        setLastOpenedSlug(null);
      }
    };
    readLastOpened();
    const onStorage = () => readLastOpened();
    const onOpened = () => readLastOpened();
    window.addEventListener("storage", onStorage);
    window.addEventListener("atesto-opened", onOpened as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("atesto-opened", onOpened as EventListener);
    };
  }, []);

  const allQuestions = useMemo(() => topics.flatMap((t) => t.questions || []), [topics]);

  const globalProgress = useMemo(() => {
    const total = allQuestions.length;
    const read = allQuestions.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    return { total, read, pct };
  }, [allQuestions, readSet]);

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
  
  const nextUnreadSlug = useMemo(() => {
    return pickNextUnread(filteredTopics as any, readSet);
  }, [filteredTopics, readSet]);
  const continueSlug = lastOpenedSlug || nextUnreadSlug;


  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-card">
        <div className="atesto-card-head">
          <h1 className="atesto-h1" style={{ marginBottom: 6 }}>
            Atesto portál
          </h1>
          <div className="atesto-subtle">Učení podle témat • progress • rychlé vyhledávání</div>
        </div>

        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-progress">
            <div className="atesto-progress-row">
              <div>
                Celkem přečteno <b>{globalProgress.read}</b> / <b>{globalProgress.total}</b> ({globalProgress.pct}%)
              </div>
              <button type="button" className="atesto-btn" onClick={resetFilters} style={{ marginLeft: 6 }}>
                Reset filtry
              </button>
            </div>

            <div className="atesto-progressbar">
              <div className="atesto-progressbar-fill" style={{ width: `${globalProgress.pct}%` }} />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
              {continueSlug ? (
                <Link className="atesto-btn" href={`/questions/${continueSlug}`}>
                  Continue reading →
                </Link>
              ) : (
                <span className="atesto-subtle">✅ Vše v aktuálním filtru přečteno</span>
              )}
            </div>

            <div className="atesto-filters">
              {/* MVP2: Specialty + Domain */}
              <select className="atesto-input" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                <option value="">Specialty (vše)</option>
                {specialties
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
              </select>

              <select className="atesto-input" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
                <option value="">Domain (vše)</option>
                {domains
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
              </select>

              <input
                className="atesto-input"
                placeholder="Hledej (např. hojení, lipofilling, jizvy…)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <label className="atesto-check">
                <input type="checkbox" checked={onlyPublished} onChange={(e) => setOnlyPublished(e.target.checked)} />
                Jen PUBLISHED
              </label>

              <label className="atesto-check">
                <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} />
                Jen oblíbené
              </label>

              <label className="atesto-check">
                <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
                Skrýt prázdná
              </label>
            </div>
          </div>
        </div>
      </header>

      <section className="atesto-stack">
        {filteredTopics.map((t) => (
          <div key={t.slug} className="atesto-card">
            <div className="atesto-card-inner">
              <div className="atesto-topic-row">
                <div className="atesto-topic-left">
                  <div className="atesto-topic-title" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="atesto-pill">{t.order}</span>
                    <strong>{t.title}</strong>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {t.specialtyId && specialtyById.get(t.specialtyId) ? (
                          <button type="button" className="atesto-badge atesto-badge-ok" title="Filtrovat podle specialty" onClick={() => { setSpecialtyId(t.specialtyId || ""); /*setDomainId("");*/ }}>{specialtyById.get(t.specialtyId)?.title}</button>
                        ) : null}
                        {t.domainId && domainById.get(t.domainId) ? (
                          <button type="button" className="atesto-badge" title="Filtrovat podle domény" onClick={() => { setDomainId(t.domainId || ""); /*setSpecialtyId("");*/ }}>{domainById.get(t.domainId)?.title}</button>
                        ) : null}
                      </div>
                  </div>
                  <div className="atesto-subtle">{t.slug}</div>
                </div>

                <Link className="atesto-btn atesto-btn-ghost" href={`/topics/${t.slug}`}>
                  Otevřít →
                </Link>
              </div>

              {(t.questions || []).length === 0 ? (
                <div className="atesto-subtle" style={{ marginTop: 8 }}>
                  Žádné otázky (nebo skryté filtrem).
                </div>
              ) : (
                <div className="atesto-qgrid">
                  {t.questions.map((it) => (
                    <Link key={it.slug} className="atesto-qitem" href={`/questions/${it.slug}`}>
                      <div className="atesto-qitem-head">
                        <div className="atesto-qitem-title">{it.title}</div>
                        <span className={it.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                          {it.status}
                        </span>
{" "}
{readSet.has(it.slug) ? <span className="atesto-badge atesto-badge-ok">READ</span> : null}
{it.kind ? <span className="atesto-badge">{it.kind}</span> : null}
{it.source ? <span className="atesto-badge">{it.source}</span> : null}

                      </div>
                      <div className="atesto-qitem-sub">
                        <span className="atesto-subtle">{it.slug}</span>
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
