import { PrismaClient, ContentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // TOPICS
  const topic1 = await prisma.topic.upsert({
    where: { slug: "101_at_zaklady_perioperacni_pece_komplikace" },
    update: { title: "101. AT Základy, perioperační péče, komplikace", order: 101 },
    create: {
      slug: "101_at_zaklady_perioperacni_pece_komplikace",
      title: "101. AT Základy, perioperační péče, komplikace",
      order: 101,
    },
  });

  const topic2 = await prisma.topic.upsert({
    where: { slug: "201_chirurgie_ruky" },
    update: { title: "201. Chirurgie ruky", order: 201 },
    create: {
      slug: "201_chirurgie_ruky",
      title: "201. Chirurgie ruky",
      order: 201,
    },
  });

  // QUESTIONS
  await prisma.question.upsert({
    where: { slug: "a1-1_hojeni_ran_kryti_ran_jizvy" },
    update: {
      title: "A1-1 Hojení ran, krytí ran, jizvy",
      status: ContentStatus.DRAFT,
      content: "<h2>Definice a význam</h2><p>Seed obsah…</p>",
      topicId: topic1.id,
    },
    create: {
      slug: "a1-1_hojeni_ran_kryti_ran_jizvy",
      title: "A1-1 Hojení ran, krytí ran, jizvy",
      status: ContentStatus.DRAFT,
      content: "<h2>Definice a význam</h2><p>Seed obsah…</p>",
      topicId: topic1.id,
    },
  });

  await prisma.question.upsert({
    where: { slug: "ruka_vysetreni_zaklady" },
    update: {
      title: "Vyšetření ruky – základy",
      status: ContentStatus.DRAFT,
      content: "<h2>Anamnéza</h2><p>Seed obsah…</p>",
      topicId: topic2.id,
    },
    create: {
      slug: "ruka_vysetreni_zaklady",
      title: "Vyšetření ruky – základy",
      status: ContentStatus.DRAFT,
      content: "<h2>Anamnéza</h2><p>Seed obsah…</p>",
      topicId: topic2.id,
    },
  });

  console.log("✅ Seed hotový (Topic + Question)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
