import prisma from "@/lib/prisma";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const [questions, specialties, domains] = await Promise.all([
    prisma.question.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        slug: true,
        title: true,
        status: true,
        specialtyId: true,
        topic: { select: { slug: true, title: true } },
      },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
    prisma.domain.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
  ]);

  // domainId je zatím na Topic — tak ho doplníme do každé otázky přes mapu topicSlug->domainId
  const topics = await prisma.topic.findMany({ select: { slug: true, domainId: true } });
  const domainByTopicSlug = new Map<string, string | null>();
  for (const t of topics) domainByTopicSlug.set(t.slug, t.domainId ?? null);

  const enriched = questions.map((q) => ({
    ...q,
    domainId: q.topic?.slug ? domainByTopicSlug.get(q.topic.slug) ?? null : null,
  }));

  return <SearchClient questions={enriched as any} specialties={specialties as any} domains={domains as any} />;
}
