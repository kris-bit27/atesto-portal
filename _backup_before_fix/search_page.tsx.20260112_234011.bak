import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q || "").trim();
  const qLower = q.toLowerCase();

  const results =
    q.length < 2
      ? []
      : await prisma.question.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { contentHtml: { contains: qLower, mode: "insensitive" } },
            ],
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
          select: {
            slug: true,
            title: true,
            status: true,
            updatedAt: true,
            topic: { select: { order: true, title: true, slug: true } },
          },
        });

  return (
    <main className="atesto-container atesto-stack">
      <div className="atesto-card">
        <div className="atesto-card-inner atesto-stack">
          <div className="atesto-row" style={{ justifyContent: "space-between" }}>
            <div>
              <h1 className="atesto-h1" style={{ margin: 0 }}>SEARCH</h1>
              <div className="atesto-subtle">Globální vyhledávání v otázkách (title/slug/obsah)</div>
            </div>
            <div className="atesto-row">
              <Link className="atesto-btn" href="/">Home</Link>
              <Link className="atesto-btn" href="/read">Read</Link>
              <Link className="atesto-btn" href="/review">Review</Link>
            </div>
          </div>

          <form className="atesto-row" action="/search" style={{ width: "100%" }}>
            <input className="atesto-input" name="q" defaultValue={q} placeholder="Zadej min. 2 znaky… (např. flap, jizvy, turniket)" />
            <button className="atesto-btn atesto-btn-primary" type="submit">Hledat</button>
          </form>

          {q.length < 2 ? (
            <div className="atesto-subtle">Zadej alespoň 2 znaky.</div>
          ) : (
            <div className="atesto-subtle">Nalezeno: {results.length}</div>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="atesto-card">
          <div className="atesto-card-inner atesto-stack">
            {results.map((r) => (
              <Link key={r.slug} className="atesto-qitem" href={`/questions/${r.slug}`}>
                <div className="atesto-qitem-head">
                  <div className="atesto-qitem-title">{r.title}</div>
                  <span className={r.status === "PUBLISHED" ? "atesto-badge atesto-badge-ok" : "atesto-badge"}>
                    {r.status}
                  </span>
                </div>
                <div className="atesto-qitem-sub">
                  <span className="atesto-subtle">{r.topic ? `${r.topic.order}. ${r.topic.title}` : "—"}</span>
                  <span className="atesto-subtle">upd: {new Date(r.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
