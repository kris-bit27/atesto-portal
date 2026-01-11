"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TiptapEditor from "@/app/admin/components/TiptapEditor";

type Topic = { id: string; title: string; slug: string; order: number };
type Question = {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  status: string;
  contentHtml: string;
  updatedAt: string;
  topic?: Topic;
};

function readKeyFromUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get("key") || "";
  } catch {
    return "";
  }
}

function readIdFromPath(): string {
  if (typeof window === "undefined") return "";
  // /admin/questions/<id>
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export default function EditQuestionClient() {
  const [key, setKey] = useState("");
  const [id, setId] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [topics, setTopics] = useState<Topic[]>([]);
  const [q, setQ] = useState<Question | null>(null);

  const [draft, setDraft] = useState({
    topicId: "",
    title: "",
    slug: "",
    status: "DRAFT",
    contentHtml: "",
  });

  useEffect(() => {
    setKey(readKeyFromUrl());
    setId(readIdFromPath());
  }, []);

  async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = path.includes("?") ? `${path}&key=${encodeURIComponent(key)}` : `${path}?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data as T;
  }

  async function loadAll() {
    if (!key) {
      setErr("Chybí ?key=... (např. /admin/questions/ID?key=TVŮJ_KLÍČ)");
      return;
    }
    if (!id) {
      setErr("Chybí ID v URL: /admin/questions/<ID>?key=...");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const t = await api<{ topics: Topic[] }>("/api/admin/topics");
      setTopics(t.topics || []);

      const res = await api<{ question: Question }>(`/api/admin/questions/${encodeURIComponent(id)}`);
      setQ(res.question);

      setDraft({
        topicId: res.question.topicId,
        title: res.question.title || "",
        slug: res.question.slug || "",
        status: res.question.status || "DRAFT",
        contentHtml: res.question.contentHtml || "",
      });
    } catch (e: any) {
      setErr(e?.message || "Chyba");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (key && id) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, id]);

  const topicName = useMemo(() => {
    const t = topics.find((x) => x.id === draft.topicId);
    return t ? `${t.order}. ${t.title}` : "";
  }, [topics, draft.topicId]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <h1 style={{ margin: 0 }}>Edit otázky</h1>
          <div style={{ opacity: 0.65, fontSize: 12 }}>
            ID: <code>{id}</code> {topicName ? <> • Téma: <b>{topicName}</b></> : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href={`/admin?key=${encodeURIComponent(key)}`}
            style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)" }}
          >
            ← Zpět do adminu
          </Link>
          <button
            onClick={loadAll}
            disabled={loading}
            style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "inherit" }}
          >
            Reload
          </button>
          <button
            disabled={loading || !q}
            onClick={async () => {
              setLoading(true);
              setErr("");
              try {
                await api(`/api/admin/questions/${encodeURIComponent(id)}`, {
                  method: "PATCH",
                  body: JSON.stringify(draft),
                });
                await loadAll();
              } catch (e: any) {
                setErr(e?.message || "Chyba");
              } finally {
                setLoading(false);
              }
            }}
            style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.06)", color: "inherit" }}
          >
            Uložit
          </button>
        </div>
      </header>

      {err ? (
        <div style={{ border: "1px solid rgba(255,80,80,.5)", borderRadius: 14, padding: 12 }}>
          <b>Chyba:</b> {err}
        </div>
      ) : null}

      <section style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: 12, display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 1fr 180px", gap: 8 }}>
          <select
            value={draft.topicId}
            onChange={(e) => setDraft((s) => ({ ...s, topicId: e.target.value }))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "inherit" }}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.order}. {t.title}
              </option>
            ))}
          </select>

          <input
            value={draft.title}
            onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))}
            placeholder="title"
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "inherit" }}
          />

          <input
            value={draft.slug}
            onChange={(e) => setDraft((s) => ({ ...s, slug: e.target.value }))}
            placeholder="slug"
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "inherit" }}
          />

          <select
            value={draft.status}
            onChange={(e) => setDraft((s) => ({ ...s, status: e.target.value }))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "inherit" }}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>

        <div style={{ opacity: 0.65, fontSize: 12 }}>
          Poslední update v DB: {q ? new Date(q.updatedAt).toLocaleString() : "—"}
        </div>
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: 12, display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Obsah</h2>
        <TiptapEditor
          value={draft.contentHtml}
          onChange={(html) => setDraft((s) => ({ ...s, contentHtml: html }))}
          placeholder="Piš obsah… (TipTap)"
        />
      </section>
    </main>
  );
}
