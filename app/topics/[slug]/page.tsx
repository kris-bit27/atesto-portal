import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TopicClient from "./TopicClient";

export const revalidate = 60;

type Params = { params: { slug: string } };

export default async function TopicPage({ params }: Params) {
  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      specialtyId: true,
      domainId: true,
      questions: {
        orderBy: { title: "asc" },
        select: { slug: true, title: true, status: true },
      },
    },
  });

  if (!topic) return notFound();

  const [specialties, domains] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
    prisma.domain.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, order: true } }),
  ]);

  return <TopicClient topic={topic as any} specialties={specialties as any} domains={domains as any} />;
}
