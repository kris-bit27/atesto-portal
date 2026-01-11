import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // pryč diakritika
    .toLowerCase()
    .replace(/&/g, " a ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

type TopicSpec = {
  order: number;
  title: string;
  slug?: string;
  questions: string[];
};

async function createTopicWithQuestions(spec: TopicSpec) {
  const topic = await prisma.topic.create({
    data: {
      title: spec.title,
      slug: spec.slug || slugify(spec.title),
      order: spec.order,
    },
  });

  for (const title of spec.questions) {
    await prisma.question.create({
      data: {
        topicId: topic.id,
        title,
        slug: slugify(title),
        status: "DRAFT",
        contentHtml: "",
      },
    });
  }

  return topic;
}

async function main() {
  console.log("🌱 Seeduji Atesto portál (všechny okruhy)…");

  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();

  const topics: TopicSpec[] = [
    // =========================
    // 1) Obecná plastická chirurgie, vrozené vady (2019)
    // =========================
    {
      order: 1,
      title: "Obecná plastická chirurgie, vrozené vady",
      slug: "okruh-1-obecna-plasticka-chirurgie-vrozene-vady",
      questions: [
        "Anatomie ruky a horní končetiny",
        "Anatomie bérce a nohy",
        "Lymfatický systém, anatomie, funkce. Lymfedém – definice, patofyziologie, konzervativní a chirurgická léčba",
        "Základy fyziologického operování, magnifikace, turniket, implantáty v plastické chirurgii. Mikrochirurgie. Psychologické aspekty",
        "Tromboprofylaxe v plastické chirurgii, stratifikace rizika, indikace, timing. DVT/PE – diagnostika a léčba",
        "Místní a svodná anestezie v plastické chirurgii – indikace, pravidla, anestetika, komplikace (alergie, anafylaxe, i.v. aplikace)",
        "Základy hojení ran, patofyziologie, léčba. Krytí ran. Chronické defekty. Jizvy – prevence a léčba",
        "Kožní transplantace – druhy štěpů, odběr, indikace, pooperační péče",
        "Alogenní transplantace (VCA) – principy, indikace, etické aspekty",
        "Transplantace tuku (lipofilling) – principy, indikace. Tkáňová expanze – principy, indikace",
        "Laloky – klasifikace, cévní zásobení, perforátory, angiosomy, delay fenomén, monitorace",
        "Místní, regionální a vzdálené laloky – použití, anatomie, komplikace",
        "Volné laloky – indikace, nejčastější laloky, pooperační sledování, non-reflow, přenos motorické jednotky",
        "Mikrochirurgické ošetření poranění periferních nervů – sutury, štěpy, vodiče, timing, neuromy",
        "Kraniofaciální syndromy, kraniosynostózy (syndromové, nesyndromové)",
        "Rozštěpy – embryologie, epidemiologie, genetika, anatomie, rozdělení",
        "Rozštěp rtu – operační léčba a timing. Sekundární operace včetně nosu",
        "Rozštěp patra – léčba a timing. Velofaryngeální dysfunkce. Ortodoncie/ortognát u rozštěpů",
        "Vady boltce (vrozené/získané), odstálé boltce, rekonstrukce boltce – indikace, techniky, timing",
        "Vady prsu a hrudní stěny – Polandův sy, asymetrie, tuberózní prsy, rekonstrukční možnosti",
        "Vady zevního genitálu – hypospadie/epispadie/extrofie – embryologie, anatomie, léčba, timing",
        "Vrozené vady ruky – klasifikace OMT 2014, embryologie, etiologie, prevence",
        "Vrozené vady ruky – poruchy formace a diferenciace – léčba, timing",
        "Vrozené vady ruky – duplikace, poruchy růstu, zaškrceniny, generalizované abnormality – léčba, timing",
      ],
    },

    // =========================
    // 2) Rekonstrukční plastická chirurgie, nádory, termická poranění
    // =========================
    {
      order: 2,
      title: "Rekonstrukční plastická chirurgie, nádory, termická poranění",
      slug: "okruh-2-rekonstrukcni-nadory-popaleniny",
      questions: [
        "Rekonstrukce měkkých tkání čela a skalpu – anatomie, možnosti a techniky",
        "Rekonstrukce víček a periorbitální oblasti – ptóza, ektropium, techniky",
        "Rekonstrukce nosu – historie, anatomie, techniky, sedlovitý nos",
        "Rekonstrukce tváře, maxilly a mandibuly – implantáty, kraniofaciální protetika",
        "Rekonstrukce horního a dolního rtu",
        "Paréza n. facialis – rekonstrukční postupy, indikace",
        "Benigní a maligní nádory prsu – základy léčby, BRCA, BIA-ALCL",
        "Profylaktická mastektomie a možnosti rekonstrukce (primární/odložená)",
        "Rekonstrukce prsu implantátem – indikace, postupy, rekonstrukce NAC",
        "Rekonstrukce prsu autologní tkání – stopkované/volné laloky, lipografting",
        "Vady stěny břišní – rekonstrukce. Rekonstrukce perinea",
        "Transsexualismus – definice, diagnostika. F-M a M-F operace",
        "Dekubity – patofyziologie, prevence, indikace a možnosti chirurgické léčby",
        "Replantace a revaskularizace – indikace/kontraindikace, ischemický čas, transport amputátu, centra v ČR, klasifikace",
        "Defekty měkkých tkání horní a střední třetiny bérce – anatomie, rekonstrukce",
        "Defekty měkkých tkání dolní třetiny bérce – anatomie, rekonstrukce",
        "Defekty nohy a hlezna – rekonstrukce, diabetická noha",
        "Nezhoubné nádory kůže, pigmentové névy, cévní tumory/malformace – diagnostika a léčba",
        "Nemelanomové kožní nádory, prekancerózy – diagnostika a léčba",
        "Maligní melanom – klasifikace, prevence, sentinelová uzlina – indikace a princip",
        "Popáleniny – definice a klasifikace dle rozsahu/hloubky/mechanismu, stanovení rozsahu",
        "První pomoc u popálenin – transport, vstupní ošetření, uvolňující nářezy",
        "Akutní nemoc z popálení – šok a principy léčby",
        "Chirurgická léčba popálenin – nekrektomie, autotransplantace, dočasné kryty, kožní náhrady",
        "Elektrické/chemické poranění, crush/blast, inhalační trauma, radiační poranění",
        "Sekundární rekonstrukce po popáleninách – rehabilitace",
        "Omrzliny – diagnostika, klasifikace, léčba",
      ],
    },

    // =========================
    // 3) Chirurgie ruky, estetická chirurgie
    // =========================
    {
      order: 3,
      title: "Chirurgie ruky, estetická chirurgie",
      slug: "okruh-3-ruka-estetika",
      questions: [
        "Vyšetření ruky (klinické, zobrazovací). Rehabilitace, protetika, pravidla fixace",
        "Poranění flexorů ruky – diagnostika a léčba, rehabilitace",
        "Poranění extenzorů ruky – diagnostika a léčba, rehabilitace",
        "Rekonstrukce šlach ruky – timing, indikace, šlachový štěp, transpozice",
        "Poranění periferních nervů HK – parézy, brachiální plexus, zásady ošetření, dlahování, rekonstrukce, rehabilitace",
        "Poranění kostí a kloubů ruky a zápěstí – osteosyntézy, komplikace",
        "Zásady ošetření poraněné ruky – krytí defektů, poranění špičky prstu, laloky, amputace",
        "Rekonstrukce prstů a palce – indikace, přenos prstů z nohy, rekonstrukce úchopu",
        "Kompartment syndrom, Volkmannova kontraktura, CRPS",
        "Úžinové syndromy HK – CTS, kubitální kanál, Guyon – diagnostika, léčba, EMG",
        "Tenosynovitidy, de Quervain, ganglion. Revmatická ruka – rekonstrukce",
        "Dupuytrenova nemoc – diagnostika, indikace, možnosti léčby",
        "Infekce ruky – felon, paronychium, purulentní artritida, tenosynovitida",
        "Degenerativní onemocnění ruky – artróza, náhrady, rhizartróza – léčba",
        "Face-lift – anatomie, indikace, techniky, komplikace",
        "Blefaroplastika – postupy, rizika, komplikace",
        "Forehead/brow lift, zvětšení rtů, alopecie, transplantace vlasů",
        "Rhinoplastika – otevřená/zavřená, analýza, sekundární rhinoplastika, komplikace",
        "Operace prsů – redukce, modelace, komplikace, gynekomastie",
        "Operace prsů – augmentace, výběr implantátu, komplikace, sekundární augmentace",
        "Abdominoplastika, miniabdominoplastika",
        "Postbariatrická plastická chirurgie – dermolipektomie, belt lipektomie, valy stehen a paží",
        "Liposukce – indikace, kontraindikace, komplikace",
        "Estetické úpravy genitálu – techniky, indikace, komplikace",
        "Lasery a fyzikální metody v estetice – resurfacing, peeling, dermabraze",
        "Botulotoxin, výplně, komplikace. Závěsné metody (nitě, háčky)",
      ],
    },
  ];

  for (const t of topics) {
    await createTopicWithQuestions(t);
    console.log(`✅ ${t.order}. ${t.title}`);
  }

  console.log("🎉 Hotovo. Všechny okruhy nahrány.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
