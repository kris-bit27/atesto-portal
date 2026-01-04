import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function GET(_req: Request, { params }: Params) {
  const q = await prisma.question.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      title: true,
      status: true,
      content: true,
      contentHtml: true,
      updatedAt: true,
    } as any,
  });

  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // sjednotíme, aby klient vždy dostal "contentHtml"
  const contentHtml = (q as any).contentHtml ?? (q as any).content ?? "";

  return NextResponse.json({
    slug: q.slug,
    title: q.title ?? "",
    status: (q as any).status ?? "DRAFT",
    contentHtml,
    updatedAt: q.updatedAt,
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => ({}));

  const title = typeof body.title === "string" ? body.title : undefined;
  const contentHtml = typeof body.contentHtml === "string" ? body.contentHtml : undefined;
  const status = typeof body.status === "string" ? body.status : undefined;

  // Update data – uložíme do contentHtml, pokud existuje ve schématu,
  // jinak fallback do content
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (status !== undefined) data.status = status;

  // zkusíme nejdřív contentHtml, když by padalo na DB úrovni, upravíme později
  if (contentHtml !== undefined) {
    data.contentHtml = contentHtml;
    data.content = contentHtml; // fallback kompatibilita (pokud máš jen content)
  }

  try {
    const updated = await prisma.question.update({
      where: { slug: params.slug },
      data,
      select: { slug: true, title: true, status: true, updatedAt: true } as any,
    });

    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Update failed" },
      { status: 500 }
    );
  }
}
