import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCategory = {
  slug: string;
  title: string;
  order: number;
};

type SeedSubcategory = {
  slug: string;
  title: string;
  order: number;
  categorySlug: string;
};

const CATEGORIES: SeedCategory[] = [
  { slug: "foundations", title: "Základy", order: 1 },
  { slug: "reconstruction", title: "Rekonstrukce", order: 2 },
  { slug: "hand", title: "Chirurgie ruky", order: 3 },
  { slug: "congenital", title: "Vrozené vady", order: 4 },
  { slug: "burns", title: "Popáleniny & termická poranění", order: 5 },
  { slug: "oncology", title: "Onkologie kůže & prsu", order: 6 },
  { slug: "aesthetics", title: "Estetika", order: 7 },
  { slug: "misc", title: "Unsorted", order: 999 },
];

const SUBCATEGORIES: SeedSubcategory[] = [
  { slug: "anatomie", title: "Anatomie", order: 1, categorySlug: "foundations" },
  { slug: "fyziologie-hojeni", title: "Fyziologie & hojení", order: 2, categorySlug: "foundations" },
  { slug: "anestezie-periop-pece", title: "Anestezie & periop péče", order: 3, categorySlug: "foundations" },
  { slug: "tromboprofylaxe-komplikace", title: "Tromboprofylaxe & komplikace", order: 4, categorySlug: "foundations" },

  { slug: "laloky-angiosomy", title: "Laloky & angiosomy", order: 1, categorySlug: "reconstruction" },
  { slug: "kozni-stepy-nahrady", title: "Kožní štěpy & náhrady", order: 2, categorySlug: "reconstruction" },
  { slug: "volne-laloky-mikrochirurgie", title: "Volné laloky & mikrochirurgie", order: 3, categorySlug: "reconstruction" },
  { slug: "kryti-defektu-dk", title: "Krytí defektů DK", order: 4, categorySlug: "reconstruction" },

  { slug: "vysetreni-rehabilitace", title: "Vyšetření & rehabilitace", order: 1, categorySlug: "hand" },
  { slug: "slachy", title: "Šlachy", order: 2, categorySlug: "hand" },
  { slug: "nervy", title: "Nervy", order: 3, categorySlug: "hand" },
  { slug: "kosti-klouby", title: "Kosti & klouby", order: 4, categorySlug: "hand" },
  { slug: "infekce", title: "Infekce", order: 5, categorySlug: "hand" },
  { slug: "degenerativni", title: "Degenerativní onemocnění", order: 6, categorySlug: "hand" },
  { slug: "dupuytren", title: "Dupuytren", order: 7, categorySlug: "hand" },
  { slug: "uzinove-syndromy", title: "Úžinové syndromy", order: 8, categorySlug: "hand" },

  { slug: "ruka", title: "Ruka", order: 1, categorySlug: "congenital" },
  { slug: "rozstepy", title: "Rozštěpy", order: 2, categorySlug: "congenital" },
  { slug: "ucho", title: "Ucho", order: 3, categorySlug: "congenital" },
  { slug: "prs-hrudni-stena", title: "Prs & hrudní stěna", order: 4, categorySlug: "congenital" },
  { slug: "genital", title: "Genitál", order: 5, categorySlug: "congenital" },
  { slug: "kraniofacialni", title: "Kraniofaciální", order: 6, categorySlug: "congenital" },

  { slug: "prvni-pomoc", title: "První pomoc", order: 1, categorySlug: "burns" },
  { slug: "sok-akutni-nemoc", title: "Šok & akutní nemoc z popálení", order: 2, categorySlug: "burns" },
  { slug: "chirurgicka-lecba", title: "Chirurgická léčba", order: 3, categorySlug: "burns" },
  { slug: "sekundarni-rekonstrukce", title: "Sekundární rekonstrukce", order: 4, categorySlug: "burns" },
  { slug: "omrzliny", title: "Omrzliny", order: 5, categorySlug: "burns" },
  { slug: "elektricke-chemicke-inhalacni", title: "Elektrické/chemické/inhalační", order: 6, categorySlug: "burns" },

  { slug: "melanom", title: "Melanom", order: 1, categorySlug: "oncology" },
  { slug: "nemelanomove-nadory", title: "Nemelanomové nádory", order: 2, categorySlug: "oncology" },
  { slug: "benigni-leze-malformace", title: "Benigní léze & cévní malformace", order: 3, categorySlug: "oncology" },
  { slug: "prs-brca-bia-alcl", title: "Prs (BRCA/BIA-ALCL)", order: 4, categorySlug: "oncology" },

  { slug: "botulotoxin-vyplne", title: "Botulotoxin & výplně", order: 1, categorySlug: "aesthetics" },
  { slug: "lasery-peeling", title: "Lasery & peeling", order: 2, categorySlug: "aesthetics" },
  { slug: "liposukce", title: "Liposukce", order: 3, categorySlug: "aesthetics" },
  { slug: "face-eye-nose", title: "Face/eye/nose", order: 4, categorySlug: "aesthetics" },
  { slug: "postbariatrie", title: "Postbariatrie", order: 5, categorySlug: "aesthetics" },

  { slug: "unsorted", title: "Unsorted", order: 1, categorySlug: "misc" },
];

