import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({} as any));

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const order = typeof body.order === "number" ? body.order : undefined;

  // slug změna je riziková (rozbije URL + vazby v UI), proto ji v MVP defaultně nepovolujeme
  const newSlug = typeof body.slug === "string" ? body.slug.trim() : undefined;

  const data: any = {};
  if (title !== undefined && title.length > 0) data.title = title;
  if (order !== undefined) data.order = order;

  // pokud chceš povolit, odkomentuj:
  if (newSlug !== undefined && newSlug.length > 0 && newSlug !== params.slug) {
    data.slug = newSlug;
  }

  try {
    const updated = await prisma.topic.update({
      where: { slug: params.slug },
      data,
      select: { id: true, slug: true, title: true, order: true },
    });

    return NextResponse.json({ ok: true, topic: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const url = new URL(req.url);
  const cascade = url.searchParams.get("cascade") === "1";

  try {
    if (cascade) {
      // smaže i otázky v topicu
      const topic = await prisma.topic.findUnique({ where: { slug: params.slug }, select: { id: true } });
      if (!topic) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

      await prisma.question.deleteMany({ where: { topicId: topic.id } });
    }

    await prisma.topic.delete({ where: { slug: params.slug } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Delete failed" }, { status: 500 });
  }
}
