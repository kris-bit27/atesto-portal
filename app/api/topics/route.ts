import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { questions: true } },
    },
  });

  return NextResponse.json(topics);
}