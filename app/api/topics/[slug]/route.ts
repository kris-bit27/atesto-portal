import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function GET(_req: Request, { params }: Params) {
  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      questions: {
        orderBy: { title: "asc" },
        select: { slug: true, title: true, status: true, updatedAt: true },
      },
    },
  });

  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ topic });
}
