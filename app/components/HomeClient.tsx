"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Q = { slug: string; title: string; status: "DRAFT" | "PUBLISHED" };
type TopicRow = {
  id: string;
  title: string;
  slug: string;
  order: number;
  specialtyId?: string | null;
  domainId?: string | null;
  questions: Q[];
};

type TaxRow = { id: string; slug: string; title: string; order: number };

type Props = {
  topics: TopicRow[];
  specialties?: TaxRow[];
  domains?: TaxRow[];
};

export default function HomeClient({ topics, specialties = [], domains = [] }: Props) {
  const [specialtyId, setSpecialtyId] = useState<string>("");
  const [domainId, setDomainId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [onlyPublished, setOnlyPublished] = useState(false);

  // (MVP1) localStorage readSet
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem("atesto_read_v1") || "[]";
      const arr = JSON.parse(raw);
      setReadSet(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setReadSet(new Set());
    }
  }, []);

  const globalProgress = useMemo(() => {
    const all = topics.flatMap((t) => t.questions || []);
    const total = all.length;
    const read = all.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
    const pct = total ? Math.round((read / total) * 100) : 0;
    return { total, read, pct };
  }, [topics, readSet]);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();

    return topics
      .filter((t) => (specialtyId ? t.specialtyId === specialtyId : true))
      .filter((t) => (domainId ? t.domainId === domainId : true))
      .map((t) => {
        const qs = (t.questions || []).filter((it) => {
          if (onlyPublished && it.status !== "PUBLISHED") return false;
          if (!q) return true;
          return (
            it.title.toLowerCase().includes(q) ||
            it.slug.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            t.slug.toLowerCase().includes(q)
          );
        });
        return { ...t, questions: qs };
      });
  }, [topics, specialtyId, domainId, query, onlyPublished]);

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

            {/* MVP2 filters */}
            <div className="atesto-filters" style={{ alignItems: "center" }}>
              <select className="atesto-select" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                <option value="">Všechny obory</option>
                {specialties
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
              </select>

              <select className="atesto-select" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
                <option value="">Všechny domény</option>
                {domains
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
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
                  <div className="atesto-subtle">{t.slug} • {(t.questions || []).length} otázek</div>
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
