import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));

  const topicSlug = typeof body.topicSlug === "string" ? body.topicSlug.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  if (!topicSlug || !title || !slug) {
    return NextResponse.json({ error: "Missing topicSlug/title/slug" }, { status: 400 });
  }

  try {
    const exists = await prisma.question.findFirst({ where: { slug }, select: { id: true } });
    if (exists) return NextResponse.json({ error: "slug již existuje" }, { status: 409 });

    const topic = await prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true, slug: true },
    });
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const question = await prisma.question.create({
      data: {
        topicId: topic.id,
        title,
        slug,
        status: "DRAFT",
        contentHtml: "",
      },
      select: { slug: true, title: true, status: true, topicId: true },
    });

    return NextResponse.json({ ok: true, question });
  } catch {
    return NextResponse.json({ error: "Failed to create question" }, { status: 400 });
  }
}
