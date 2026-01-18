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

const CHAPTERS: Array<{
  slug: string;
  title: string;
  order: number;
  domainSlug: string;
}> = [
  // FOUNDATIONS
  { slug: "ch-foundations-wound-healing", title: "Hojeni ran, kryti ran, jizvy", order: 1000, domainSlug: "foundations" },
  { slug: "ch-foundations-anesthesia", title: "Mistni/svodna anestezie, komplikace", order: 1001, domainSlug: "foundations" },
  { slug: "ch-foundations-flaps-basics", title: "Laloky – klasifikace, angiosomy, delay, monitorace", order: 1002, domainSlug: "foundations" },
  { slug: "ch-foundations-grafts", title: "Kozni transplantace", order: 1003, domainSlug: "foundations" },
  { slug: "ch-foundations-microsurgery", title: "Mikrochirurgie – zaklady, magnifikace, turniket", order: 1004, domainSlug: "foundations" },
  // HAND
  { slug: "ch-hand-exam-rehab", title: "Vysetreni ruky, rehab, fixace", order: 1010, domainSlug: "hand" },
  { slug: "ch-hand-tendons-flexors", title: "Poraneni flexoru", order: 1011, domainSlug: "hand" },
  { slug: "ch-hand-tendons-extensors", title: "Poraneni extenzoru", order: 1012, domainSlug: "hand" },
  { slug: "ch-hand-nerves", title: "Periferni nervy HK, parezy", order: 1013, domainSlug: "hand" },
  { slug: "ch-hand-compartments-crps", title: "Kompartment, Volkmann, CRPS", order: 1014, domainSlug: "hand" },
  { slug: "ch-hand-infections", title: "Infekce ruky", order: 1015, domainSlug: "hand" },
  { slug: "ch-hand-dupuytren", title: "Dupuytren", order: 1016, domainSlug: "hand" },
  { slug: "ch-hand-entrapments", title: "CTS, kubital, Guyon", order: 1017, domainSlug: "hand" },
  { slug: "ch-hand-bone-joint", title: "Kosti/klouby, osteosyntezy", order: 1018, domainSlug: "hand" },
  // RECONSTRUCTION
  { slug: "ch-recon-lower-leg", title: "Berec – defekty, rekonstrukce", order: 1020, domainSlug: "reconstruction" },
  { slug: "ch-recon-foot-ankle-diabetic", title: "Noha/hlezno, diabeticka noha", order: 1021, domainSlug: "reconstruction" },
  { slug: "ch-recon-pressure-sores", title: "Dekubity", order: 1022, domainSlug: "reconstruction" },
  { slug: "ch-recon-replantation", title: "Replantace/revaskularizace", order: 1023, domainSlug: "reconstruction" },
  // BURNS
  { slug: "ch-burns-first-aid", title: "Prvni pomoc, escharotomie", order: 1030, domainSlug: "burns" },
  { slug: "ch-burns-burn-disease", title: "Akutni nemoc z popaleni", order: 1031, domainSlug: "burns" },
  { slug: "ch-burns-surgery", title: "Nekrektomie, autograft, docasne kryty", order: 1032, domainSlug: "burns" },
  { slug: "ch-burns-secondary", title: "Sekundarni rekonstrukce + rehab", order: 1033, domainSlug: "burns" },
  { slug: "ch-burns-other", title: "Elektricke/chemicke/crush/blast/inhala/ radiacni", order: 1034, domainSlug: "burns" },
  // ONCOLOGY
  { slug: "ch-onco-nmsc", title: "Nemelanomove nadory, prekancerozy", order: 1040, domainSlug: "oncology" },
  { slug: "ch-onco-melanoma", title: "Melanom + SLN", order: 1041, domainSlug: "oncology" },
  { slug: "ch-onco-benign-skin", title: "Benigni tumory, cevni malformace", order: 1042, domainSlug: "oncology" },
  // CONGENITAL
  { slug: "ch-cong-clefts-overview", title: "Rozstepy – embryologie, klasifikace", order: 1050, domainSlug: "congenital" },
  { slug: "ch-cong-cleft-lip", title: "Rozstep rtu", order: 1051, domainSlug: "congenital" },
  { slug: "ch-cong-cleft-palate-vpi", title: "Rozstep patra, VPI", order: 1052, domainSlug: "congenital" },
  { slug: "ch-cong-cranio", title: "Kraniosynostozy, kraniofacialni syndromy", order: 1053, domainSlug: "congenital" },
  { slug: "ch-cong-ear", title: "Boltce – odstale, rekonstrukce", order: 1054, domainSlug: "congenital" },
  { slug: "ch-cong-hand", title: "Vrozene vady ruky – OMT 2014", order: 1055, domainSlug: "congenital" },
  // BREAST/TRUNK
  { slug: "ch-breast-implant", title: "Rekonstrukce implantatem + NAC", order: 1060, domainSlug: "breast" },
  { slug: "ch-breast-autologous", title: "Autologni laloky + lipofilling", order: 1061, domainSlug: "breast" },
  { slug: "ch-breast-prophylactic", title: "Profylakticka mastektomie", order: 1062, domainSlug: "breast" },
  { slug: "ch-trunk-abdominalwall", title: "Brisni stena, perineum", order: 1063, domainSlug: "breast" },
  // AESTHETICS
  { slug: "ch-aesth-botox-fillers", title: "Botulotoxin, vyplne, komplikace", order: 1070, domainSlug: "aesthetics" },
  { slug: "ch-aesth-lipo", title: "Liposukce", order: 1071, domainSlug: "aesthetics" },
  { slug: "ch-aesth-abdominoplasty", title: "Abdominoplastika", order: 1072, domainSlug: "aesthetics" },
  { slug: "ch-aesth-breast-aesth", title: "Augmentace/redukce/modelace", order: 1073, domainSlug: "aesthetics" },
  { slug: "ch-aesth-face", title: "Facelift, blefaro, browlift, rhino", order: 1074, domainSlug: "aesthetics" },
  { slug: "ch-aesth-lasers", title: "Lasery, resurfacing, peeling, dermabraze", order: 1075, domainSlug: "aesthetics" },
];

