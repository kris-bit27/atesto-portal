import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

// GET: vrací otázku pro editor/detail
export async function GET(_req: Request, { params }: Params) {
  const q = await prisma.question.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      title: true,
      status: true,
      contentHtml: true,
      updatedAt: true,
    },
  });

  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    slug: q.slug,
    title: q.title ?? "",
    status: q.status ?? "DRAFT",
    // sjednocený název pro klienta
    content: q.contentHtml ?? "",
    updatedAt: q.updatedAt,
  });
}

// PATCH: přijme změny z editoru a uloží do DB
export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({} as any));

  const title = typeof body.title === "string" ? body.title : undefined;

  // kompatibilita: klient může posílat buď "content" nebo "contentHtml"
  const incomingContent =
    typeof body.content === "string"
      ? body.content
      : typeof body.contentHtml === "string"
        ? body.contentHtml
        : undefined;

  const status = typeof body.status === "string" ? body.status : undefined;

  const data: {
    title?: string;
    status?: any;
    contentHtml?: string;
  } = {};

  if (title !== undefined) data.title = title;
  if (status !== undefined) data.status = status;
  if (incomingContent !== undefined) data.contentHtml = incomingContent;

  try {
    const updated = await prisma.question.update({
      where: { slug: params.slug },
      data,
      select: { slug: true, title: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Update failed" },
      { status: 500 }
    );
  }
}
