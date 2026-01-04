import Link from "next/link";
import prisma from "@/lib/prisma";
import TopicClient from "./TopicClient";

export const dynamic = "force-dynamic";

type PageProps = { params: { slug: string } };

export default async function TopicPage({ params }: PageProps) {
  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      title: true,
      order: true,
      questions: {
        orderBy: { createdAt: "asc" },
        select: { slug: true, title: true, status: true },
      },
    },
  });

  if (!topic) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Téma nenalezeno</h1>
        <p>Slug: {params.slug}</p>
        <Link href="/">← Zpět</Link>
      </main>
    );
  }

  return (
    <main style={{ display: "grid", gap: 12 }}>
      <nav style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ opacity: 0.9 }}>
          ← Témata
        </Link>
        <span style={{ opacity: 0.5 }}>/</span>
        <span style={{ opacity: 0.9 }}>
          {topic.order}. {topic.title}
        </span>
      </nav>

      {/* Client část: filtry + progress + seznam */}
      <TopicClient questions={topic.questions} topicTitle={`${topic.order}. ${topic.title}`} />
    </main>
  );
}
