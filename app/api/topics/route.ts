import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const onlyPublished = url.searchParams.get("published") === "1";

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      questions: {
        where: onlyPublished ? { status: "PUBLISHED" } : undefined,
        orderBy: { title: "asc" },
        select: { slug: true, title: true, status: true },
      },
      _count: { select: { questions: true } },
    },
  });

  // Pozn.: read/review/progress držíš v localStorage (ne v DB) → sem to netahat.
  return NextResponse.json(topics);
}
