import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/topics
 * Optional query params:
 *  - published=1  -> počítá pouze otázky se status = "PUBLISHED"
 *
 * Vrací témata + agregace:
 *  - counts: { total, read, review }
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const publishedOnly = url.searchParams.get("published") === "1";

  const questionWhereBase = publishedOnly ? ({ status: "PUBLISHED" } as const) : undefined;

  // 1) Témata (pořadí + základní metadata)
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
    },
  });

  // 2) Agregace počtů po topicId (3 rychlé dotazy místo N+1)
  const [totalByTopic, readByTopic, reviewByTopic] = await Promise.all([
    prisma.question.groupBy({
      by: ["topicId"],
      where: questionWhereBase,
      _count: { _all: true },
    }),
    prisma.question.groupBy({
      by: ["topicId"],
      where: { ...(questionWhereBase ?? {}), isRead: true },
      _count: { _all: true },
    }),
    prisma.question.groupBy({
      by: ["topicId"],
      where: { ...(questionWhereBase ?? {}), needsReview: true },
      _count: { _all: true },
    }),
  ]);

  // 3) Převod do map pro O(1) lookup
  const totalMap = new Map(totalByTopic.map((r) => [r.topicId, r._count._all]));
  const readMap = new Map(readByTopic.map((r) => [r.topicId, r._count._all]));
  const reviewMap = new Map(reviewByTopic.map((r) => [r.topicId, r._count._all]));

  // 4) Výstup pro UI
  const payload = topics.map((t) => {
    const total = totalMap.get(t.id) ?? 0;
    const read = readMap.get(t.id) ?? 0;
    const review = reviewMap.get(t.id) ?? 0;

    return {
      ...t,
      counts: { total, read, review },
    };
  });

  return NextResponse.json(payload);
}
