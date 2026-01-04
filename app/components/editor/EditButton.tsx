"use client";

import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  className?: string;
};

export default function EditButton({ slug, className }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => router.push(`/questions/${slug}`)}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,.25)",
        background: "rgba(255,255,255,.06)",
        cursor: "pointer",
      }}
    >
      ✏️ Edit
    </button>
  );
}
