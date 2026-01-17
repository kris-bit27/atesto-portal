"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TiptapEditor from "@/app/admin/components/TiptapEditor";

type Topic = { id: string; title: string; slug: string; order: number; _count?: { questions: number } };
type Question = {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  status: string;
  contentHtml: string;
  updatedAt: string;
  topic?: { id: string; title: string; slug: string; order: number };
};

export default function AdminClient() {
  const [key, setKey] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const p = new URLSearchParams(window.location.search);
      setKey(p.get("key") || "");
    } catch {
      setKey("");
    }
  }, []);

  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // create forms
  const [newTopic, setNewTopic] = useState({ title: "", slug: "", order: 0 });
  const [newQ, setNewQ] = useState({ topicId: "", title: "", slug: "", status: "DRAFT" });
  const [filterTopicId, setFilterTopicId] = useState<string>("");

  // selected question (single editor)
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(() => questions.find((q) => q.id === selectedId) || null, [questions, selectedId]);

  const [draft, setDraft] = useState<{
    id: string;
    topicId: string;
    title: string;
    slug: string;
    status: string;
    contentHtml: string;
  } | null>(null);

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    setDraft({
      id: selected.id,
      topicId: selected.topicId,
      title: selected.title,
      slug: selected.slug,
      status: selected.status,
      contentHtml: selected.contentHtml || "",
    });
  }, [selectedId, selected?.id]);

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
    setLoading(true);
    setErr("");
    try {
      const t = await api<{ topics: Topic[] }>("/api/admin/topics");
      setTopics(t.topics || []);
      const q = await api<{ questions: Question[] }>("/api/admin/questions");
      setQuestions(q.questions || []);
    } catch (e: any) {
      setErr(e?.message || "Chyba");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!key) setErr("Chybí ?key=... (např. /admin?key=TVŮJ_KLÍČ)");
    else loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const topicsById = useMemo(() => new Map(topics.map((t) => [t.id, t])), [topics]);

  const filteredQuestions = useMemo(() => {
    if (!filterTopicId) return questions;
    return questions.filter((q) => q.topicId === filterTopicId);
  }, [questions, filterTopicId]);

  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-header">
        <div className="atesto-header-left">
          <h1 className="atesto-h1">Admin</h1>
          <div className="atesto-subtle">{mounted ? (key ? "key: OK" : "key: MISSING") : ""}</div>
        </div>

        <div className="atesto-header-actions">
          <Link className="atesto-btn atesto-btn-ghost" href="/">
            ← Zpět
          </Link>
          <button className="atesto-btn" onClick={loadAll} disabled={loading}>
            Reload
          </button>
        </div>
      </header>

      {err ? (
        <div className="atesto-alert atesto-alert-error">
          <b>Chyba:</b> {err}
        </div>
      ) : null}

      {/* TOPICS */}
      <section className="atesto-card">
        <div className="atesto-card-head">
          <h2 className="atesto-h2">Témata ({topics.length})</h2>
        </div>

        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-grid atesto-grid-topics">
            <input
              className="atesto-input"
              placeholder="title"
              value={newTopic.title}
              onChange={(e) => setNewTopic((s) => ({ ...s, title: e.target.value }))}
            />
            <input
              className="atesto-input"
              placeholder="slug"
              value={newTopic.slug}
              onChange={(e) => setNewTopic((s) => ({ ...s, slug: e.target.value }))}
            />
            <input
              className="atesto-input"
              placeholder="order"
              type="number"
              value={newTopic.order}
              onChange={(e) => setNewTopic((s) => ({ ...s, order: Number(e.target.value || 0) }))}
            />
            <button
              className="atesto-btn atesto-btn-primary"
              disabled={loading}
              onClick={async () => {
                try {
                  await api("/api/admin/topics", { method: "POST", body: JSON.stringify(newTopic) });
                  setNewTopic({ title: "", slug: "", order: 0 });
                  await loadAll();
                } catch (e: any) {
                  setErr(e?.message || "Chyba");
                }
              }}
            >
              + Přidat téma
            </button>
          </div>

          <div className="atesto-stack">
            {topics.map((t) => (
              <TopicRow key={t.id} t={t} loading={loading} api={api} onDone={loadAll} onError={setErr} />
            ))}
          </div>
        </div>
      </section>

      {/* QUESTIONS: create */}
      <section className="atesto-card">
        <div className="atesto-card-head">
          <h2 className="atesto-h2">Otázky ({questions.length})</h2>
        </div>

        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-grid atesto-grid-questions">
            <select
              className="atesto-input"
              value={filterTopicId}
              onChange={(e) => setFilterTopicId(e.target.value)}
            >
              <option value="">Všechny</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.order}. {t.title}
                </option>
              ))}
            </select>

            <input
              className="atesto-input"
              placeholder="title"
              value={newQ.title}
              onChange={(e) => setNewQ((s) => ({ ...s, title: e.target.value }))}
            />
            <input
              className="atesto-input"
              placeholder="slug"
              value={newQ.slug}
              onChange={(e) => setNewQ((s) => ({ ...s, slug: e.target.value }))}
            />
            <select
              className="atesto-input"
              value={newQ.status}
              onChange={(e) => setNewQ((s) => ({ ...s, status: e.target.value }))}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>

            <button
              className="atesto-btn atesto-btn-primary"
              disabled={loading}
              onClick={async () => {
                try {
                  await api("/api/admin/questions", { method: "POST", body: JSON.stringify({ ...newQ, contentHtml: "" }) });
                  setNewQ({ topicId: "", title: "", slug: "", status: "DRAFT" });
                  await loadAll();
                } catch (e: any) {
                  setErr(e?.message || "Chyba");
                }
              }}
            >
              + Přidat otázku
            </button>
          </div>

          {/* SINGLE EDITOR PANEL */}
          {draft ? (
            <div className="atesto-card" style={{ boxShadow: "none" }}>
              <div className="atesto-card-inner atesto-stack">
                <div className="atesto-row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <b>Editace otázky</b>
                    <div className="atesto-subtle">
                      {topicsById.get(draft.topicId)?.title || ""} • id: {draft.id}
                    </div>
                  </div>
                  <div className="atesto-row">
                    <button className="atesto-btn atesto-btn-ghost" onClick={() => setSelectedId("")}>
                      Zavřít
                    </button>
                    <button
                      className="atesto-btn atesto-btn-primary"
                      disabled={loading}
                      onClick={async () => {
                        try {
                          await api(`/api/admin/questions/${draft.id}`, { method: "PATCH", body: JSON.stringify(draft) });
                          await loadAll();
                        } catch (e: any) {
                          setErr(e?.message || "Chyba");
                        }
                      }}
                    >
                      Uložit
                    </button>
                  </div>
                </div>

                <div className="atesto-grid atesto-grid-qrow">
                  <select
                    className="atesto-input"
                    value={draft.topicId}
                    onChange={(e) => setDraft((s) => (s ? { ...s, topicId: e.target.value } : s))}
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.order}. {t.title}
                      </option>
                    ))}
                  </select>

                  <input
                    className="atesto-input"
                    value={draft.title}
                    onChange={(e) => setDraft((s) => (s ? { ...s, title: e.target.value } : s))}
                  />

                  <input
                    className="atesto-input"
                    value={draft.slug}
                    onChange={(e) => setDraft((s) => (s ? { ...s, slug: e.target.value } : s))}
                  />

                  <select
                    className="atesto-input"
                    value={draft.status}
                    onChange={(e) => setDraft((s) => (s ? { ...s, status: e.target.value } : s))}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>

                <TiptapEditor
                  value={draft.contentHtml}
                  onChange={(html) => setDraft((s) => (s ? { ...s, contentHtml: html } : s))}
                  placeholder="Piš obsah… (TipTap)"
                />
              </div>
            </div>
          ) : (
            <div className="atesto-subtle">Klikni na „Edit“ u otázky pro otevření editoru.</div>
          )}

          {/* QUESTIONS LIST (collapsed) */}
          <div className="atesto-card" style={{ boxShadow: "none" }}>
            <div className="atesto-card-inner atesto-stack">
              <div className="atesto-subtle">Seznam otázek (klikni Edit → otevře se editor nahoře)</div>

              <div className="atesto-stack">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="atesto-qitem" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <b>{q.title}</b>
                        <span className={q.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                          {q.status}
                        </span>
                      </div>
                      <div className="atesto-subtle">
                        {topicsById.get(q.topicId)?.title || q.topic?.title || "—"} • slug: {q.slug}
                      </div>
                    </div>

                    <div className="atesto-row">
                      <Link className="atesto-btn atesto-btn-ghost" href={`/questions/${encodeURIComponent(q.slug)}`}>
                        Otevřít
                      </Link>

                      <button
                        className="atesto-btn"
                        onClick={() => setSelectedId(q.id)}
                        disabled={loading}
                        title="Otevřít editor"
                      >
                        Edit
                      </button>

                      <button
                        className="atesto-btn atesto-btn-danger"
                        disabled={loading}
                        onClick={async () => {
                          try {
                            if (!confirm("Smazat otázku?")) return;
                            await api(`/api/admin/questions/${q.id}`, { method: "DELETE" });
                            if (selectedId === q.id) setSelectedId("");
                            await loadAll();
                          } catch (e: any) {
                            setErr(e?.message || "Chyba");
                          }
                        }}
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {questions.length === 0 ? <div className="atesto-subtle">Žádné otázky.</div> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TopicRow({
  t,
  api,
  onDone,
  loading,
  onError,
}: {
  t: Topic;
  api: any;
  onDone: () => Promise<void>;
  loading: boolean;
  onError: (msg: string) => void;
}) {
  const [draft, setDraft] = useState({ title: t.title, slug: t.slug, order: t.order });
  const [saving, setSaving] = useState(false);

  return (
    <div className="atesto-card-inner">
      <div className="atesto-grid atesto-grid-topics-row">
        <input className="atesto-input" value={draft.title} onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))} />
        <input className="atesto-input" value={draft.slug} onChange={(e) => setDraft((s) => ({ ...s, slug: e.target.value }))} />
        <input className="atesto-input" type="number" value={draft.order} onChange={(e) => setDraft((s) => ({ ...s, order: Number(e.target.value || 0) }))} />

        <div className="atesto-row-right">
          <span className="atesto-subtle">Q: {t._count?.questions ?? "?"}</span>

          <button
            className="atesto-btn"
            disabled={loading || saving}
            onClick={async () => {
              try {
                setSaving(true);
                await api(`/api/admin/topics/${t.id}`, { method: "PATCH", body: JSON.stringify(draft) });
                await onDone();
              } catch (e: any) {
                onError(e?.message || "Chyba");
              } finally {
                setSaving(false);
              }
            }}
          >
            Uložit
          </button>

          <button
            className="atesto-btn atesto-btn-danger"
            disabled={loading || saving}
            onClick={async () => {
              try {
                if (!confirm("Smazat téma? (musí být bez otázek)")) return;
                setSaving(true);
                await api(`/api/admin/topics/${t.id}`, { method: "DELETE" });
                await onDone();
              } catch (e: any) {
                onError(e?.message || "Chyba");
              } finally {
                setSaving(false);
              }
            }}
          >
            Smazat
          </button>
        </div>
      </div>

      <div className="atesto-subtle">id: {t.id}</div>
    </div>
  );
}
