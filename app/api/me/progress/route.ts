import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type TogglePayload = { slug: string; value?: boolean };
type OpenPayload = { slug: string };
type LastOpenedPayload = { slug: string; at?: string };

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string" && v.trim()) out.push(v);
  }
  return Array.from(new Set(out));
}

async function getUserId() {
  const session = (await getServerSession(authOptions as any)) as any;
  const email = session?.user?.email || null;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id || null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ ok: true, read: [], fav: [], lastOpened: null });
  }

  const [readRows, favRows, lastOpened] = await Promise.all([
    prisma.userQuestionProgress.findMany({
      where: { userId, readAt: { not: null } },
      select: { questionSlug: true },
    }),
    prisma.userQuestionProgress.findMany({
      where: { userId, isFav: true },
      select: { questionSlug: true },
    }),
    prisma.userQuestionProgress.findFirst({
      where: { userId, lastOpenedAt: { not: null } },
      orderBy: { lastOpenedAt: "desc" },
      select: { questionSlug: true, lastOpenedAt: true },
    }),
  ]);

  return NextResponse.json({
    read: readRows.map((r: { questionSlug: string }) => r.questionSlug),
    fav: favRows.map((r: { questionSlug: string }) => r.questionSlug),
    lastOpened: lastOpened
      ? { slug: lastOpened.questionSlug, at: lastOpened.lastOpenedAt }
      : null,
  });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const read = body?.read as TogglePayload | undefined;
  const fav = body?.fav as TogglePayload | undefined;
  const opened = body?.opened as OpenPayload | undefined;
  const lastOpened = body?.lastOpened as LastOpenedPayload | undefined;
  const sync = body?.sync as { readSlugs?: string[]; favSlugs?: string[] } | undefined;
  const srs = body?.srs as Record<string, any> | undefined;
  void srs;

  const ops: any[] = [];

  if (read?.slug) {
    ops.push(
      prisma.userQuestionProgress.upsert({
        where: { userId_questionSlug: { userId, questionSlug: read.slug } },
        create: { userId, questionSlug: read.slug, readAt: read.value === false ? null : new Date() },
        update: { readAt: read.value === false ? null : new Date() },
      })
    );
  }

  if (fav?.slug) {
    ops.push(
      prisma.userQuestionProgress.upsert({
        where: { userId_questionSlug: { userId, questionSlug: fav.slug } },
        create: { userId, questionSlug: fav.slug, isFav: fav.value !== false },
        update: { isFav: fav.value !== false },
      })
    );
  }

  const openedSlug = lastOpened?.slug || opened?.slug;
  if (openedSlug) {
    const openedAt =
      lastOpened?.at && !Number.isNaN(Date.parse(lastOpened.at))
        ? new Date(lastOpened.at)
        : new Date();
    ops.push(
      prisma.userQuestionProgress.upsert({
        where: { userId_questionSlug: { userId, questionSlug: openedSlug } },
        create: { userId, questionSlug: openedSlug, lastOpenedAt: openedAt },
        update: { lastOpenedAt: openedAt },
      })
    );
  }

  const readSlugs = asStringArray(sync?.readSlugs);
  const favSlugs = asStringArray(sync?.favSlugs);
  for (const slug of readSlugs) {
    ops.push(
      prisma.userQuestionProgress.upsert({
        where: { userId_questionSlug: { userId, questionSlug: slug } },
        create: { userId, questionSlug: slug, readAt: new Date() },
        update: { readAt: new Date() },
      })
    );
  }
  for (const slug of favSlugs) {
    ops.push(
      prisma.userQuestionProgress.upsert({
        where: { userId_questionSlug: { userId, questionSlug: slug } },
        create: { userId, questionSlug: slug, isFav: true },
        update: { isFav: true },
      })
    );
  }

  if (ops.length) await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
