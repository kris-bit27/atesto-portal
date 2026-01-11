import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function okKey(req: Request) {
  const expected = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  if (!expected) return true; // lokální dev bez klíče
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  return key === expected;
}

export async function GET(req: Request) {
  if (!okKey(req)) return unauthorized();

  const questions = await prisma.question.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      topicId: true,
      title: true,
      slug: true,
      status: true,
      contentHtml: true,
      updatedAt: true,
      topic: { select: { id: true, title: true, slug: true, order: true } },
    },
  });

  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  if (!okKey(req)) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const topicId = typeof body.topicId === "string" ? body.topicId : "";
  const title = typeof body.title === "string" ? body.title : "";
  const slug = typeof body.slug === "string" ? body.slug : "";
  const status = typeof body.status === "string" ? body.status : "DRAFT";
  const contentHtml = typeof body.contentHtml === "string" ? body.contentHtml : "";

  if (!topicId || !title || !slug) {
    return NextResponse.json({ error: "Missing: topicId/title/slug" }, { status: 400 });
  }

  const created = await prisma.question.create({
    data: { topicId, title, slug, status: status as any, contentHtml },
    select: { id: true, topicId: true, title: true, slug: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, created });
}
