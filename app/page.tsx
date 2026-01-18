import prisma from "@/lib/prisma";
import HomeClient from "@/app/components/HomeClient";

export const revalidate = 60;

export default async function Page() {
  const [topics, specialties, domains, categories, subcategories] = await Promise.all([
    prisma.topic.findMany({
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: {
        title: true,
        slug: true,
        order: true,
        specialtyId: true,
        domainId: true,
        questions: {
          orderBy: { title: "asc" },
          select: { slug: true, title: true, status: true, categoryId: true, subcategoryId: true },
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
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, order: true, isActive: true },
    }),
    prisma.subcategory.findMany({
      where: { isActive: true },
      orderBy: [{ categoryId: "asc" }, { order: "asc" }],
      select: { id: true, slug: true, title: true, order: true, categoryId: true, isActive: true },
    }),
  ]);

  return (
    <HomeClient
      topics={topics as any}
      specialties={specialties as any}
      domains={domains as any}
      categories={categories as any}
      subcategories={subcategories as any}
    />
  );
}
