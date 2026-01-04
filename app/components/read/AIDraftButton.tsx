"use client";

import { useState } from "react";

export default function AIDraftButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);

  async function generateDraft() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI draft failed");
      window.location.href = `/editor?slug=${encodeURIComponent(slug)}`;
    } catch (e: any) {
      alert(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={generateDraft}
      disabled={busy}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.2)",
        opacity: busy ? 0.6 : 1,
        cursor: busy ? "not-allowed" : "pointer",
      }}
      title="Vygeneruje draft odpovědi a otevře editor"
    >
      {busy ? "Generuju…" : "AI Draft"}
    </button>
  );
}
