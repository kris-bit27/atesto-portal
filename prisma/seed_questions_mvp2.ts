import prisma from "@/lib/prisma";
import { ContentKind, ContentStatus, SourceType } from "@prisma/client";

const PLACEHOLDER_HTML =
  "<p><strong>Osnova:</strong></p><ul><li>Definice</li><li>Etiologie / patofyziologie</li><li>Klinický obraz</li><li>Diagnostika</li><li>Léčba (konzervativní / chirurgická)</li><li>Komplikace</li></ul>";

const SPECIALTY = {
  slug: "plastic-surgery",
  title: "Plastic Surgery",
  order: 1,
};

const DOMAINS = [
  { slug: "foundations", title: "Foundations", order: 1 },
  { slug: "hand", title: "Hand Surgery", order: 2 },
  { slug: "burns", title: "Burns", order: 3 },
  { slug: "reconstruction", title: "Reconstruction", order: 4 },
  { slug: "oncology", title: "Oncology", order: 5 },
  { slug: "aesthetics", title: "Aesthetics", order: 6 },
  { slug: "congenital", title: "Congenital", order: 7 },
  { slug: "periop", title: "Perioperative Care", order: 8 },
];

const CATEGORIES = [
  { slug: "foundations", title: "Foundations", order: 1 },
  { slug: "hand", title: "Hand Surgery", order: 2 },
  { slug: "burns", title: "Burns", order: 3 },
  { slug: "reconstruction", title: "Reconstruction", order: 4 },
  { slug: "oncology", title: "Oncology", order: 5 },
  { slug: "aesthetics", title: "Aesthetics", order: 6 },
  { slug: "congenital", title: "Congenital", order: 7 },
  { slug: "periop", title: "Perioperative Care", order: 8 },
  { slug: "microsurgery", title: "Microsurgery", order: 9 },
];

const SUBCATEGORIES = [
  { slug: "hand-cts", title: "CTS", order: 1, categorySlug: "hand" },
  { slug: "hand-cubital", title: "Kubitální kanál", order: 2, categorySlug: "hand" },
  { slug: "hand-guyon", title: "Guyon", order: 3, categorySlug: "hand" },
];