const normalize = (input: string) =>
  input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const includesAny = (text: string, keywords: string[]) => keywords.some((k) => text.includes(k));

const detectAssignment = (text: string) => {
  const t = normalize(text);

  const matchesHand = () => {
    if (includesAny(t, ["vysetreni ruky", "rehabilit", "protet", "fixace"])) return { category: "hand", sub: "vysetreni-rehabilitace" };
    if (includesAny(t, ["flexor", "extenzor", "slach"])) return { category: "hand", sub: "slachy" };
    if (includesAny(t, ["nerv", "plexus", "neurom"])) return { category: "hand", sub: "nervy" };
    if (includesAny(t, ["osteosynt", "kloub", "zapesti", "fraktur"])) return { category: "hand", sub: "kosti-klouby" };
    if (includesAny(t, ["infekce", "felon", "paronych", "tenosynovit"])) return { category: "hand", sub: "infekce" };
    if (includesAny(t, ["artroza", "rhizartr"])) return { category: "hand", sub: "degenerativni" };
    if (includesAny(t, ["dupuytren"])) return { category: "hand", sub: "dupuytren" };
    if (includesAny(t, ["cts", "kubital", "guyon", "uzin"])) return { category: "hand", sub: "uzinove-syndromy" };
    return null;
  };

  const matchesBurns = () => {
    if (!t.includes("popalen") && !includesAny(t, ["omrzlin", "elektr", "chemick", "inhala", "radiac"])) return null;
    if (includesAny(t, ["prvni pomoc"])) return { category: "burns", sub: "prvni-pomoc" };
    if (includesAny(t, ["sok", "akutni nemoc"])) return { category: "burns", sub: "sok-akutni-nemoc" };
    if (includesAny(t, ["sekundarni rekonstrukce"])) return { category: "burns", sub: "sekundarni-rekonstrukce" };
    if (includesAny(t, ["omrzlin"])) return { category: "burns", sub: "omrzliny" };
    if (includesAny(t, ["elektr", "chemick", "inhala", "radiac"])) return { category: "burns", sub: "elektricke-chemicke-inhalacni" };
    if (t.includes("popalen")) return { category: "burns", sub: "chirurgicka-lecba" };
    return null;
  };

  const matchesOncology = () => {
    if (includesAny(t, ["melanom"])) return { category: "oncology", sub: "melanom" };
    if (includesAny(t, ["prekancer", "bazaliom", "spinaliom", "nemelanom"])) return { category: "oncology", sub: "nemelanomove-nadory" };
    if (includesAny(t, ["nevy", "malformace", "cevni"])) return { category: "oncology", sub: "benigni-leze-malformace" };
    if (includesAny(t, ["brca", "bia-alcl", "nadory prsu"])) return { category: "oncology", sub: "prs-brca-bia-alcl" };
    return null;
  };

  const matchesAesthetics = () => {
    if (includesAny(t, ["botulotoxin", "vyplne", "nite"])) return { category: "aesthetics", sub: "botulotoxin-vyplne" };
    if (includesAny(t, ["laser", "peeling", "dermabraze"])) return { category: "aesthetics", sub: "lasery-peeling" };
    if (includesAny(t, ["liposukce"])) return { category: "aesthetics", sub: "liposukce" };
    if (includesAny(t, ["rhinoplast", "blefaroplast", "face-lift", "brow"])) return { category: "aesthetics", sub: "face-eye-nose" };
    if (includesAny(t, ["postbariatr", "abdominoplast", "dermolipekt"])) return { category: "aesthetics", sub: "postbariatrie" };
    return null;
  };

  const matchesCongenital = () => {
    if (includesAny(t, ["rozstep"])) return { category: "congenital", sub: "rozstepy" };
    if (includesAny(t, ["boltce", "ucho"])) return { category: "congenital", sub: "ucho" };
    if (includesAny(t, ["poland", "tuberoz", "prs"]) && includesAny(t, ["vada", "asymetr"])) {
      return { category: "congenital", sub: "prs-hrudni-stena" };
    }
    if (includesAny(t, ["hypospad", "epispad", "extrof", "genital"])) return { category: "congenital", sub: "genital" };
    if (includesAny(t, ["kranio", "kraniosynost"])) return { category: "congenital", sub: "kraniofacialni" };
    if (includesAny(t, ["vrozene vady ruky", "omt 2014", "omt"])) return { category: "congenital", sub: "ruka" };
    return null;
  };

  const matchesReconstruction = () => {
    if (includesAny(t, ["lalok", "angiosom", "delay"])) return { category: "reconstruction", sub: "laloky-angiosomy" };
    if (includesAny(t, ["kozni transplant", "step"])) return { category: "reconstruction", sub: "kozni-stepy-nahrady" };
    if (includesAny(t, ["volne lalok", "non-reflow", "mikrochir"])) {
      return { category: "reconstruction", sub: "volne-laloky-mikrochirurgie" };
    }
    if (t.includes("defekt") && includesAny(t, ["berec", "hlez", "noha", "diabet"])) {
      return { category: "reconstruction", sub: "kryti-defektu-dk" };
    }
    return null;
  };

  const matchesFoundations = () => {
    if (includesAny(t, ["anatomie"])) return { category: "foundations", sub: "anatomie" };
    if (includesAny(t, ["hojeni", "jizv", "kryti ran"])) return { category: "foundations", sub: "fyziologie-hojeni" };
    if (includesAny(t, ["anestezie"])) return { category: "foundations", sub: "anestezie-periop-pece" };
    if (includesAny(t, ["tromboprof", "dvt", "pe"])) return { category: "foundations", sub: "tromboprofylaxe-komplikace" };
    return null;
  };

  const priority = [matchesHand, matchesBurns, matchesOncology, matchesAesthetics, matchesCongenital, matchesReconstruction, matchesFoundations];
  for (const fn of priority) {
    const match = fn();
    if (match) return match;
  }

  return { category: "misc", sub: "unsorted" };
};