const MATCH_RULES: Array<{ chapterSlug: string; keywords: string[] }> = [
  { chapterSlug: "ch-foundations-wound-healing", keywords: ["hojeni", "kryti", "jizv"] },
  { chapterSlug: "ch-foundations-anesthesia", keywords: ["anestez", "svodn", "mistn"] },
  { chapterSlug: "ch-foundations-flaps-basics", keywords: ["lalok", "angiosom", "delay", "monitor"] },
  { chapterSlug: "ch-foundations-grafts", keywords: ["kozni transplant", "step"] },
  { chapterSlug: "ch-foundations-microsurgery", keywords: ["mikrochir", "magnifik", "turniket"] },
  { chapterSlug: "ch-hand-exam-rehab", keywords: ["vysetren", "rehab", "protetik", "fixac"] },
  { chapterSlug: "ch-hand-tendons-flexors", keywords: ["flexor"] },
  { chapterSlug: "ch-hand-tendons-extensors", keywords: ["extenz"] },
  { chapterSlug: "ch-hand-nerves", keywords: ["nerv", "parez"] },
  { chapterSlug: "ch-hand-compartments-crps", keywords: ["kompartment", "volkmann", "crps"] },
  { chapterSlug: "ch-hand-infections", keywords: ["infekc"] },
  { chapterSlug: "ch-hand-dupuytren", keywords: ["dupuytren"] },
  { chapterSlug: "ch-hand-entrapments", keywords: ["cts", "kubital", "guyon"] },
  { chapterSlug: "ch-hand-bone-joint", keywords: ["kost", "kloub", "osteosynt"] },
  { chapterSlug: "ch-recon-lower-leg", keywords: ["berec"] },
  { chapterSlug: "ch-recon-foot-ankle-diabetic", keywords: ["noha", "hlezno", "diabet"] },
  { chapterSlug: "ch-recon-pressure-sores", keywords: ["dekubit"] },
  { chapterSlug: "ch-recon-replantation", keywords: ["replant", "revask"] },
  { chapterSlug: "ch-burns-first-aid", keywords: ["prvni pomoc", "escharotomi"] },
  { chapterSlug: "ch-burns-burn-disease", keywords: ["nemoc z popal", "sok"] },
  { chapterSlug: "ch-burns-surgery", keywords: ["nekrektom", "autograft", "docasne kryty", "nahrady"] },
  { chapterSlug: "ch-burns-secondary", keywords: ["sekundar", "rehab"] },
  { chapterSlug: "ch-burns-other", keywords: ["elektr", "chemic", "crush", "blast", "inhala", "radiac"] },
  { chapterSlug: "ch-onco-nmsc", keywords: ["nemelanom", "prekancer"] },
  { chapterSlug: "ch-onco-melanoma", keywords: ["melanom", "sentinel"] },
  { chapterSlug: "ch-onco-benign-skin", keywords: ["benign", "nev", "cevni", "malform"] },
  { chapterSlug: "ch-cong-clefts-overview", keywords: ["rozstep", "embryolog", "klasifik"] },
  { chapterSlug: "ch-cong-cleft-lip", keywords: ["rozstep rtu"] },
  { chapterSlug: "ch-cong-cleft-palate-vpi", keywords: ["rozstep patra", "vpi"] },
  { chapterSlug: "ch-cong-cranio", keywords: ["kraniosynost", "kraniofaci"] },
  { chapterSlug: "ch-cong-ear", keywords: ["boltce"] },
  { chapterSlug: "ch-cong-hand", keywords: ["vady ruky", "omt"] },
  { chapterSlug: "ch-breast-implant", keywords: ["implant", "nac"] },
  { chapterSlug: "ch-breast-autologous", keywords: ["autolog", "lipofill", "lalok"] },
  { chapterSlug: "ch-breast-prophylactic", keywords: ["profylakt", "mastekt"] },
  { chapterSlug: "ch-trunk-abdominalwall", keywords: ["brisni stena", "perineum"] },
  { chapterSlug: "ch-aesth-botox-fillers", keywords: ["botulotoxin", "vypln", "fill"] },
  { chapterSlug: "ch-aesth-lipo", keywords: ["liposuk"] },
  { chapterSlug: "ch-aesth-abdominoplasty", keywords: ["abdominoplast"] },
  { chapterSlug: "ch-aesth-breast-aesth", keywords: ["augment", "reduk", "modelac"] },
  { chapterSlug: "ch-aesth-face", keywords: ["facelift", "blefar", "brow", "rhino", "oblicej", "nos"] },
  { chapterSlug: "ch-aesth-lasers", keywords: ["laser", "resurfacing", "peeling", "dermabra"] },
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
  const dryRun = process.env.DRY_RUN === "1";

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

  for (const ch of CHAPTERS) {
    const domainId = domainBySlug.get(ch.domainSlug) || null;
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
  }

  const chapterTopics = await prisma.topic.findMany({
    where: { slug: { startsWith: "ch-" } },
    select: { id: true, slug: true },
  });
  const chapterIdBySlug = new Map(chapterTopics.map((t) => [t.slug, t.id]));

  const questions = await prisma.question.findMany({
    select: { id: true, title: true, topicId: true, topic: { select: { slug: true } } },
  });

  const movedByChapter = new Map<string, number>();
  let unchanged = 0;
  const unmatched: string[] = [];

  for (const q of questions) {
    if (q.topic?.slug?.startsWith("ch-")) {
      unchanged += 1;
      continue;
    }
    const targetSlug = matchChapterSlug(q.title || "");
    if (!targetSlug) {
      unchanged += 1;
      if (unmatched.length < 50) unmatched.push(q.title || "");
      continue;
    }
    const targetId = chapterIdBySlug.get(targetSlug);
    if (!targetId) {
      unchanged += 1;
      continue;
    }
    if (q.topicId === targetId) {
      unchanged += 1;
      continue;
    }
    if (!dryRun) {
      await prisma.question.update({ where: { id: q.id }, data: { topicId: targetId } });
    }
    movedByChapter.set(targetSlug, (movedByChapter.get(targetSlug) || 0) + 1);
  }

  console.log(dryRun ? "DRY RUN" : "APPLIED");
  console.log("Moved by chapter:");
  for (const [slug, count] of movedByChapter.entries()) {
    console.log(`- ${slug}: ${count}`);
  }
  console.log(`Unchanged: ${unchanged}`);
  if (unmatched.length > 0) {
    console.log("Unmatched (top 50):");
    for (const t of unmatched) console.log(`- ${t}`);
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