const TOPICS = [
  {
    slug: "ch-foundations-wound-healing",
    title: "Hojení ran a jizvy",
    order: 10,
    domainSlug: "foundations",
    questions: [
      "Fáze hojení rány, růstové faktory",
      "Hypertrofická jizva vs keloid",
      "Terapie jizev – silikon, tlak, laser",
      "Primární vs sekundární hojení",
      "Faktory ovlivňující hojení (lokální a systémové)",
      "Dehiscence rány",
      "Infekce rány a biofilm",
      "Chronické rány – klasifikace",
    ],
  },
  {
    slug: "ch-foundations-skin-grafts",
    title: "Kožní štěpy a náhrady",
    order: 11,
    domainSlug: "foundations",
    questions: [
      "STSG vs FTSG – indikace",
      "Odběr štěpu – donor sites",
      "Take štěpu – faktory selhání",
      "Meshování štěpů – indikace",
      "Péče o štěp v pooperačním období",
      "Kontraindikace štěpů",
      "Dermální substituty",
      "Rekonstrukce popálenin štěpy",
    ],
  },
  {
    slug: "ch-foundations-flaps",
    title: "Laloky – principy a klasifikace",
    order: 12,
    domainSlug: "foundations",
    questions: [
      "Random vs axial flap",
      "Perforátorové laloky",
      "Delay fenomén",
      "Klasifikace laloků podle cévního zásobení",
      "Pediklové vs volné laloky",
      "Komplikace laloků a salvage",
      "Angiosomy a perforátory",
      "Monitorace perfuze",
    ],
  },
  {
    slug: "ch-hand-exam",
    title: "Vyšetření ruky a fixace",
    order: 20,
    domainSlug: "hand",
    questions: [
      "Funkční vyšetření šlach",
      "Zásady fixace po úrazu",
      "Zobrazovací metody",
      "Vyšetření citlivosti (2PD, monofilament)",
      "Vyšetření motoriky intrinzických svalů",
      "Algoritmus akutního poranění ruky",
      "Zásady rehabilitace po poranění",
      "Turniket – indikace a rizika",
    ],
  },
  {
    slug: "ch-hand-flexor",
    title: "Poranění flexorů",
    order: 21,
    domainSlug: "hand",
    questions: [
      "Zóny flexorů (I–V)",
      "Primární sutura – indikace",
      "Rehabilitace po suturách",
      "Nejčastější komplikace sutur flexorů",
      "Rekonstrukce flexorů – šlachové štěpy",
      "Trigger finger – patofyziologie a léčba",
      "Jersey finger",
      "Tenolýza",
    ],
  },
  {
    slug: "ch-hand-extensor",
    title: "Poranění extenzorů",
    order: 22,
    domainSlug: "hand",
    questions: [
      "Zóny extenzorů",
      "Mallet finger",
      "Boutonniere deformita",
      "Sutura extenzorů – principy",
      "Sagittal band rupture",
      "Rehabilitace po poranění extenzorů",
      "Central slip injury",
      "Postup u otevřeného poranění",
    ],
  },
  {
    slug: "ch-hand-cts-cubital-guyon",
    title: "Úžinové syndromy HK",
    order: 23,
    domainSlug: "hand",
    questions: [
      "CTS – klinika + EMG",
      "Kubitální kanál",
      "Guyon",
      "Thoracic outlet syndrome – ddg",
      "Méně časté úžiny (pronator teres)",
      "Diferenciální diagnostika neuropatií HK",
      "Chirurgická léčba CTS",
      "Rehabilitace po uvolnění nervu",
    ],
  },
  {
    slug: "ch-burns-acute",
    title: "Popáleniny – akutní péče",
    order: 30,
    domainSlug: "burns",
    questions: [
      "Stanovení rozsahu a hloubky",
      "Popáleninový šok – tekutinová resuscitace",
      "Escharotomie",
      "První pomoc u popálenin",
      "Inhalační trauma",
      "Popáleniny dětí – specifika",
      "Analgezie a sedace",
      "Indikace k překladu do popáleninového centra",
    ],
  },
  {
    slug: "ch-burns-surgery",
    title: "Chirurgická léčba popálenin",
    order: 31,
    domainSlug: "burns",
    questions: [
      "Nekrektomie – indikace a timing",
      "Dočasné kryty",
      "Kožní náhrady",
      "Tangenciální excize",
      "Autotransplantace – mesh vs sheet",
      "Integra a dermální substituty",
      "Donor site management",
      "Rekonstrukce kontraktur",
    ],
  },
  {
    slug: "ch-recon-lower-leg",
    title: "Defekty bérce a nohy",
    order: 40,
    domainSlug: "reconstruction",
    questions: [
      "Defekty distální třetiny bérce",
      "Rekonstrukce hlezna",
      "Diabetická noha",
      "Lokální laloky bérce",
      "Volné laloky u defektů bérce",
      "Osteomyelitida – rekonstrukce",
      "Negativní tlaková terapie",
      "Plánování rekonstrukce podle angiosomů",
    ],
  },
  {
    slug: "ch-onco-melanoma",
    title: "Maligní melanom a sentinel",
    order: 50,
    domainSlug: "oncology",
    questions: [
      "Breslow, Clark, AJCC",
      "Sentinel – indikace",
      "Dispenzarizace",
      "Radikální excize – bezpečnostní lemy",
      "Staging a prognóza",
      "Adjuvantní terapie",
      "Diferenciální diagnostika pigmentových lézí",
      "Follow-up po léčbě",
    ],
  },
  {
    slug: "ch-aesthetics-injectables",
    title: "Botulotoxin a výplně",
    order: 60,
    domainSlug: "aesthetics",
    questions: [
      "BTX – dávkování a anatomie",
      "Výplně – HA vs CaHA",
      "Komplikace – vaskulární okluze",
      "Anatomie obličeje pro aplikaci BTX",
      "Nežádoucí účinky BTX",
      "Volba výplně podle indikace",
      "Postup při vaskulární okluzi",
      "Kombinace BTX a výplní",
    ],
  },
  {
    slug: "ch-congenital-clefts",
    title: "Rozštěpy – léčba a timing",
    order: 70,
    domainSlug: "congenital",
    questions: [
      "Rozštěp rtu – timing",
      "Rozštěp patra – timing",
      "Velofaryngeální insuficience",
      "Sekundární korekce rozštěpů",
      "Logopedie a VPI management",
      "Ortodontická léčba u rozštěpů",
      "Alveolární štěpování – timing",
      "Komplikace operací rozštěpů",
    ],
  },
  {
    slug: "ch-periop-thromboprophylaxis",
    title: "Tromboprofylaxe",
    order: 80,
    domainSlug: "periop",
    questions: [
      "Riziková stratifikace (Caprini)",
      "LMWH – indikace",
      "Diagnostika DVT/PE",
      "Mechanická profylaxe",
      "Rizika krvácení vs trombózy",
      "Perioperační management antikoagulace",
      "Postup při podezření na PE",
      "Monitorace a délka profylaxe",
    ],
  },
];

const slugify = (input: string) => {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const pickCategorySlug = (topicSlug: string, title: string) => {
  const t = `${topicSlug} ${title}`.toLowerCase();
  if (t.includes("hand") || t.includes("ruka")) return "hand";
  if (t.includes("burn") || t.includes("popal")) return "burns";
  if (t.includes("onco") || t.includes("melanom") || t.includes("tumor") || t.includes("nador")) return "oncology";
  if (t.includes("aesth") || t.includes("botulotoxin") || t.includes("vypln") || t.includes("estet")) return "aesthetics";
  if (t.includes("congen") || t.includes("rozstep") || t.includes("kleft")) return "congenital";
  if (t.includes("periop") || t.includes("trombo") || t.includes("dvt") || t.includes("pe")) return "periop";
  if (t.includes("recon") || t.includes("defekt") || t.includes("rekonstruk")) return "reconstruction";
  if (t.includes("flap") || t.includes("lalok") || t.includes("mikro") || t.includes("perfor")) return "microsurgery";
  if (t.includes("found") || t.includes("hojen") || t.includes("step")) return "foundations";
  return "";
};

const pickSubcategorySlug = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("cts") || t.includes("karp")) return "hand-cts";
  if (t.includes("kubit")) return "hand-cubital";
  if (t.includes("guyon")) return "hand-guyon";
  return "";
};

