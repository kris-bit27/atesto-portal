import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({} as any));

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const status = typeof body.status === "string" ? body.status.trim() : undefined;
  const kind = typeof body.kind === "string" ? body.kind : undefined;
  const source = typeof body.source === "string" ? body.source : undefined;
  const partnerName = typeof body.partnerName === "string" ? body.partnerName : undefined;
  const disclosure = typeof body.disclosure === "string" ? body.disclosure : undefined;
  const topicSlug = typeof body.topicSlug === "string" ? body.topicSlug.trim() : undefined;

  const data: any = {};
  if (title !== undefined) {
    if (!title) return NextResponse.json({ error: "title je povinný" }, { status: 400 });
    data.title = title;
  }
  if (status === "DRAFT" || status === "PUBLISHED") data.status = status;

  if (topicSlug !== undefined) {
    if (!topicSlug) return NextResponse.json({ error: "topicSlug je povinný" }, { status: 400 });
    try {
      const topic = await prisma.topic.findUnique({ where: { slug: topicSlug }, select: { id: true } });
      if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      data.topicId = topic.id;
    } catch {
      return NextResponse.json({ error: "Failed to resolve topic" }, { status: 400 });
    }
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const current = await prisma.question.findUnique({ where: { slug: params.slug }, select: { slug: true } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.question.update({
      where: { slug: params.slug },
      data,
      select: { slug: true, title: true, status: true, topicId: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, question: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update question" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const current = await prisma.question.findUnique({ where: { slug: params.slug }, select: { slug: true } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.question.delete({ where: { slug: params.slug } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete question" }, { status: 400 });
  }
}
