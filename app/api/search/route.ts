import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/search?q=...&published=1&take=300&cursor=...&specialtyId=...
export async function GET(req: Request) {
  const url = new URL(req.url);

  const q = (url.searchParams.get("q") ?? "").trim();
  const publishedOnly = url.searchParams.get("published") === "1";
  const specialtyId = (url.searchParams.get("specialtyId") ?? "").trim();
  const categoryId = (url.searchParams.get("categoryId") ?? "").trim();
  const subcategoryId = (url.searchParams.get("subcategoryId") ?? "").trim();
  const cursor = (url.searchParams.get("cursor") ?? "").trim();
  const takeRaw = Number(url.searchParams.get("take") ?? "300");
  const take = Number.isFinite(takeRaw) ? Math.max(1, Math.min(500, takeRaw)) : 300;

  const where: any = {
    ...(publishedOnly ? { status: "PUBLISHED" } : {}),
    ...(specialtyId ? { specialtyId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(subcategoryId ? { subcategoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { contentHtml: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.question.findMany({
    where,
    take,
    ...(cursor ? { cursor: { slug: cursor }, skip: 1 } : {}),
    orderBy: [{ updatedAt: "desc" }, { slug: "asc" }],
    select: {
      slug: true,
      title: true,
      status: true,
      specialtyId: true,
      categoryId: true,
      subcategoryId: true,
      topic: { select: { slug: true, title: true } },
    },
  });

  const nextCursor = items.length > 0 ? items[items.length - 1].slug : null;
  return NextResponse.json({ items, nextCursor });
}
