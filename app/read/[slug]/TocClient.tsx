"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  html: string;
};

type Item = { id: string; text: string; level: number };

export default function TocClient({ html }: Props) {
  const items = useMemo<Item[]>(() => {
    if (!html) return [];
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const nodes = Array.from(doc.querySelectorAll("h1, h2, h3"));
      return nodes
        .map((n) => {
          const level = n.tagName === "H1" ? 1 : n.tagName === "H2" ? 2 : 3;
          const text = (n.textContent ?? "").trim();
          let id = (n.getAttribute("id") ?? "").trim();

          if (!id) {
            id = text
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w\-]+/g, "");
          }
          return { id, text, level };
        })
        .filter((x) => x.text.length > 0);
    } catch {
      return [];
    }
  }, [html]);

  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(items.length > 0);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <aside style={{ marginTop: 24, padding: 12, border: "1px solid rgba(255,255,255,.15)", borderRadius: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,.2)",
          background: "rgba(255,255,255,.05)",
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        {open ? "Skrýt obsah" : "Zobrazit obsah"}
      </button>

      {open && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((it) => (
            <li key={it.id} style={{ marginLeft: (it.level - 1) * 12, marginBottom: 6 }}>
              <a href={`#${it.id}`}>{it.text}</a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
