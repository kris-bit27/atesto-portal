import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DOMAINS = [
  { slug: "foundations", title: "Foundations", order: 10 },
  { slug: "reconstruction", title: "Reconstruction", order: 20 },
  { slug: "hand", title: "Hand Surgery", order: 30 },
  { slug: "burns", title: "Burns / Thermic Injury", order: 40 },
  { slug: "oncology", title: "Oncology & Skin", order: 50 },
  { slug: "congenital", title: "Congenital / Craniofacial", order: 60 },
  { slug: "aesthetics", title: "Aesthetics", order: 80 },
  { slug: "perioperative", title: "Perioperative", order: 90 },
];

const CHAPTERS: Array<{
  slug: string;
  title: string;
  order: number;
  domainSlug: string;
}> = [
  { slug: "ch-foundations-core", title: "Foundations / Zaklady", order: 10, domainSlug: "foundations" },
  { slug: "ch-reconstruction-locoregional-flaps", title: "Mistni/Regionalni laloky", order: 10, domainSlug: "reconstruction" },
  { slug: "ch-reconstruction-free-flaps", title: "Volne laloky", order: 20, domainSlug: "reconstruction" },
  { slug: "ch-grafts-wound-healing", title: "Hojeni ran + stepy", order: 30, domainSlug: "reconstruction" },
  { slug: "ch-hand-assessment", title: "Vysetreni ruky + fixace + rehab", order: 10, domainSlug: "hand" },
  { slug: "ch-hand-flexor-extensor", title: "Flexory/extenzory", order: 20, domainSlug: "hand" },
  { slug: "ch-hand-nerves", title: "Periferni nervy", order: 30, domainSlug: "hand" },
  { slug: "ch-hand-bone-joint", title: "Kosti/klouby", order: 40, domainSlug: "hand" },
  { slug: "ch-hand-infections", title: "Infekce ruky", order: 50, domainSlug: "hand" },
  { slug: "ch-hand-dupuytren", title: "Dupuytren", order: 60, domainSlug: "hand" },
  { slug: "ch-hand-compartment-crps", title: "Kompartment/Volkmann/CRPS", order: 70, domainSlug: "hand" },
  { slug: "ch-burns-acute", title: "Akutni popaleniny + sok + prvni pomoc", order: 10, domainSlug: "burns" },
  { slug: "ch-burns-surgery", title: "Nekrektomie + grafting + kryty", order: 20, domainSlug: "burns" },
  { slug: "ch-burns-secondary", title: "Sekundarni rekonstrukce + rehab", order: 30, domainSlug: "burns" },
  { slug: "ch-onco-skin", title: "NMSC, melanom, prekancerozy", order: 10, domainSlug: "oncology" },
  { slug: "ch-onco-breast", title: "Benign/malign breast + BRCA + BIA-ALCL", order: 20, domainSlug: "oncology" },
  { slug: "ch-congenital-clefts", title: "Rozstepy", order: 10, domainSlug: "congenital" },
  { slug: "ch-congenital-hand", title: "Vrozene vady ruky", order: 20, domainSlug: "congenital" },
  { slug: "ch-congenital-ear", title: "Vady boltce", order: 30, domainSlug: "congenital" },
  { slug: "ch-congenital-chest", title: "Poland, tuberozni, asymetrie", order: 40, domainSlug: "congenital" },
  { slug: "ch-congenital-genital", title: "Hypospadie/epispadie/extrofie", order: 50, domainSlug: "congenital" },
  { slug: "ch-aesthetics-btx-fillers", title: "Botulotoxin + vyplne", order: 10, domainSlug: "aesthetics" },
  { slug: "ch-aesthetics-lipo", title: "Liposukce", order: 20, domainSlug: "aesthetics" },
  { slug: "ch-aesthetics-bodycontour", title: "Postbariatrie + abdominoplastika", order: 30, domainSlug: "aesthetics" },
  { slug: "ch-aesthetics-face", title: "Rhinoplastika + facelift + blepharo", order: 40, domainSlug: "aesthetics" },
  { slug: "ch-periop-atb-vte", title: "Tromboprofylaxe + periop basics + ATB profylaxe", order: 10, domainSlug: "perioperative" },
];

