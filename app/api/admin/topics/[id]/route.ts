import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { assertAdminKey } from "@/app/api/admin/_auth";
import * as prismaModule from "@/lib/prisma";

const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma;

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = assertAdminKey(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.slug === "string") data.slug = body.slug.trim();
  if (typeof body.order === "number") data.order = body.order;

  if ("title" in data && !data.title) {
    return NextResponse.json({ error: "title je povinný" }, { status: 400 });
  }
  if ("slug" in data && !data.slug) {
    return NextResponse.json({ error: "slug je povinný" }, { status: 400 });
  }
  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    if (data.slug) {
      const exists = await prisma.topic.findFirst({
        where: { slug: data.slug, NOT: { id: params.id } },
        select: { id: true },
      });
      if (exists) return NextResponse.json({ error: "slug již existuje" }, { status: 409 });
    }

    const updated = await prisma.topic.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ ok: true, updated });
  } catch {
    return NextResponse.json({ error: "Failed to update topic" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = assertAdminKey(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  // Pozor: pokud má topic otázky, Prisma může spadnout na FK.
  // Necháme to explicitně (ať je jasné, že nejdřív smaž otázky).
  try {
    await prisma.topic.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 400 });
  }
}
