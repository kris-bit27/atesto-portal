"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function TiptapEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: {
        class: "atesto-editor",
        "data-placeholder": placeholder || "",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync když se hodnota změní zvenku (např. reload)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next) editor.commands.setContent(next, false);
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="atesto-card">
        <div className="atesto-card-inner atesto-subtle">Načítám editor…</div>
      </div>
    );
  }

  return (
    <div className="atesto-card">
      <div className="atesto-toolbar">
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          HR
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </button>
        <button type="button" className="atesto-chip" onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </button>
      </div>

      <div className="atesto-card-inner">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
