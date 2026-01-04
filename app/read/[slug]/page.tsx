// app/read/[slug]/page.tsx
import Link from "next/link";
import prisma from "@/lib/prisma";

import ReadToolbarClient from "./ReadToolbarClient";
import TocClient from "./TocClient";
import ReadProgressClient from "@/app/components/read/ReadProgressClient";
import EditButton from "@/app/components/editor/EditButton";

export const dynamic = "force-dynamic";

type PageProps = { params: { slug: string } };
type ListItem = { slug: string; title: string; status: string };

export default async function ReadQuestionPage({ params }: PageProps) {
  // 1) Question (bez topic relace – jen topicId)
  const q = await prisma.question.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      topicId: true,
      contentHtml: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  if (!q) {
    return (
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
        <h1>Otázka nenalezena</h1>
        <p>Slug: {params.slug}</p>
        <Link href="/">← Zpět na témata</Link>
      </main>
    );
  }

  // 2) Topic přes topicId
  const topic = await prisma.topic.findUnique({
    where: { id: q.topicId },
    select: {
      title: true,
      slug: true,
      order: true,
      questions: {
        orderBy: { createdAt: "asc" },
        select: { slug: true, title: true, status: true, createdAt: true },
      },
    },
  });

  if (!topic) {
    return (
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
        <h1>Téma nenalezeno</h1>
        <p>Otázka: {q.title}</p>
        <Link href="/">← Zpět na témata</Link>
      </main>
    );
  }

  // Prev/Next (jen published)
  const publishedOnly = true;
  const list: ListItem[] = (topic.questions ?? []).filter((x: ListItem) =>
    publishedOnly ? x.status === "PUBLISHED" : true
  );

  const idx = list.findIndex((x) => x.slug === q.slug);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  const html = q.contentHtml ?? "";

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <header style={{ marginBottom: 12 }}>
        <nav style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/">Témata</Link>
          <span style={{ opacity: 0.6 }}>›</span>
          <Link href={`/topics/${topic.slug}`}>
            {topic.order}. {topic.title}
          </Link>
        </nav>

        <div style={{ marginTop: 12 }}>
          <ReadToolbarClient currentSlug={q.slug} prev={prev} next={next} topicSlug={topic.slug} />
        </div>

        {/* Title + EDIT button (client) */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>{q.title}</h1>
          <EditButton slug={q.slug} />
        </div>

        <div style={{ marginTop: 8 }}>
          <ReadProgressClient slug={q.slug} />
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.05)",
              fontSize: 12,
            }}
          >
            Status: {q.status}
          </span>
          <span style={{ opacity: 0.75, fontSize: 12 }}>
            Aktualizace: {new Date(q.updatedAt ?? q.createdAt).toLocaleString()}
          </span>
        </div>
      </header>

      <article style={{ marginTop: 24 }} dangerouslySetInnerHTML={{ __html: html }} />

      <TocClient html={html} />
    </main>
  );
}
