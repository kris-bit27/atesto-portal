import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function GET(_req: Request, { params }: Params) {
  const q = await prisma.question.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      topicId: true,
      slug: true,
      title: true,
      status: true,
      contentHtml: true,
      updatedAt: true,
      topic: { select: { title: true, slug: true, order: true } },
    },
  });

  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ question: q });
}
