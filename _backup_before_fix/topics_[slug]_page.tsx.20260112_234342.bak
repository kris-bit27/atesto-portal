import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export default async function TopicPage({ params }: Params) {
  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      specialty: { select: { id: true, title: true, slug: true } },
      domain: { select: { id: true, title: true, slug: true } },
      questions: {
        orderBy: { title: "asc" },
        select: { slug: true, title: true, status: true, kind: true, source: true },
      },
    },
  });

  if (!topic) return notFound();

  return (
    <main className="atesto-container atesto-stack">
      <header className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div className="atesto-subtle" style={{ marginBottom: 6 }}>
                {topic.order} • <span className="atesto-subtle">{topic.slug}</span>
              </div>

              <h1 className="atesto-h1" style={{ margin: 0 }}>{topic.title}</h1>

              {/* MVP2: badges */}
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {topic.specialty ? (
                  <span className="atesto-badge atesto-badge-ok">Specialty: {topic.specialty.title}</span>
                ) : null}
                {topic.domain ? (
                  <span className="atesto-badge">Domain: {topic.domain.title}</span>
                ) : null}
              </div>
            </div>

            <Link className="atesto-btn atesto-btn-ghost" href="/">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <section className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          {(topic.questions || []).length === 0 ? (
            <div className="atesto-subtle">Zatím žádné otázky.</div>
          ) : (
            <div className="atesto-qgrid">
              {topic.questions.map((q) => (
                <Link key={q.slug} className="atesto-qitem" href={`/questions/${q.slug}`}>
                  <div className="atesto-qitem-head">
                    <div className="atesto-qitem-title">{q.title}</div>
                    <span className={q.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                      {q.status}
                    </span>
                  </div>
                  <div className="atesto-qitem-sub" style={{ gap: 10 }}>
                    <span className="atesto-subtle">{q.slug}</span>
                    <span className="atesto-subtle">{q.kind} • {q.source}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
