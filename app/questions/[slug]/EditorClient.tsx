"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Použijeme tvůj editor (už vyřešený SSR)
import RichTextEditor from "@/app/components/editor/RichTextEditorClientOnly";

type Props = {
  slug: string;
  initialTitle: string;
  initialStatus: string;
  initialHtml: string;
};

export default function EditorClient({ slug, initialTitle, initialStatus, initialHtml }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState(initialStatus || "DRAFT");
  const [html, setHtml] = useState(initialHtml || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    setTitle(initialTitle);
    setStatus(initialStatus || "DRAFT");
    setHtml(initialHtml || "");
  }, [initialTitle, initialStatus, initialHtml]);

  async function save(next?: { publish?: boolean }) {
    setSaving(true);
    setMsg("");
    try {
      const nextStatus =
        next?.publish === true ? "PUBLISHED" :
        next?.publish === false ? "DRAFT" :
        status;

      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          status: nextStatus,
          content: html,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Save failed");
      }

      setStatus(nextStatus);
      setMsg("✅ Uloženo");
    } catch (e: any) {
      setMsg("❌ " + (e?.message || "Chyba ukládání"));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2500);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Link href={`/read/${slug}`} style={{ textDecoration: "underline" }}>
          ← Zpět na čtení
        </Link>
        <span style={{ opacity: 0.8 }}>Slug: <b>{slug}</b></span>
        <span style={{ opacity: 0.8 }}>Status: <b>{status}</b></span>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ opacity: 0.8 }}>Název</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.06)",
              color: "inherit",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.08)",
              cursor: "pointer",
            }}
          >
            {saving ? "Ukládám..." : "💾 Uložit"}
          </button>

          <button
            type="button"
            onClick={() => save({ publish: true })}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(80,200,120,.20)",
              cursor: "pointer",
            }}
          >
            ✅ Publish
          </button>

          <button
            type="button"
            onClick={() => save({ publish: false })}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(255,180,80,.20)",
              cursor: "pointer",
            }}
          >
            🟡 Draft
          </button>

          <span style={{ alignSelf: "center", opacity: 0.9 }}>{msg}</span>
        </div>

        <div style={{ marginTop: 6 }}>
          <RichTextEditor
            value={html}
            onChange={(nextHtml) => setHtml(nextHtml)}
            placeholder="Napiš odpověď…"
            editable={true}
          />
        </div>
      </div>
    </main>
  );
}
