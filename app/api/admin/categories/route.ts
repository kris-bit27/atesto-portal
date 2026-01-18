import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function okKey(req: Request) {
  const expected = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  if (!expected) return true;
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  return key === expected;
}

export async function GET(req: Request) {
  if (!okKey(req)) return unauthorized();

  try {
    const categoryClient = (prisma as any).category;
    if (!categoryClient?.findMany) return NextResponse.json({ categories: [] });
    const categories = await categoryClient.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        order: true,
        subcategories: { select: { id: true, slug: true, title: true, order: true }, orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Failed to load categories" }, { status: 400 });
  }
}
