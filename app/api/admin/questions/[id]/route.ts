import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function okKey(req: Request) {
  const expected = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  if (!expected) return true; // kdyby nebyl klíč nastavený, neblokuj lokální dev
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  return key === expected;
}

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  if (!okKey(req)) return unauthorized();

  const q = await prisma.question.findUnique({
    where: { id: params.id },
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

  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ question: q });
}

export async function PATCH(req: Request, { params }: Params) {
  if (!okKey(req)) return unauthorized();

  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof body.topicId === "string") data.topicId = body.topicId;
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.slug === "string") data.slug = body.slug;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.contentHtml === "string") data.contentHtml = body.contentHtml;

  const updated = await prisma.question.update({
    where: { id: params.id },
    data,
    select: { id: true, topicId: true, title: true, slug: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, updated });
}

export async function DELETE(req: Request, { params }: Params) {
  if (!okKey(req)) return unauthorized();

  await prisma.question.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
