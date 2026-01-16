import prisma from "@/lib/prisma";
import SearchClient from "./SearchClient";

export const revalidate = 60;

export default async function SearchPage() {
  const [questions, specialties, domains] = await Promise.all([
    prisma.question.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        slug: true,
        title: true,
        status: true,
        specialtyId: true,
          topic: { select: { slug: true, title: true } },
      },
    }),
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
    prisma.domain.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
  ]);

    return <SearchClient questions={questions as any} specialties={specialties as any} domains={domains as any} />;
}
