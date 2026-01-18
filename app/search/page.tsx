import prisma from "@/lib/prisma";
import SearchClient from "./SearchClient";

export const revalidate = 60;

export default async function SearchPage() {
  const initialTake = 300;
  const [questions, specialties, domains, categories, subcategories] = await Promise.all([
    prisma.question.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: initialTake,
      select: {
        slug: true,
        title: true,
        status: true,
        specialtyId: true,
        categoryId: true,
        subcategoryId: true,
        topic: { select: { slug: true, title: true } },
      },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
    prisma.domain.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
    prisma.subcategory.findMany({
      orderBy: [{ categoryId: "asc" }, { order: "asc" }],
      select: { id: true, slug: true, title: true, order: true, categoryId: true },
    }),
  ]);

  return (
    <SearchClient
      questions={questions as any}
      specialties={specialties as any}
      domains={domains as any}
      categories={categories as any}
      subcategories={subcategories as any}
    />
  );
}
