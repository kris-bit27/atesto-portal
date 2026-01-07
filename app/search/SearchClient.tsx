"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Result = {
  slug: string;
  title: string;
  status: string;
  updatedAt: string;
  topic: { slug: string; title: string; order: number } | null;
};

export default function SearchClient() {
  const [q, setQ] = useState("");
  const [publishedOnly, setPublishedOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);

  const qs = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    // debounce vyhledávání
    if (!qs) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const t = window.setTimeout(async () => {
      try {
        const url = `/api/search?q=${encodeURIComponent(qs)}&published=${publishedOnly ? "1" : "0"}&take=80`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(t);
  }, [qs, publishedOnly]);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>Vyhledávání</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/" style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }}>
              ← Zpět
            </Link>
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 14,
            padding: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledej v názvu, slugu i v obsahu (contentHtml)…"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "transparent",
              color: "inherit",
            }}
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={publishedOnly} onChange={(e) => setPublishedOnly(e.target.checked)} />
            Jen PUBLISHED
          </label>

          <div style={{ opacity: 0.85, fontSize: 13 }}>
            {loading ? "Hledám…" : qs ? `Nalezeno: ${results.length}` : "Zadej dotaz."}
            {error ? <span style={{ color: "salmon" }}> • Chyba: {error}</span> : null}
          </div>
        </div>
      </header>

      <section style={{ display: "grid", gap: 10 }}>
        {qs && !loading && results.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Nic nenalezeno.</div>
        ) : null}

        {results.map((r) => (
          <div
            key={r.slug}
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 14,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <strong>{r.title}</strong>
                <span style={{ opacity: 0.75, fontSize: 12 }}>{r.status}</span>
              </div>

              <div style={{ opacity: 0.7, fontSize: 12 }}>
                {r.topic ? (
                  <>
                    {r.topic.order}. {r.topic.title} • <span style={{ opacity: 0.8 }}>{r.topic.slug}</span>
                  </>
                ) : (
                  <span>Bez tématu</span>
                )}
                {" • "}
                <span style={{ opacity: 0.8 }}>{r.slug}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href={`/read/${r.slug}`}
                style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)" }}
              >
                Číst
              </Link>
              <Link
                href={`/questions/${r.slug}`}
                style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)" }}
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
