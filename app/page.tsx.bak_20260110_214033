import prisma from "@/lib/prisma";
import HomeClient from "./components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      title: true,
      order: true,
      questions: {
        orderBy: { createdAt: "asc" },
        select: { slug: true, title: true, status: true },
      },
    },
  });

  return <HomeClient topics={topics} />;
}
