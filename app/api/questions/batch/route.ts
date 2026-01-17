import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slugs = Array.isArray(body?.slugs) ? body.slugs.filter((x: any) => typeof x === "string") : [];

  if (slugs.length === 0) return NextResponse.json({ questions: [] });

  const rows = await prisma.question.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
      topic: { select: { order: true, title: true, slug: true } },
    },
  });

  return NextResponse.json({ questions: rows });
}
