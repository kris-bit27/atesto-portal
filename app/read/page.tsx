import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReadPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      questions: {
        where: { status: "PUBLISHED" },
        orderBy: { title: "asc" },
        select: { slug: true, title: true, status: true, updatedAt: true },
      },
    },
  });

  const total = topics.reduce((acc, t) => acc + t.questions.length, 0);

  return (
    <main className="atesto-container atesto-stack">
      <div className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-row" style={{ justifyContent: "space-between" }}>
            <div>
              <h1 className="atesto-h1" style={{ margin: 0 }}>READ</h1>
              <div className="atesto-subtle">Jen PUBLISHED • celkem {total} otázek</div>
            </div>
            <div className="atesto-row">
              <Link className="atesto-btn" href="/">Home</Link>
              <Link className="atesto-btn" href="/review">Review</Link>
              <Link className="atesto-btn" href="/search">Search</Link>
            </div>
          </div>
        </div>
      </div>

      {topics.map((t) => (
        <div key={t.slug} className="atesto-card">
          <div className="atesto-card-inner atesto-stack">
            <div className="atesto-row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="atesto-row">
                  <span className="atesto-pill">{t.order}</span>
                  <strong>{t.title}</strong>
                </div>
                <div className="atesto-subtle">{t.slug} • {t.questions.length} otázek</div>
              </div>
              <Link className="atesto-btn atesto-btn-ghost" href={`/topics/${t.slug}`}>Téma →</Link>
            </div>

            {t.questions.length === 0 ? (
              <div className="atesto-subtle">Žádné PUBLISHED otázky.</div>
            ) : (
              <div className="atesto-qgrid">
                {t.questions.map((q) => (
                  <Link key={q.slug} className="atesto-qitem" href={`/questions/${q.slug}`}>
                    <div className="atesto-qitem-head">
                      <div className="atesto-qitem-title">{q.title}</div>
                      <span className="atesto-badge atesto-badge-ok">PUBLISHED</span>
                    </div>
                    <div className="atesto-qitem-sub">
                      <span className="atesto-subtle">{q.slug}</span>
                      <span className="atesto-subtle">upd: {new Date(q.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </main>
  );
}
