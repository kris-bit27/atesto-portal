import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { assertAdminKey } from "@/app/api/admin/_auth";
import * as prismaModule from "@/lib/prisma";

const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = assertAdminKey(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return NextResponse.json({ topics });
}

export async function POST(req: NextRequest) {
  const auth = assertAdminKey(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const order = typeof body.order === "number" ? body.order : 0;

  if (!title) return NextResponse.json({ error: "title je povinný" }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "slug je povinný" }, { status: 400 });

  const created = await prisma.topic.create({
    data: { title, slug, order },
  });

  return NextResponse.json({ ok: true, created });
}
