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

  try {
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
        categoryId: true,
        subcategoryId: true,
        topic: { select: { id: true, title: true, slug: true, order: true } },
      },
    });

    if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ question: q });
  } catch {
    return NextResponse.json({ error: "Failed to load question" }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  if (!okKey(req)) return unauthorized();

  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof body.topicId === "string") data.topicId = body.topicId.trim();
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.slug === "string") data.slug = body.slug.trim();
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.contentHtml === "string") data.contentHtml = body.contentHtml;
  if (typeof body.categoryId === "string") data.categoryId = body.categoryId.trim() || null;
  if (typeof body.subcategoryId === "string") data.subcategoryId = body.subcategoryId.trim() || null;

  if ("title" in data && !data.title) {
    return NextResponse.json({ error: "title je povinný" }, { status: 400 });
  }
  if ("slug" in data && !data.slug) {
    return NextResponse.json({ error: "slug je povinný" }, { status: 400 });
  }
  if ("topicId" in data && !data.topicId) {
    return NextResponse.json({ error: "topicId je povinný" }, { status: 400 });
  }
  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const current = await prisma.question.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (data.slug) {
      const exists = await prisma.question.findFirst({
        where: { slug: data.slug, NOT: { id: params.id } },
        select: { id: true },
      });
      if (exists) return NextResponse.json({ error: "slug již existuje" }, { status: 409 });
    }

    const updated = await prisma.question.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        topicId: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        categoryId: true,
        subcategoryId: true,
      },
    });

    return NextResponse.json({ ok: true, updated });
  } catch {
    return NextResponse.json({ error: "Failed to update question" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  if (!okKey(req)) return unauthorized();

  try {
    const current = await prisma.question.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.question.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete question" }, { status: 400 });
  }
}
