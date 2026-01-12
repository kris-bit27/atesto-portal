"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReadBadgeClient from "@/app/questions/[slug]/read-toggle-client";

type ContentStatus = "DRAFT" | "PUBLISHED";

type QuestionLite = {
  slug: string;
  title: string;
  status: ContentStatus;
};

type TopicLite = {
  id?: string;
  slug: string;
  title: string;
  order: number;
  specialtyId?: string | null;
  domainId?: string | null;
  questions: QuestionLite[];
};

type TaxonomyLite = {
  id: string;
  slug: string;
  title: string;
  order?: number;
};

type Props = {
  topics: TopicLite[];
  specialties?: TaxonomyLite[];
  domains?: TaxonomyLite[];
};

function safeLower(s: string) {
  return (s || "").toLowerCase();
}

export default function HomeClient({ topics, specialties = [], domains = [] }: Props) {
  const [query, setQuery] = useState("");
  const [onlyPublished, setOnlyPublished] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(false);

  // MVP2 filters
  const [specialtyId, setSpecialtyId] = useState<string>("");
  const [domainId, setDomainId] = useState<string>("");

  // ===== FAVS (localStorage) =====
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem("atesto:favs") || "[]";
      const arr = JSON.parse(raw);
      setFavSet(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setFavSet(new Set());
    }
  }, []);

  // ===== READ SET (localStorage) =====
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem("atesto:read") || "[]";
      const arr = JSON.parse(raw);
      setReadSet(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setReadSet(new Set());
    }
  }, []);

  const allQuestions = useMemo(() => {
    const out: { slug: string; title: string; topicSlug: string }[] = [];
    for (const t of topics) {
      for (const q of t.questions || []) out.push({ slug: q.slug, title: q.title, topicSlug: t.slug });
    }
    return out;
  }, [topics]);

  const globalProgress = useMemo(() => {
    const total = allQuestions.length;
    const read = allQuestions.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    return { total, read, pct };
  }, [allQuestions, readSet]);

  const q = safeLower(query.trim());

  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        if (specialtyId && (t.specialtyId || "") !== specialtyId) return false;
        if (domainId && (t.domainId || "") !== domainId) return false;
        return true;
      })
      .map((topic) => {
        const questions = (topic.questions || []).filter((it) => {
          if (onlyPublished && it.status !== "PUBLISHED") return false;
          if (onlyFav && !favSet.has(it.slug)) return false;

          if (!q) return true;

          const hay = `${safeLower(it.title)} ${safeLower(it.slug)} ${safeLower(topic.title)} ${safeLower(topic.slug)}`;
          return hay.includes(q);
        });

        return { ...topic, questions };
      })
      .filter((topic) => (hideEmpty ? (topic.questions || []).length > 0 : true));
  }, [topics, specialtyId, domainId, onlyPublished, onlyFav, hideEmpty, q, favSet]);

  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-card">
        <div className="atesto-card-head">
          <h1 className="atesto-h1" style={{ marginBottom: 6 }}>Atesto portál</h1>
          <div className="atesto-subtle">Učení podle témat • progress • rychlé vyhledávání</div>
        </div>

        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-progress">
            <div className="atesto-progress-row">
              <div>
                Celkem přečteno <b>{globalProgress.read}</b> / <b>{globalProgress.total}</b> ({globalProgress.pct}%)
              </div>
              <div className="atesto-progressbar">
                <div className="atesto-progressbar-fill" style={{ width: `${globalProgress.pct}%` }} />
              </div>
            </div>

            {/* MVP2: 2 selecty vedle sebe */}
            <div className="atesto-filters" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select className="atesto-input" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                <option value="">Filtr: všechny obory</option>
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
                <option value="">Filtr: všechny domény</option>
                {domains
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* původní filtry */}
            <div className="atesto-filters">
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
                  <div className="atesto-topic-title">
                    <span className="atesto-pill">{t.order}</span>
                    <strong>{t.title}</strong>
                  </div>
                  <div className="atesto-subtle">{t.slug}</div>
                </div>

                <Link className="atesto-btn atesto-btn-ghost" href={`/topics/${t.slug}`}>
                  Otevřít →
                </Link>
              </div>

              {(t.questions || []).length === 0 ? (
                <div className="atesto-subtle" style={{ marginTop: 8 }}>Žádné otázky (nebo skryté filtrem).</div>
              ) : (
                <div className="atesto-qgrid">
                  {t.questions.map((it) => (
                    <Link key={it.slug} className="atesto-qitem" href={`/questions/${it.slug}`}>
                      <div className="atesto-qitem-head">
                        <div className="atesto-qitem-title">{it.title}</div>
                        <span className={it.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                          {it.status}
                        </span>
                      </div>
                      <div className="atesto-qitem-sub">
                        <span className="atesto-subtle">{it.slug}</span>
                        <ReadBadgeClient slug={it.slug} />
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