async function main() {
  const specialty = await prisma.specialty.upsert({
    where: { slug: SPECIALTY.slug },
    update: { title: SPECIALTY.title, isActive: true },
    create: {
      slug: SPECIALTY.slug,
      title: SPECIALTY.title,
      order: SPECIALTY.order,
      isActive: true,
    },
  });

  for (const d of DOMAINS) {
    await prisma.domain.upsert({
      where: { slug: d.slug },
      update: { title: d.title, order: d.order, isActive: true },
      create: { slug: d.slug, title: d.title, order: d.order, isActive: true },
    });
  }

  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { title: c.title, order: c.order, isActive: true },
      create: { slug: c.slug, title: c.title, order: c.order, isActive: true },
    });
  }

  const categoryBySlug = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id])
  );

  for (const s of SUBCATEGORIES) {
    const categoryId = categoryBySlug.get(s.categorySlug);
    if (!categoryId) continue;
    await prisma.subcategory.upsert({
      where: { slug: s.slug },
      update: { title: s.title, order: s.order, isActive: true, categoryId },
      create: { slug: s.slug, title: s.title, order: s.order, isActive: true, categoryId },
    });
  }

  const subcategoryBySlug = new Map(
    (await prisma.subcategory.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id])
  );

  const domainBySlug = new Map(
    (await prisma.domain.findMany({ select: { id: true, slug: true } })).map((d) => [d.slug, d.id])
  );

  const topicBySlug = new Map<string, { id: string; title: string }>();
  let topicsCreated = 0;
  let topicsUpdated = 0;

  for (const t of TOPICS) {
    const domainId = domainBySlug.get(t.domainSlug);
    if (!domainId) {
      throw new Error(`Missing domain for slug: ${t.domainSlug}`);
    }

    const existing = await prisma.topic.findUnique({ where: { slug: t.slug }, select: { id: true } });
    if (existing) topicsUpdated += 1;
    else topicsCreated += 1;

    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        order: t.order,
        specialtyId: specialty.id,
        domainId,
      },
      create: {
        slug: t.slug,
        title: t.title,
        order: t.order,
        specialtyId: specialty.id,
        domainId,
      },
      select: { id: true, title: true },
    });

    topicBySlug.set(t.slug, topic);
  }

  let questionsCreatedTotal = 0;
  const perTopicCreated = new Map<string, number>();

  for (const t of TOPICS) {
    const topic = topicBySlug.get(t.slug);
    if (!topic) continue;

    const questionData = t.questions.map((title) => {
      const slug = `${t.slug}-${slugify(title)}`;
      return {
        title,
        slug,
        topicId: topic.id,
        specialtyId: specialty.id,
        status: ContentStatus.DRAFT,
        kind: ContentKind.ANSWER,
        source: SourceType.CORE,
        contentHtml: PLACEHOLDER_HTML,
      };
    });

    const result = await prisma.question.createMany({
      data: questionData,
      skipDuplicates: true,
    });

    perTopicCreated.set(t.slug, result.count);
    questionsCreatedTotal += result.count;
  }

  let questionsCategorized = 0;
  const existingQuestions = await prisma.question.findMany({
    select: {
      id: true,
      title: true,
      categoryId: true,
      subcategoryId: true,
      topic: { select: { slug: true, title: true } },
    },
  });

  for (const q of existingQuestions) {
    if (q.categoryId && q.subcategoryId) continue;
    const topicSlug = q.topic?.slug || "";
    const topicTitle = q.topic?.title || "";
    const catSlug = pickCategorySlug(topicSlug, `${topicTitle} ${q.title}`);
    const subSlug = pickSubcategorySlug(q.title);
    const categoryId = catSlug ? categoryBySlug.get(catSlug) : undefined;
    const subcategoryId = subSlug ? subcategoryBySlug.get(subSlug) : undefined;

    if (!categoryId && !subcategoryId) continue;
    const data: { categoryId?: string | null; subcategoryId?: string | null } = {};
    if (!q.categoryId && categoryId) data.categoryId = categoryId;
    if (!q.subcategoryId && subcategoryId) data.subcategoryId = subcategoryId;
    if (Object.keys(data).length === 0) continue;
    await prisma.question.update({ where: { id: q.id }, data });
    questionsCategorized += 1;
  }

  console.log(`Topics: ${topicsCreated} created, ${topicsUpdated} updated`);
  console.log(`Questions created: ${questionsCreatedTotal}`);
  console.log("Questions created per topic:");
  for (const t of TOPICS) {
    const count = perTopicCreated.get(t.slug) ?? 0;
    console.log(`- ${t.slug}: ${count}`);
  }
  console.log(`Questions categorized: ${questionsCategorized}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
