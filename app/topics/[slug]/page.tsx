import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { slug: string } }) {
  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      slug: true,
      order: true,
      questions: {
        orderBy: { title: "asc" },
        select: { slug: true, title: true, status: true, updatedAt: true },
      },
    },
  });

  if (!topic) {
    return (
      <main className="atesto-container atesto-stack">
        <div className="atesto-card">
          <div className="atesto-card-inner">
            <b>Téma nenalezeno.</b>
            <div style={{ marginTop: 10 }}>
              <Link className="atesto-btn" href="/">← Zpět</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="atesto-container atesto-stack">
      <div className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-row" style={{ justifyContent: "space-between" }}>
            <div>
              <h1 className="atesto-h1" style={{ margin: 0 }}>
                <span className="atesto-pill" style={{ marginRight: 10 }}>{topic.order}</span>
                {topic.title}
              </h1>
              <div className="atesto-subtle">{topic.slug} • {topic.questions.length} otázek</div>
            </div>
            <Link className="atesto-btn" href="/">← Home</Link>
          </div>
        </div>
      </div>

      <div className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          {topic.questions.map((q) => (
            <Link key={q.slug} className="atesto-qitem" href={`/questions/${encodeURIComponent(q.slug)}`}>
              <div className="atesto-qitem-head">
                <div className="atesto-qitem-title">{q.title}</div>
                <span className={q.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                  {q.status}
                </span>
              </div>
              <div className="atesto-qitem-sub">
                <span className="atesto-subtle">{q.slug}</span>
                <span className="atesto-subtle">upd: {new Date(q.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
