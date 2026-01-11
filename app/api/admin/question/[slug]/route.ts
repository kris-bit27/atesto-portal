import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({} as any));

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const status = typeof body.status === "string" ? body.status.trim() : undefined;
  const topicSlug = typeof body.topicSlug === "string" ? body.topicSlug.trim() : undefined;

  const data: any = {};
  if (title !== undefined && title.length > 0) data.title = title;
  if (status === "DRAFT" || status === "PUBLISHED") data.status = status;

  if (topicSlug) {
    const topic = await prisma.topic.findUnique({ where: { slug: topicSlug }, select: { id: true } });
    if (!topic) return NextResponse.json({ ok: false, error: "Topic not found" }, { status: 404 });
    data.topicId = topic.id;
  }

  try {
    const updated = await prisma.question.update({
      where: { slug: params.slug },
      data,
      select: { slug: true, title: true, status: true, topicId: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, question: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.question.delete({ where: { slug: params.slug } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Delete failed" }, { status: 500 });
  }
}
