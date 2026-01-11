"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listDue, markReviewed, removeFromReview, SRS_KEY } from "@/app/lib/srs";

type QInfo = {
  slug: string;
  title: string;
  status: string;
  updatedAt: string;
  topic?: { order: number; title: string; slug: string };
};

export default function ReviewClient() {
  const [due, setDue] = useState<string[]>([]);
  const [info, setInfo] = useState<Record<string, QInfo>>({});

  useEffect(() => {
    const refresh = () => setDue(listDue());
    refresh();
    window.addEventListener("atesto-srs-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("atesto-srs-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // dotáhneme názvy z DB pro aktuální "due" slugs
  useEffect(() => {
    const slugs = due.slice(0, 80); // MVP limit
    if (slugs.length === 0) {
      setInfo({});
      return;
    }

    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/questions/batch", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slugs }),
        });
        const json = await res.json();
        if (!res.ok) return;

        const map: Record<string, QInfo> = {};
        for (const q of (json?.questions || []) as QInfo[]) {
          map[q.slug] = q;
        }
        if (alive) setInfo(map);
      } catch {
        // ticho – pořád ukážeme slug fallback
      }
    })();

    return () => {
      alive = false;
    };
  }, [due]);

  const count = due.length;

  const rawAll = useMemo(() => {
    try {
      const raw = window.localStorage.getItem(SRS_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }, [count]);

  if (count === 0) {
    return (
      <div className="atesto-card">
        <div className="atesto-card-inner">
          <div className="atesto-subtle">Nemáš nic “due”. Přidej si otázky do review v detailu otázky.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="atesto-card">
      <div className="atesto-card-inner atesto-stack">
        <div className="atesto-row" style={{ justifyContent: "space-between" }}>
          <div>
            <b>Due: {count}</b>
            <div className="atesto-subtle">Klikni na otázku → zopakuj → “Hotovo”</div>
          </div>
        </div>

        <div className="atesto-stack">
          {due.map((slug) => {
            const q = info[slug];
            const title = q?.title || slug;
            const topicLabel = q?.topic ? `${q.topic.order}. ${q.topic.title}` : "—";

            return (
              <div
                key={slug}
                className="atesto-qitem"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div>
                    <b>{title}</b>
                  </div>
                  <div className="atesto-subtle">
                    {topicLabel} • {q?.status || "—"} • {q?.updatedAt ? `upd: ${new Date(q.updatedAt).toLocaleDateString()}` : ""}
                  </div>
                  <div className="atesto-subtle">slug: {slug}</div>
                </div>

                <div className="atesto-row">
                  <Link className="atesto-btn" href={`/questions/${slug}`}>
                    Otevřít
                  </Link>
                  <button
                    className="atesto-btn atesto-btn-primary"
                    onClick={() => {
                      markReviewed(slug);
                      setDue(listDue());
                    }}
                  >
                    Hotovo
                  </button>
                  <button
                    className="atesto-btn atesto-btn-danger"
                    onClick={() => {
                      removeFromReview(slug);
                      setDue(listDue());
                    }}
                  >
                    Odebrat
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="atesto-subtle">
          Pozn.: Interval/due info je v localStorage. V další verzi doplníme i “hard/ok/easy”.
        </div>
      </div>
    </div>
  );
}
