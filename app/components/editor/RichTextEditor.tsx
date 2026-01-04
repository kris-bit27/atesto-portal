"use client";

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  value?: string;                  // HTML string
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
};

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Napiš odpověď…",
  editable = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value || "",
    editable,
    // ✅ KRITICKÉ pro Next.js App Router (hydration/SSR)
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Když se zvenku změní value (např. načtení z DB), synchronizuj obsah editoru
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) {
      // ✅ v některých verzích tiptapu setContent(next, false) hází TS chybu → použíj jen string
      editor.commands.setContent(next);
    }
  }, [editor, value]);

  if (!editor) {
    // během inicializace na klientu
    return (
      <div
        style={{
          padding: 12,
          border: "1px solid rgba(255,255,255,.2)",
          borderRadius: 12,
          opacity: 0.85,
        }}
      >
        Načítám editor…
      </div>
    );
  }

  // jednoduchý placeholder (bez extra extension) – zobrazí se jen když je prázdno
  const isEmpty = editor.getText().trim().length === 0;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div
        style={{
          position: "relative",
          border: "1px solid rgba(255,255,255,.2)",
          borderRadius: 12,
          padding: 10,
          minHeight: 160,
        }}
      >
        {isEmpty && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 12,
              opacity: 0.5,
              pointerEvents: "none",
            }}
          >
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      {!editable && (
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Režim pouze pro čtení
        </div>
      )}
    </div>
  );
}
