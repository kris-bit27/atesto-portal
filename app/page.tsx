import prisma from "@/lib/prisma";
import HomeClient from "@/app/components/HomeClient";

export const revalidate = 60;

export default async function Page() {
  const [topics, specialties, domains] = await Promise.all([
    prisma.topic.findMany({
      orderBy: [{ order: "asc" }, { title: "asc" }],
      include: {
        questions: {
          orderBy: { title: "asc" },
          select: { slug: true, title: true, status: true, kind: true, source: true, specialtyId: true },
        },
      },
    }),
    prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, order: true },
    }),
    prisma.domain.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, order: true },
    }),
  ]);

  return <HomeClient topics={topics as any} specialties={specialties as any} domains={domains as any} />;
}