const MATCH_RULES: Array<{ chapterSlug: string; keywords: string[] }> = [
  { chapterSlug: "ch-hand-assessment", keywords: ["vysetreni ruky", "fixace", "rehab"] },
  { chapterSlug: "ch-hand-flexor-extensor", keywords: ["flexor", "extenzor"] },
  { chapterSlug: "ch-hand-nerves", keywords: ["perifernich nervu", "brachialni plexus", "plexus"] },
  { chapterSlug: "ch-hand-dupuytren", keywords: ["dupuy"] },
  { chapterSlug: "ch-hand-compartment-crps", keywords: ["kompartment", "volkmann", "crps"] },
  { chapterSlug: "ch-hand-infections", keywords: ["infekce ruky"] },
  { chapterSlug: "ch-hand-bone-joint", keywords: ["kosti", "klouby", "osteosyntez"] },
  { chapterSlug: "ch-burns-acute", keywords: ["popalenin", "sok", "prvni pomoc", "escharotomie"] },
  { chapterSlug: "ch-burns-surgery", keywords: ["nekrektomie", "autograft", "kryty"] },
  { chapterSlug: "ch-burns-secondary", keywords: ["sekundarni rekonstrukce", "rehabilitace"] },
  { chapterSlug: "ch-onco-skin", keywords: ["melanom", "nemelanom", "prekancer"] },
  { chapterSlug: "ch-onco-breast", keywords: ["brca", "bia-alcl", "prsu", "prs"] },
  { chapterSlug: "ch-congenital-clefts", keywords: ["rozstep"] },
  { chapterSlug: "ch-congenital-hand", keywords: ["vrozene vady ruky"] },
  { chapterSlug: "ch-congenital-ear", keywords: ["boltce"] },
  { chapterSlug: "ch-congenital-chest", keywords: ["poland", "tuber"] },
  { chapterSlug: "ch-congenital-genital", keywords: ["hypospad", "epispad", "extrof"] },
  { chapterSlug: "ch-aesthetics-btx-fillers", keywords: ["botulotoxin", "vypln"] },
  { chapterSlug: "ch-aesthetics-lipo", keywords: ["liposuk"] },
  { chapterSlug: "ch-aesthetics-bodycontour", keywords: ["postbariatr", "abdominoplast"] },
  { chapterSlug: "ch-aesthetics-face", keywords: ["rhinoplast", "facelift", "blefar"] },
  { chapterSlug: "ch-periop-atb-vte", keywords: ["tromboprofylax", "atb profylax"] },
  { chapterSlug: "ch-grafts-wound-healing", keywords: ["kozni transplant", "hojeni ran", "jizv"] },
  { chapterSlug: "ch-reconstruction-free-flaps", keywords: ["volne lalok"] },
  { chapterSlug: "ch-reconstruction-locoregional-flaps", keywords: ["mistni", "regionalni", "laloky – klasifikace"] },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchChapterSlug(title: string): string | null {
  const t = normalize(title);
  for (const rule of MATCH_RULES) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.chapterSlug;
  }
  return null;
}

async function main() {
  for (const d of DOMAINS) {
    await prisma.domain.upsert({
      where: { slug: d.slug },
      update: { title: d.title, order: d.order, isActive: true },
      create: { slug: d.slug, title: d.title, order: d.order, isActive: true },
    });
  }

  const domains = await prisma.domain.findMany({ select: { id: true, slug: true } });
  const domainBySlug = new Map(domains.map((d) => [d.slug, d.id]));

  const defaultSpecialty = await prisma.specialty.findFirst({
    where: { slug: { contains: "plast" } },
    select: { id: true },
  });

  let created = 0;
  for (const ch of CHAPTERS) {
    const domainId = domainBySlug.get(ch.domainSlug) || null;
    const existing = await prisma.topic.findUnique({ where: { slug: ch.slug }, select: { id: true } });
    await prisma.topic.upsert({
      where: { slug: ch.slug },
      update: {
        title: ch.title,
        order: ch.order,
        domainId,
        specialtyId: defaultSpecialty?.id || null,
      },
      create: {
        slug: ch.slug,
        title: ch.title,
        order: ch.order,
        domainId,
        specialtyId: defaultSpecialty?.id || null,
      },
    });
    if (!existing) created += 1;
  }

  const chapterTopics = await prisma.topic.findMany({
    where: { slug: { startsWith: "ch-" } },
    select: { id: true, slug: true },
  });
  const chapterIdBySlug = new Map(chapterTopics.map((t) => [t.slug, t.id]));

  const questions = await prisma.question.findMany({
    select: { id: true, title: true, slug: true, topicId: true, specialtyId: true, topic: { select: { slug: true } } },
  });

  let moved = 0;
  const unmapped: Array<{ title: string; slug: string }> = [];

  for (const q of questions) {
    if (q.topic?.slug?.startsWith("ch-")) continue;
    const targetSlug = matchChapterSlug(q.title || "");
    if (!targetSlug) {
      if (unmapped.length < 50) unmapped.push({ title: q.title || "", slug: q.slug });
      continue;
    }
    const targetId = chapterIdBySlug.get(targetSlug);
    if (!targetId || q.topicId === targetId) continue;

    await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: q.id },
        data: {
          topicId: targetId,
          specialtyId: q.specialtyId || defaultSpecialty?.id || null,
        },
      });
    });
    moved += 1;
  }

  console.log(`Chapters created: ${created}`);
  console.log(`Questions moved: ${moved}`);
  if (unmapped.length > 0) {
    console.log("UNMAPPED (top 50):");
    for (const u of unmapped) console.log(`- ${u.title} (${u.slug})`);
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