async function main() {
  let categoriesCreated = 0;
  let categoriesUpdated = 0;
  let subcategoriesCreated = 0;
  let subcategoriesUpdated = 0;

  for (const c of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: c.slug }, select: { id: true } });
    if (existing) categoriesUpdated += 1;
    else categoriesCreated += 1;
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
    const existing = await prisma.subcategory.findUnique({ where: { slug: s.slug }, select: { id: true } });
    if (existing) subcategoriesUpdated += 1;
    else subcategoriesCreated += 1;
    await prisma.subcategory.upsert({
      where: { slug: s.slug },
      update: { title: s.title, order: s.order, isActive: true, categoryId },
      create: { slug: s.slug, title: s.title, order: s.order, isActive: true, categoryId },
    });
  }

  const subcategoryBySlug = new Map(
    (await prisma.subcategory.findMany({ select: { id: true, slug: true } })).map((s) => [s.slug, s.id])
  );

  const questions = await prisma.question.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      topic: { select: { title: true, slug: true } },
    },
  });

  let questionsAssigned = 0;
  let questionsUnassigned = 0;

  for (const q of questions) {
    const text = `${q.title} ${q.slug} ${q.topic?.title ?? ""} ${q.topic?.slug ?? ""}`;
    const match = detectAssignment(text);
    const categoryId = categoryBySlug.get(match.category) || null;
    const subcategoryId = match.sub ? subcategoryBySlug.get(match.sub) || null : null;

    if (!categoryId) {
      questionsUnassigned += 1;
      continue;
    }

    await prisma.question.update({
      where: { id: q.id },
      data: { categoryId, subcategoryId },
    });
    questionsAssigned += 1;
  }

  console.log(`Categories: ${categoriesCreated} created, ${categoriesUpdated} updated`);
  console.log(`Subcategories: ${subcategoriesCreated} created, ${subcategoriesUpdated} updated`);
  console.log(`Questions assigned: ${questionsAssigned}`);
  console.log(`Questions unassigned: ${questionsUnassigned}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
