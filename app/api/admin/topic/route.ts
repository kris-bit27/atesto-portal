import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const order = typeof body.order === "number" ? body.order : 0;

  if (!title || !slug) {
    return NextResponse.json({ error: "Missing title/slug" }, { status: 400 });
  }

  const topic = await prisma.topic.create({
    data: { title, slug, order },
    select: { id: true, title: true, slug: true, order: true },
  });

  return NextResponse.json({ ok: true, topic });
}
