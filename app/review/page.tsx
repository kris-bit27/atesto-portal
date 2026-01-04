import prisma from "@/lib/prisma";
import ReviewClient from "@/app/components/ReviewClient";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const questions = await prisma.question.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      slug: true,
      title: true,
      status: true,
      topic: { select: { title: true, slug: true } },
    },
  });

  return <ReviewClient questions={questions} />;
}
