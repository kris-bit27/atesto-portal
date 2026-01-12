import prisma from "@/lib/prisma";
import HomeClient from "@/app/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [topics, specialties, domains] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { order: "asc" },
      include: {
        questions: {
          orderBy: { title: "asc" },
          select: { slug: true, title: true, status: true },
        },
      },
    }),
    // pokud model Specialty/Domain existuje v Prisma Clientu, poběží.
    // pokud by neexistoval, spadne už při build-time, proto to držíme jen na MVP2 branche.
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
    prisma.domain.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
  ]);

  return <HomeClient topics={topics as any} specialties={specialties as any} domains={domains as any} />;
}
