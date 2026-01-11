"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TiptapEditor from "@/app/admin/components/TiptapEditor";

type Q = {
  id: string;
  topicId: string;
  slug: string;
  title: string;
  status: string;
  contentHtml: string;
  updatedAt: string;
};

export default function QuestionEditClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [q, setQ] = useState<Q | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/admin/questions/${encodeURIComponent(id)}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Load failed");
        if (!alive) return;
        setQ(json);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Load failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const canSave = useMemo(() => !!q && !saving && !loading, [q, saving, loading]);

  async function save() {
    if (!q) return;
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const res = await fetch(`/api/admin/questions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: q.title,
          status: q.status,
          contentHtml: q.contentHtml,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Save failed");
      setOk("Uloženo ✅");
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24, maxWidth: 980, margin: "0 auto", display: "grid", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin – Edit otázky</h1>
        <div style={{ opacity: 0.7 }}>Načítám…</div>
      </main>
    );
  }

  if (err) {
    return (
      <main style={{ padding: 24, maxWidth: 980, margin: "0 auto", display: "grid", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin – Edit otázky</h1>
        <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,80,80,.35)", color: "#ffb3b3" }}>
          Chyba: {err}
        </div>
        <Link href="/admin" style={{ opacity: 0.9 }}>
          ← zpět do adminu
        </Link>
      </main>
    );
  }

  if (!q) return null;

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto", display: "grid", gap: 14 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <h1 style={{ margin: 0 }}>Edit: {q.title}</h1>
          <div style={{ opacity: 0.7, fontSize: 12 }}>
            id: {q.id} • slug: {q.slug} • topicId: {q.topicId}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/admin" style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)" }}>
            ← Admin
          </Link>
          <button
            onClick={save}
            disabled={!canSave}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.25)",
              background: canSave ? "rgba(255,255,255,.08)" : "transparent",
              color: "inherit",
              cursor: canSave ? "pointer" : "not-allowed",
              opacity: canSave ? 1 : 0.6,
            }}
          >
            {saving ? "Ukládám…" : "Uložit"}
          </button>
        </div>
      </header>

      {ok ? (
        <div style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(120,255,120,.25)", color: "#b9ffb9" }}>
          {ok}
        </div>
      ) : null}

      {err ? (
        <div style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(255,80,80,.35)", color: "#ffb3b3" }}>
          {err}
        </div>
      ) : null}

      <section style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ opacity: 0.85 }}>Název</div>
          <input
            value={q.title}
            onChange={(e) => setQ({ ...q, title: e.target.value })}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.2)",
              background: "transparent",
              color: "inherit",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ opacity: 0.85 }}>Status</div>
          <select
            value={q.status}
            onChange={(e) => setQ({ ...q, status: e.target.value })}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.2)",
              background: "transparent",
              color: "inherit",
            }}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </label>
      </section>

      <section style={{ display: "grid", gap: 10 }}>
        <div style={{ opacity: 0.85 }}>Obsah</div>
        <TiptapEditor
          value={q.contentHtml || ""}
          onChange={(html) => setQ({ ...q, contentHtml: html })}
          placeholder="Začni psát obsah…"
        />
      </section>
    </main>
  );
}
