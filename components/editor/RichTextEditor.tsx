"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid #444", borderRadius: 8 }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function MenuBar({ editor }: { editor: any }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: 8,
        borderBottom: "1px solid #444",
        flexWrap: "wrap",
      }}
    >
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italic
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </button>
      <button onClick={() => editor.chain().focus().setParagraph().run()}>
        P
      </button>
    </div>
  );
}