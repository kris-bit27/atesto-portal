import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/search?q=...&published=1&take=50
export async function GET(req: Request) {
  const url = new URL(req.url);

  const q = (url.searchParams.get("q") ?? "").trim();
  const publishedOnly = url.searchParams.get("published") === "1";
  const takeRaw = Number(url.searchParams.get("take") ?? "50");
  const take = Number.isFinite(takeRaw) ? Math.max(1, Math.min(200, takeRaw)) : 50;

  if (!q) {
    return NextResponse.json({ q: "", publishedOnly, results: [] });
  }

  const where: any = {
    ...(publishedOnly ? { status: "PUBLISHED" } : {}),
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { contentHtml: { contains: q, mode: "insensitive" } },
    ],
  };

  const results = await prisma.question.findMany({
    where,
    take,
    orderBy: { updatedAt: "desc" },
    select: {
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
      topic: { select: { slug: true, title: true, order: true } },
    },
  });

  return NextResponse.json({ q, publishedOnly, results });
}
