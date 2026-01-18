import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DOMAINS = [
  { slug: "foundations", title: "Foundations", order: 10 },
  { slug: "reconstruction", title: "Reconstruction", order: 20 },
  { slug: "hand", title: "Hand Surgery", order: 30 },
  { slug: "burns", title: "Burns / Thermic Injury", order: 40 },
  { slug: "oncology", title: "Oncology & Skin", order: 50 },
  { slug: "congenital", title: "Congenital / Craniofacial", order: 60 },
  { slug: "breast", title: "Breast & Trunk Reconstruction", order: 70 },
  { slug: "aesthetics", title: "Aesthetics", order: 80 },
  { slug: "lymphedema", title: "Lymphedema & Microsurgery", order: 90 },
];

const TOPIC_DOMAIN_MAP: Array<{ topicSlug: string; domainSlug: string }> = [
  { topicSlug: "okruh-1-obecna-plasticka-chirurgie-vrozene-vady", domainSlug: "foundations" },
  { topicSlug: "okruh-2-rekonstrukcni-nadory-popaleniny", domainSlug: "reconstruction" },
  { topicSlug: "okruh-3-chirurgie-ruky-esteticka", domainSlug: "hand" },
];

async function main() {
  for (const d of DOMAINS) {
    await prisma.domain.upsert({
      where: { slug: d.slug },
      update: { title: d.title, order: d.order, isActive: true },
      create: { slug: d.slug, title: d.title, order: d.order, isActive: true },
    });
  }

  const domainBySlug = new Map(
    (await prisma.domain.findMany({ select: { id: true, slug: true } })).map((d) => [d.slug, d.id])
  );

  for (const m of TOPIC_DOMAIN_MAP) {
    const domainId = domainBySlug.get(m.domainSlug);
    if (!domainId) continue;
    await prisma.topic.updateMany({
      where: { slug: m.topicSlug, domainId: null },
      data: { domainId },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
