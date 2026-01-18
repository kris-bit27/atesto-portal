"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadReadList, loadReadSet, pickMostRecentRead, pickNextUnread } from "@/app/lib/continue";
import { listDue } from "@/app/lib/srs";
type Topic = {
  id: string;
  title: string;
  slug: string;
  order: number;
  specialtyId?: string | null;
  domainId?: string | null;
  questions: {
    slug: string;
    title: string;
    status: "DRAFT" | "PUBLISHED";
    kind?: string;
    source?: string;
    specialtyId?: string | null;
    categoryId?: string | null;
    subcategoryId?: string | null;
  }[];
};

type Tax = { id: string; slug: string; title: string; order?: number; isActive?: boolean };

type Props = {
  topics: Topic[];
  specialties?: Tax[];
  domains?: Tax[];
  categories?: Tax[];
  subcategories?: (Tax & { categoryId: string })[];
};

type DashboardModule = {
  id: string;
  spanClass?: string;
  content: JSX.Element;
};

export default function HomeClient(props: Props) {
  const { topics, categories = [], subcategories = [] } = props;
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [lastOpenedSlug, setLastOpenedSlug] = useState<string | null>(null);
  const [lastReadSlug, setLastReadSlug] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [recentOpened, setRecentOpened] = useState<string[]>([]);
  const [analyticsDueToday, setAnalyticsDueToday] = useState(0);
  const [analyticsStreak, setAnalyticsStreak] = useState(0);
  const [analyticsThisWeek, setAnalyticsThisWeek] = useState(0);
  const [dueNowItems, setDueNowItems] = useState<{ slug: string; dueAt: number }[]>([]);
  const [sparkCounts, setSparkCounts] = useState<number[]>([]);
  const [readsByDay, setReadsByDay] = useState<{ date: string; count: number }[]>([]);
  const prevReadCountRef = useRef(0);

  useEffect(() => {
    setReadSet(loadReadSet());
    prevReadCountRef.current = loadReadSet().size;
    setLastReadSlug(pickMostRecentRead(loadReadList()));
    const onStorage = () => {
      const next = loadReadSet();
      setReadSet(next);
      setLastReadSlug(pickMostRecentRead(loadReadList()));
    };
    const onRead = () => setLastReadSlug(pickMostRecentRead(loadReadList()));
    window.addEventListener("storage", onStorage);
    window.addEventListener("atesto-read-updated", onRead as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("atesto-read-updated", onRead as EventListener);
    };
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "atesto:readsByDay";
    const toDateKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const readMap = () => {
      try {
        const raw = window.localStorage.getItem(key);
        const obj = raw ? JSON.parse(raw) : {};
        return typeof obj === "object" && obj ? obj : {};
      } catch {
        return {};
      }
    };
    const getLast7 = () => {
      const now = new Date();
      const obj = readMap();
      const out: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const keyDay = toDateKey(d);
        const count = typeof obj[keyDay] === "number" ? obj[keyDay] : 0;
        out.push({ date: keyDay, count });
      }
      setReadsByDay(out);
    };
    const onOpened = () => {
      const obj = readMap();
      const today = toDateKey(new Date());
      obj[today] = (typeof obj[today] === "number" ? obj[today] : 0) + 1;
      try {
        window.localStorage.setItem(key, JSON.stringify(obj));
      } catch {}
      getLast7();
    };
    getLast7();
    window.addEventListener("atesto-opened", onOpened as EventListener);
    window.addEventListener("storage", getLast7 as EventListener);
    return () => {
      window.removeEventListener("atesto-opened", onOpened as EventListener);
      window.removeEventListener("storage", getLast7 as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readRecent = () => {
      try {
        const raw = window.localStorage.getItem("atesto:lastOpened");
        if (!raw) {
          setRecentOpened([]);
          return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const slugs = parsed
            .map((it) => (typeof it === "string" ? it : typeof it?.slug === "string" ? it.slug : ""))
            .filter(Boolean);
          setRecentOpened(slugs.slice(-5).reverse());
          return;
        }
        if (typeof parsed === "string") {
          setRecentOpened([parsed]);
          return;
        }
        if (typeof parsed?.slug === "string") {
          setRecentOpened([parsed.slug]);
          return;
        }
        setRecentOpened([]);
      } catch {
        setRecentOpened([]);
      }
    };
    const readDue = () => setDueCount(listDue().length);
    const readAnalytics = () => {
      try {
        const rawSrs = window.localStorage.getItem("atesto_srs_v1");
        const obj = rawSrs ? JSON.parse(rawSrs) : {};
        const now = Date.now();
        const dueItems = Object.entries(obj || {})
          .map(([slug, it]: [string, any]) => ({
            slug,
            dueAt: typeof it?.nextDueAt === "number" ? it.nextDueAt : 0,
          }))
          .filter((it) => it.dueAt > 0 && it.dueAt <= now)
          .sort((a, b) => a.dueAt - b.dueAt);
        const dueToday = Object.values(obj || {}).filter((it: any) => {
          const dueAt = typeof it?.nextDueAt === "number" ? it.nextDueAt : 0;
          return dueAt > 0 && dueAt <= now;
        }).length;
        setAnalyticsDueToday(dueToday);
        setDueNowItems(dueItems);
      } catch {
        setAnalyticsDueToday(0);
        setDueNowItems([]);
      }

      try {
        const rawLast = window.localStorage.getItem("atesto:lastOpened");
        const parsed = rawLast ? JSON.parse(rawLast) : null;
        const at = typeof parsed?.at === "number" ? parsed.at : 0;
        if (!at) {
          setAnalyticsStreak(0);
        } else {
          const last = new Date(at);
          const now = new Date();
          const isToday =
            last.getFullYear() === now.getFullYear() &&
            last.getMonth() === now.getMonth() &&
            last.getDate() === now.getDate();
          setAnalyticsStreak(isToday ? 1 : 0);
        }
      } catch {
        setAnalyticsStreak(0);
      }

      try {
        const rawRead = window.localStorage.getItem("atesto:read");
        const arr = rawRead ? JSON.parse(rawRead) : [];
        const count = Array.isArray(arr) ? arr.length : 0;
        setAnalyticsThisWeek(count);
      } catch {
        setAnalyticsThisWeek(0);
      }
    };
    readRecent();
    readDue();
    readAnalytics();
    const onStorage = () => {
      readRecent();
      readDue();
      readAnalytics();
    };
    const onOpened = () => readRecent();
    const onSrs = () => readDue();
    const onRead = () => readAnalytics();
    window.addEventListener("storage", onStorage);
    window.addEventListener("atesto-opened", onOpened as EventListener);
    window.addEventListener("atesto-srs-updated", onSrs as EventListener);
    window.addEventListener("atesto-read-updated", onRead as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("atesto-opened", onOpened as EventListener);
      window.removeEventListener("atesto-srs-updated", onSrs as EventListener);
      window.removeEventListener("atesto-read-updated", onRead as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "mn:readEvents";
    const appendEvent = (value: boolean) => {
      try {
        const raw = window.localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const next = Array.isArray(arr) ? arr : [];
        next.push({ ts: Date.now(), value });
        const trimmed = next.slice(-500);
        window.localStorage.setItem(key, JSON.stringify(trimmed));
      } catch {}
    };
    const computeSpark = () => {
      try {
        const raw = window.localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const events = Array.isArray(arr) ? arr : [];
        const now = new Date();
        const days: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() - i);
          days.push(d.getTime());
        }
        const counts = new Array(7).fill(0);
        for (const e of events) {
          if (!e || typeof e.ts !== "number") continue;
          if (!e.value) continue;
          const d = new Date(e.ts);
          d.setHours(0, 0, 0, 0);
          const idx = days.indexOf(d.getTime());
          if (idx >= 0) counts[idx] += 1;
        }
        setSparkCounts(counts);
      } catch {
        setSparkCounts(new Array(7).fill(0));
      }
    };
    const onReadUpdated = () => {
      const next = loadReadSet();
      const prev = prevReadCountRef.current;
      const curr = next.size;
      if (curr !== prev) {
        appendEvent(curr > prev);
        prevReadCountRef.current = curr;
      }
      computeSpark();
    };
    computeSpark();
    window.addEventListener("atesto-read-updated", onReadUpdated as EventListener);
    return () => {
      window.removeEventListener("atesto-read-updated", onReadUpdated as EventListener);
    };
  }, []);

  const allQuestions = useMemo(() => topics.flatMap((t) => t.questions || []), [topics]);
  const questionTitleBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of topics) {
      for (const q of t.questions || []) {
        if (q.slug) m.set(q.slug, q.title || q.slug);
      }
    }
    return m;
  }, [topics]);
  const dueNowVisible = useMemo(() => {
    return dueNowItems.filter((it) => questionTitleBySlug.has(it.slug)).slice(0, 5);
  }, [dueNowItems, questionTitleBySlug]);

  const globalProgress = useMemo(() => {
    const total = allQuestions.length;
    const read = allQuestions.reduce((acc, it) => acc + (readSet.has(it.slug) ? 1 : 0), 0);
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    return { total, read, pct };
  }, [allQuestions, readSet]);
  const donut = useMemo(() => {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const pct = globalProgress.pct || 0;
    const offset = circumference - (pct / 100) * circumference;
    return { radius, circumference, offset };
  }, [globalProgress.pct]);
  const byTopicStats = useMemo(() => {
    return topics
      .map((t) => {
        const total = (t.questions || []).length;
        const read = (t.questions || []).reduce((acc, q) => acc + (readSet.has(q.slug) ? 1 : 0), 0);
        const pct = total > 0 ? Math.round((read / total) * 100) : 0;
        return { slug: t.slug, title: t.title, read, total, pct };
      })
      .sort((a, b) => (a.pct - b.pct) || (a.total - b.total))
      .slice(0, 8);
  }, [topics, readSet]);
  const heatmapTopics = useMemo(() => {
    return topics
      .map((t) => {
        const total = (t.questions || []).length;
        const read = (t.questions || []).reduce((acc, q) => acc + (readSet.has(q.slug) ? 1 : 0), 0);
        const pct = total > 0 ? read / total : 0;
        return { slug: t.slug, title: t.title, read, total, pct };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [topics, readSet]);
  const sparkLabels = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabels = ["Ne", "Po", "Ut", "St", "Ct", "Pa", "So"];
      labels.push(dayLabels[d.getDay()] || "");
    }
    return labels;
  }, []);

  const activeCategories = useMemo(() => categories.filter((c) => c.isActive !== false), [categories]);
  const activeSubcategories = useMemo(() => subcategories.filter((s) => s.isActive !== false), [subcategories]);
  const categoryStats = useMemo(() => {
    return activeCategories
      .map((c) => {
        const items = allQuestions.filter((q) => q.categoryId === c.id);
        const total = items.length;
        const read = items.reduce((acc, q) => acc + (readSet.has(q.slug) ? 1 : 0), 0);
        const pct = total > 0 ? Math.round((read / total) * 100) : 0;
        return { id: c.id, title: c.title, total, read, pct };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => {
        if (b.pct !== a.pct) return b.pct - a.pct;
        return b.total - a.total;
      });
  }, [activeCategories, allQuestions, readSet]);

  const subcategoryStats = useMemo(() => {
    return activeSubcategories.map((s) => {
      const items = allQuestions.filter((q) => q.subcategoryId === s.id);
      const total = items.length;
      const read = items.reduce((acc, q) => acc + (readSet.has(q.slug) ? 1 : 0), 0);
      const pct = total > 0 ? Math.round((read / total) * 100) : 0;
      return { id: s.id, title: s.title, total, read, pct, categoryId: s.categoryId };
    });
  }, [activeSubcategories, allQuestions, readSet]);

  const readsByDayMax = useMemo(() => {
    const max = readsByDay.reduce((acc, it) => Math.max(acc, it.count), 0);
    return max || 1;
  }, [readsByDay]);

  const nextUnreadSlug = useMemo(() => {
    return pickNextUnread(topics as any, readSet);
  }, [topics, readSet]);
  const continueSlug = lastOpenedSlug || lastReadSlug || nextUnreadSlug;

  const modules: DashboardModule[] = useMemo(
    () => [
      {
        id: "dashboard-main",
        spanClass: "mn-span-3",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h2 className="atesto-h2">Dashboard</h2>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                {continueSlug ? (
                  <Link className="atesto-btn" href={`/questions/${continueSlug}`}>
                    Continue reading →
                  </Link>
                ) : (
                  <span className="atesto-subtle">✅ Vše přečteno</span>
                )}
                <span className="atesto-badge">Due for review: {dueCount}</span>
                <span className="atesto-subtle">
                  Read: {globalProgress.read}/{globalProgress.total} ({globalProgress.pct}%)
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Link className="atesto-btn" href="/review">
                  Start Review →
                </Link>
                <Link className="atesto-btn" href="/search">
                  Search →
                </Link>
              </div>

              <div className="atesto-stack">
                <div className="atesto-subtle">Recent activity</div>
                {recentOpened.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {recentOpened.map((slug) => (
                      <Link key={slug} className="atesto-btn atesto-btn-ghost" href={`/questions/${slug}`}>
                        {slug}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="atesto-subtle">Zatím žádná aktivita</div>
                )}
              </div>
            </div>
          </section>
        ),
      },
      {
        id: "progress-summary",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Progress summary</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div className="atesto-subtle">
                Celkem: <b>{globalProgress.total}</b>
              </div>
              <div className="atesto-subtle">
                Přečteno: <b>{globalProgress.read}</b> ({globalProgress.pct}%)
              </div>
              <div className="atesto-progressbar">
                <div className="atesto-progressbar-fill" style={{ width: `${globalProgress.pct}%` }} />
              </div>
            </div>
          </section>
        ),
      },
      {
        id: "quick-actions",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Quick actions</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <Link className="atesto-btn" href="/read">
                Start reading →
              </Link>
              <Link className="atesto-btn" href="/review">
                Review due →
              </Link>
              <Link className="atesto-btn" href="/search">
                Search →
              </Link>
            </div>
          </section>
        ),
      },
      {
        id: "progress-graphs",
        spanClass: "mn-span-2",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Progress graphs</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div className="mn-donut">
                  <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
                    <circle className="mn-donut-track" cx="60" cy="60" r={donut.radius} />
                    <circle
                      className="mn-donut-ring"
                      cx="60"
                      cy="60"
                      r={donut.radius}
                      strokeDasharray={`${donut.circumference} ${donut.circumference}`}
                      strokeDashoffset={donut.offset}
                    />
                  </svg>
                  <div className="mn-donut-center">
                    <div className="atesto-h2">{globalProgress.pct}%</div>
                    <div className="atesto-subtle">
                      {globalProgress.read}/{globalProgress.total}
                    </div>
                  </div>
                </div>

                <div className="atesto-stack mn-spark">
                  <div className="mn-spark-bars">
                    {sparkCounts.map((v, i) => (
                      <div key={`${i}-${v}`} className="mn-spark-bar">
                        <div className="mn-spark-fill" style={{ height: `${Math.min(100, v * 20)}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="mn-spark-labels">
                    {sparkLabels.map((l, i) => (
                      <span key={`${l}-${i}`}>{l}</span>
                    ))}
                  </div>
                </div>

                <div className="mn-heat">
                  {heatmapTopics.map((t) => (
                    <div
                      key={t.slug}
                      className="mn-heat-cell"
                      title={`${t.title} — ${t.read}/${t.total}`}
                      style={{ opacity: Math.max(0.15, Math.min(1, t.pct || 0)) }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ),
      },
      {
        id: "progress-category",
        spanClass: "mn-span-2",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Progress by category</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              {categoryStats.length > 0 ? (
                <div className="atesto-stack">
                  {categoryStats.map((c) => (
                    <div key={c.id} style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <Link className="atesto-btn atesto-btn-ghost" href={`/read?categoryId=${c.id}`}>
                          {c.title}
                        </Link>
                        <div className="atesto-subtle">
                          {c.read}/{c.total} • {c.pct}%
                        </div>
                      </div>
                      <div className="atesto-progressbar">
                        <div className="atesto-progressbar-fill" style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="atesto-subtle">Žádné kategorie</div>
              )}
            </div>
          </section>
        ),
      },
      {
        id: "reads-7-days",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Reads last 7 days</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div style={{ display: "grid", gap: 8 }}>
                {readsByDay.map((d) => (
                  <div key={d.date} style={{ display: "grid", gridTemplateColumns: "90px 1fr 40px", gap: 8, alignItems: "center" }}>
                    <div className="atesto-subtle">{d.date}</div>
                    <div className="atesto-progressbar" style={{ height: 8 }}>
                      <div className="atesto-progressbar-fill" style={{ width: `${Math.round((d.count / readsByDayMax) * 100)}%` }} />
                    </div>
                    <div className="atesto-subtle" style={{ textAlign: "right" }}>{d.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ),
      },
      {
        id: "progress-subcategory",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Progress by subcategory</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              {subcategoryStats.length > 0 ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {subcategoryStats.map((s) => (
                    <div key={s.id} style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>{s.title}</div>
                        <div className="atesto-subtle">
                          {s.read}/{s.total} • {s.pct}%
                        </div>
                      </div>
                      <div className="atesto-progressbar">
                        <div className="atesto-progressbar-fill" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="atesto-subtle">Žádné subkategorie</div>
              )}
            </div>
          </section>
        ),
      },
      {
        id: "flashcards",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Flashcards</h3>
              <div className="atesto-subtle">MVP2: rychlé opakování (coming soon)</div>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="atesto-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Start Flashcards
                </button>
                <button className="atesto-btn atesto-btn-ghost" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Create deck
                </button>
              </div>
              <div className="atesto-stack">
                <div className="atesto-subtle">Perforátory – definice</div>
                <div className="atesto-subtle">CTS – klinika</div>
                <div className="atesto-subtle">Kožní štěp – indikace</div>
              </div>
            </div>
          </section>
        ),
      },
      {
        id: "mcq",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">MCQ</h3>
              <div className="atesto-subtle">MVP2: testování znalostí (coming soon)</div>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="atesto-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Start quiz
                </button>
                <button className="atesto-btn atesto-btn-ghost" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Generate quiz
                </button>
              </div>
              <div className="atesto-subtle">Status: 0 quizzes • 0 attempts</div>
            </div>
          </section>
        ),
      },
      {
        id: "by-topic",
        spanClass: "mn-span-3",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">By topic (top 8)</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              {byTopicStats.length > 0 ? (
                <div className="atesto-stack">
                  {byTopicStats.map((t) => (
                    <div key={t.slug} style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>{t.title}</div>
                        <div className="atesto-subtle">
                          {t.read}/{t.total} • {t.pct}%
                        </div>
                      </div>
                      <div className="atesto-progressbar">
                        <div className="atesto-progressbar-fill" style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="atesto-subtle">Žádná data k zobrazení</div>
              )}
            </div>
          </section>
        ),
      },
      {
        id: "logbook",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Logbook</h3>
              <div className="atesto-subtle">MVP2: výkonový deník a portfolio (coming soon)</div>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div className="atesto-stack">
                <div className="atesto-subtle">Date | Procedure | Note</div>
                <div className="atesto-subtle">2026-01-12 | CTS release | asistence</div>
                <div className="atesto-subtle">2026-01-10 | STSG | 3% TBSA</div>
                <div className="atesto-subtle">2026-01-08 | Dupuytren | fasciektomie</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="atesto-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Add entry
                </button>
                <button className="atesto-btn atesto-btn-ghost" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Export PDF
                </button>
              </div>
            </div>
          </section>
        ),
      },
      {
        id: "analytics",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Analytics</h3>
              <div className="atesto-subtle">MVP2: přehled učení a aktivity (coming soon)</div>
            </div>
            <div className="atesto-card-inner atesto-stack">
              <div className="atesto-subtle">Streak: {analyticsStreak} dní</div>
              <div className="atesto-subtle">This week (approx): {analyticsThisWeek} přečteno</div>
              <div className="atesto-subtle">Due today: {analyticsDueToday}</div>
              <div>
                <button className="atesto-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  Open dashboard
                </button>
              </div>
            </div>
          </section>
        ),
      },
      {
        id: "due-now",
        spanClass: "mn-span-3",
        content: (
          <section className="atesto-card">
            <div className="atesto-card-head">
              <h3 className="atesto-h3">Due now</h3>
            </div>
            <div className="atesto-card-inner atesto-stack">
              {dueNowVisible.length > 0 ? (
                <div className="atesto-stack">
                  {dueNowVisible.map((it) => (
                    <Link key={it.slug} className="atesto-btn atesto-btn-ghost" href={`/questions/${it.slug}`}>
                      {questionTitleBySlug.get(it.slug)} <span className="atesto-badge">DUE</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="atesto-subtle">Nic k opakování 🎉</div>
              )}

              <div>
                <Link className="atesto-btn" href="/review">
                  Open Review →
                </Link>
              </div>
            </div>
          </section>
        ),
      },
    ],
    [
      analyticsDueToday,
      analyticsStreak,
      analyticsThisWeek,
      byTopicStats,
      categoryStats,
      continueSlug,
      dueCount,
      dueNowVisible,
      globalProgress,
      heatmapTopics,
      questionTitleBySlug,
      readsByDay,
      readsByDayMax,
      recentOpened,
      sparkCounts,
      sparkLabels,
      subcategoryStats,
    ]
  );

  const orderedModules = modules;

  return (
    <main className="atesto-container">
      <div
        className="mn-dashboard-grid"
        style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", width: "100%" }}
      >
        <header className="atesto-card mn-span-3">
          <div className="atesto-card-head">
            <h1 className="atesto-h1" style={{ marginBottom: 6 }}>
              Dashboard
            </h1>
            <div className="atesto-subtle">MedNexus Dashboard</div>
          </div>

          <div className="atesto-card-inner atesto-stack">
            {/* TODO: optional drag & drop dashboard layout */}
            <div className="atesto-progress">
              <div className="atesto-progress-row">
                <div>
                  Celkem přečteno <b>{globalProgress.read}</b> / <b>{globalProgress.total}</b> ({globalProgress.pct}%)
                </div>
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
                  <span className="atesto-subtle">✅ Vše přečteno</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {orderedModules.map((m) => (
          <div key={m.id} className={m.spanClass}>
            {m.content}
          </div>
        ))}
      </div>
    </main>
  );
}
