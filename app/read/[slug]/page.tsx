import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReadClient from "@/app/read/[slug]/ReadClient";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export default async function ReadPage({ params }: Params) {
  const q = await prisma.question.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      title: true,
      status: true,
      contentHtml: true,
      updatedAt: true,
      topic: { select: { slug: true, title: true, order: true } },
    },
  });

  if (!q) {
    return (
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        <h1>Not found</h1>
        <Link href="/" style={{ opacity: 0.85 }}>← Zpět</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, display: "grid", gap: 12 }}>
      <header style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <h1 style={{ margin: 0 }}>{q.title}</h1>
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              {q.topic ? (
                <>
                  {q.topic.order}. {q.topic.title} • <span style={{ opacity: 0.8 }}>{q.topic.slug}</span>
                </>
              ) : (
                <span>Bez tématu</span>
              )}
              {" • "}
              <span style={{ opacity: 0.8 }}>{q.slug}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.2)",
                opacity: 0.9,
              }}
            >
              {q.status}
            </span>

            <Link
              href="/"
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }}
            >
              ← Domů
            </Link>

            <Link
              href={`/questions/${q.slug}`}
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }}
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Client actions (Read / Review) */}
        <ReadClient slug={q.slug} />
      </header>

      <article
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 16,
          padding: 14,
          lineHeight: 1.55,
        }}
      >
        {q.contentHtml ? (
          <div dangerouslySetInnerHTML={{ __html: q.contentHtml }} />
        ) : (
          <div style={{ opacity: 0.7 }}>Zatím bez obsahu.</div>
        )}
      </article>
    </main>
  );
}
