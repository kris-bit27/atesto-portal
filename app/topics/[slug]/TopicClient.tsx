"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const READ_KEY = "atesto_read_slugs";

function loadReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

type Question = {
  slug: string;
  title: string;
  status: string; // "DRAFT" | "PUBLISHED" ...
};

type Props = {
  questions: Question[];
  topicTitle: string;
};

export default function TopicClient({ questions, topicTitle }: Props) {
  const [query, setQuery] = useState("");
  const [onlyPublished, setOnlyPublished] = useState(true);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    // initial load
    setReadSet(loadReadSet());

    // aktualizace, když se změní localStorage (jiný tab) nebo když dispatchneme náš event
    const onUpdate = () => setReadSet(loadReadSet());

    window.addEventListener("atesto-read-updated", onUpdate as EventListener);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("atesto-read-updated", onUpdate as EventListener);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return questions.filter((item) => {
      if (onlyPublished && item.status !== "PUBLISHED") return false;
      if (q && !item.title.toLowerCase().includes(q)) return false;
      if (onlyUnread && readSet.has(item.slug)) return false;
      return true;
    });
  }, [questions, query, onlyPublished, onlyUnread, readSet]);

  const readCount = useMemo(() => {
    let c = 0;
    for (const item of questions) if (readSet.has(item.slug)) c++;
    return c;
  }, [questions, readSet]);

  return (
    <main style={{ display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>{topicTitle}</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Hledat otázku…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            minWidth: 260,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.04)",
          }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlyPublished}
            onChange={(e) => setOnlyPublished(e.target.checked)}
          />
          Jen PUBLISHED
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(e) => setOnlyUnread(e.target.checked)}
          />
          Jen NEPŘEČTENÉ
        </label>

        <div style={{ opacity: 0.75 }}>
          Přečteno: <b>{readCount}</b> / {questions.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ opacity: 0.8 }}>Žádné otázky (nebo skryté filtrem).</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((q) => {
            const isRead = readSet.has(q.slug);

            return (
              <div
                key={q.slug}
                style={{
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 700 }}>{q.title}</div>

                    {/* ✅ NOVĚ: badge "PŘEČTENO" v seznamu */}
                    {isRead && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,.22)",
                          opacity: 0.9,
                        }}
                      >
                        PŘEČTENO
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: 12,
                        padding: "3px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,.15)",
                        opacity: 0.85,
                      }}
                    >
                      {q.status}
                    </span>
                  </div>

                  <div style={{ opacity: 0.7, fontSize: 13 }}>/read/{q.slug}</div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Link
                    href={`/read/${q.slug}`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,.15)",
                      textDecoration: "none",
                    }}
                  >
                    Číst
                  </Link>

                  <Link
                    href={`/questions/${q.slug}`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,.15)",
                      textDecoration: "none",
                    }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
