import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string" && v.trim()) out.push(v);
  }
  return Array.from(new Set(out));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  return NextResponse.json({ ok: true, progress });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const readSlugs = parseStringArray(body?.readSlugs);
  const favSlugs = parseStringArray(body?.favSlugs);
  const lastOpenedSlug = typeof body?.lastOpenedSlug === "string" ? body.lastOpenedSlug : null;
  const lastOpenedAtRaw = body?.lastOpenedAt;
  const lastOpenedAt =
    typeof lastOpenedAtRaw === "number"
      ? new Date(lastOpenedAtRaw)
      : typeof lastOpenedAtRaw === "string"
      ? new Date(lastOpenedAtRaw)
      : null;

  const progress = await prisma.userProgress.upsert({
    where: { userId },
    create: {
      userId,
      readSlugs,
      favSlugs,
      lastOpenedSlug,
      lastOpenedAt: lastOpenedAt && !Number.isNaN(lastOpenedAt.getTime()) ? lastOpenedAt : null,
    },
    update: {
      readSlugs,
      favSlugs,
      lastOpenedSlug,
      lastOpenedAt: lastOpenedAt && !Number.isNaN(lastOpenedAt.getTime()) ? lastOpenedAt : null,
    },
  });

  return NextResponse.json({ ok: true, progress });
}
