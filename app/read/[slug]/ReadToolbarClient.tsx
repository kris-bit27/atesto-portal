"use client";

import Link from "next/link";
import AIDraftButton from "@/app/components/read/AIDraftButton";

type Item = {
  slug: string;
  title: string;
  status: string;
} | null;

type Props = {
  prev: Item;
  next: Item;
  topicSlug: string;
  currentSlug: string;
};

export default function ReadToolbarClient({
  prev,
  next,
  topicSlug,
  currentSlug,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 12,
      }}
    >
      {/* LEFT */}
      <div style={{ flex: 1 }}>
        {prev ? (
          <Link href={`/read/${prev.slug}`}>← {prev.title}</Link>
        ) : (
          <span style={{ opacity: 0.5 }}>← Předchozí</span>
        )}
      </div>

      {/* CENTER */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href={`/topics/${topicSlug}`}>Zpět na seznam témat</Link>

        <AIDraftButton slug={currentSlug} />
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, textAlign: "right" }}>
        {next ? (
          <Link href={`/read/${next.slug}`}>{next.title} →</Link>
        ) : (
          <span style={{ opacity: 0.5 }}>Další →</span>
        )}
      </div>
    </div>
  );
}
