// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Idempotent seed:
 * - Topics: upsert by slug
 * - Questions: upsert by slug (unique)
 *
 * Assumes your Prisma models:
 * Topic:    { id, title, slug(unique), order, questions[] }
 * Question: { id, topicId, title, slug(unique), status, contentHtml, createdAt, updatedAt }
 */

type SeedQuestion = {
  title: string;
  slug: string;
};

type SeedTopic = {
  title: string;
  slug: string;
  order: number;
  questions: SeedQuestion[];
};

const topics: SeedTopic[] = [
  // ===== A) Obecná plastická chirurgie + vrozené vady =====
  {
    title: "A1 Základy, perioperační péče, komplikace",
    slug: "a1-zaklady-perioperacni-pece-komplikace",
    order: 101,
    questions: [
      { title: "A1-1 Hojení ran, krytí ran, jizvy", slug: "a1-1-hojeni-ran-kryti-ran-jizvy" },
      { title: "A1-2 Tromboembolická prevence (DVT/PE)", slug: "a1-2-tromboembolicka-prevence-dvt-pe" },
      { title: "A1-3 Místní a svodná anestezie v plastice + komplikace", slug: "a1-3-mistni-a-svodna-anestezie-komplikace" },
      { title: "A1-4 Fyziologické operování, magnifikace, turniket, implantáty, psychologické aspekty", slug: "a1-4-fyziologicke-operovani-magnifikace-turniket-implantaty-psycho" },
    ],
  },
  {
    title: "A2 Rekonstrukční principy",
    slug: "a2-rekonstrukcni-principy",
    order: 102,
    questions: [
      { title: "A2-1 Kožní transplantace", slug: "a2-1-kozni-transplantace" },
      { title: "A2-2 Lipofilling / autologní tuk", slug: "a2-2-lipofilling-autologni-tuk" },
      { title: "A2-3 Tkánová expanze", slug: "a2-3-tkanova-expanze" },
      { title: "A2-4 Alogenní transplantace (VCA)", slug: "a2-4-alogenni-transplantace-vca" },
    ],
  },
  {
    title: "A3 Laloky a cévní zásobení",
    slug: "a3-laloky-a-cevni-zasobeni",
    order: 103,
    questions: [
      { title: "A3-1 Klasifikace laloků, perforátory, angiosomy, delay, monitorace", slug: "a3-1-klasifikace-laloku-perforatory-angiosomy-delay-monitorace" },
      { title: "A3-2 Místní/regionální/vzdálené laloky", slug: "a3-2-mistni-regionalni-vzdalene-laloky" },
      { title: "A3-3 Volné laloky, non-reflow, monitoring, motorická jednotka", slug: "a3-3-volne-laloky-nonreflow-monitoring-motoricka-jednotka" },
    ],
  },
  {
    title: "A4 Anatomie a systémové okruhy",
    slug: "a4-anatomie-a-systemove-okruhy",
    order: 104,
    questions: [
      { title: "A4-1 Anatomie HK (ruka)", slug: "a4-1-anatomie-hk-ruka" },
      { title: "A4-2 Anatomie DK (bérec/noha)", slug: "a4-2-anatomie-dk-berec-noha" },
      { title: "A4-3 Lymfatický systém + lymfedém", slug: "a4-3-lymfaticky-system-lymfedem" },
    ],
  },
  {
    title: "A5 Periferní nervy – základy rekonstrukce",
    slug: "a5-periferni-nervy-zaklady-rekonstrukce",
    order: 105,
    questions: [
      { title: "A5-1 Sutury/štěpy/vodiče, timing, neuromy", slug: "a5-1-sutury-stepy-vodice-timing-neuromy" },
    ],
  },
  {
    title: "A6 Kraniofaciál + rozštěpy",
    slug: "a6-kraniofacial-rozstepy",
    order: 106,
    questions: [
      { title: "A6-1 Kraniofaciální syndromy / kraniosynostózy", slug: "a6-1-kraniofacialni-syndromy-kraniosynostozy" },
      { title: "A6-2 Rozštěpy – embryologie/genetika/dělení", slug: "a6-2-rozstepy-embryologie-genetika-deleni" },
      { title: "A6-3 Rozštěp rtu + sekundární korekce vč. nosu", slug: "a6-3-rozstep-rtu-sekundarni-korekce-nosu" },
      { title: "A6-4 Rozštěp patra, VPI, ortodoncie/ortognátní timing", slug: "a6-4-rozstep-patra-vpi-ortodoncie-ortognatni-timing" },
    ],
  },
  {
    title: "A7 Vrozené vady (boltce/prsy/genitál/ruka)",
    slug: "a7-vrozene-vady",
    order: 107,
    questions: [
      { title: "A7-1 Boltce", slug: "a7-1-boltce" },
      { title: "A7-2 Prsy/hrudník (Poland, tuberózní, asymetrie)", slug: "a7-2-prsy-hrudnik-poland-tuberozni-asymetrie" },
      { title: "A7-3 Zevní genitál (hypospadie/epispadie/extrofie)", slug: "a7-3-zevni-genital-hypospadie-epispadie-extrofie" },
      { title: "A7-4 Vrozené vady ruky – klasifikace/etiologie", slug: "a7-4-vrozene-vady-ruky-klasifikace-etiologie" },
      { title: "A7-5 Vady ruky: poruchy formace/diferenciace", slug: "a7-5-vady-ruky-poruchy-formace-diferenciace" },
      { title: "A7-6 Vady ruky: duplikace/poruchy růstu/zaškrceniny/generalizované", slug: "a7-6-vady-ruky-duplikace-poruchy-rustu-zaskrceniny-generalizovane" },
    ],
  },

  // ===== B) Rekonstrukční plastika + nádory + termická poranění =====
  {
    title: "B1 Hlava a krk",
    slug: "b1-hlava-a-krk",
    order: 201,
    questions: [
      { title: "B1-1 Čelo a skalp", slug: "b1-1-celo-a-skalp" },
      { title: "B1-2 Víčka/periorbita", slug: "b1-2-vicka-periorbita" },
      { title: "B1-3 Nos", slug: "b1-3-nos" },
      { title: "B1-4 Tvář/maxilla/mandibula + implantáty/protetika", slug: "b1-4-tvar-maxilla-mandibula-implantaty-protetika" },
      { title: "B1-5 Horní a dolní ret", slug: "b1-5-horni-a-dolni-ret" },
      { title: "B1-6 Paréza n. facialis", slug: "b1-6-pareza-n-facialis" },
    ],
  },
  {
    title: "B2 Prs – onko + rekonstrukce",
    slug: "b2-prs-onko-rekonstrukce",
    order: 202,
    questions: [
      { title: "B2-1 Nádory prsu, BRCA, BIA-ALCL", slug: "b2-1-nadory-prsu-brca-bia-alcl" },
      { title: "B2-2 Profylaktická mastektomie + rekonstrukce", slug: "b2-2-profylakticka-mastektomie-rekonstrukce" },
      { title: "B2-3 Rekonstrukce implantátem + NAC", slug: "b2-3-rekonstrukce-implantatem-nac" },
      { title: "B2-4 Rekonstrukce autologní tkání + lipografting", slug: "b2-4-rekonstrukce-autologni-tkani-lipografting" },
    ],
  },
  {
    title: "B3 Trup/perineum",
    slug: "b3-trup-perineum",
    order: 203,
    questions: [{ title: "B3-1 Břišní stěna + perineum", slug: "b3-1-brisni-stena-perineum" }],
  },
  {
    title: "B4 Gender chirurgie",
    slug: "b4-gender-chirurgie",
    order: 204,
    questions: [{ title: "B4-1 Transsexualismus F→M, M→F", slug: "b4-1-transsexualismus-fm-mf" }],
  },
  {
    title: "B5 Chronické defekty",
    slug: "b5-chronicke-defekty",
    order: 205,
    questions: [{ title: "B5-1 Dekubity", slug: "b5-1-dekubity" }],
  },
  {
    title: "B6 Replantace/Revaskularizace",
    slug: "b6-replantace-revaskularizace",
    order: 206,
    questions: [
      {
        title: "B6-1 Indikace, ischemie, transport, centra v ČR, klasifikace amputací",
        slug: "b6-1-replantace-indikace-ischemie-transport-centra-klasifikace",
      },
    ],
  },
  {
    title: "B7 DK – měkké tkáně",
    slug: "b7-dk-mekke-tkane",
    order: 207,
    questions: [
      { title: "B7-1 Bérec (horní/střední třetina)", slug: "b7-1-berec-horni-stredni-tretina" },
      { title: "B7-2 Bérec (dolní třetina)", slug: "b7-2-berec-dolni-tretina" },
      { title: "B7-3 Noha/hlezno + diabetická noha", slug: "b7-3-noha-hlezno-diabeticka-noha" },
    ],
  },
  {
    title: "B8 Kožní nádory",
    slug: "b8-kozni-nadory",
    order: 208,
    questions: [
      { title: "B8-1 Benigní tumory/névy/cévní tumory+malformace", slug: "b8-1-benigni-tumory-nevy-cevni-tumory-malformace" },
      { title: "B8-2 Nemelanomové malignity + prekancerózy", slug: "b8-2-nemelanomove-malignity-prekancerozy" },
      { title: "B8-3 Melanom + sentinelová uzlina", slug: "b8-3-melanom-sentinelova-uzlina" },
    ],
  },
  {
    title: "B9 Popáleniny a energetická poranění",
    slug: "b9-popaleniny-energeticka-poraneni",
    order: 209,
    questions: [
      { title: "B9-1 Popáleniny: klasifikace/rozsah/hloubka", slug: "b9-1-popaleniny-klasifikace-rozsah-hloubka" },
      { title: "B9-2 První pomoc + transport + escharotomie", slug: "b9-2-prvni-pomoc-transport-escharotomie" },
      { title: "B9-3 Nemoc z popálení, šok", slug: "b9-3-nemoc-z-popalenin-sok" },
      { title: "B9-4 Chirurgie: nekrektomie, autotransplantace, dočasné kryty, náhrady", slug: "b9-4-popaleniny-chirurgie-nekrektomie-autotransplantace-docasne-kryty-nahrady" },
      { title: "B9-5 Elektrická/chemická/crush/blast/inhalační/radiace", slug: "b9-5-energeticka-poraneni-elektricka-chemicka-crush-blast-inhalacni-radiace" },
      { title: "B9-6 Sekundární rekonstrukce + rehabilitace", slug: "b9-6-popaleniny-sekundarni-rekonstrukce-rehabilitace" },
      { title: "B9-7 Omrzliny", slug: "b9-7-omrzliny" },
    ],
  },

  // ===== C) Chirurgie ruky + estetická chirurgie =====
  {
    title: "C1 Diagnostika a rehab ruky",
    slug: "c1-diagnostika-rehabilitace-ruky",
    order: 301,
    questions: [
      { title: "C1-1 Vyšetření, zobrazování, rehabilitace, protetika, fixace", slug: "c1-1-vysetreni-zobrazovani-rehabilitace-protetika-fixace" },
    ],
  },
  {
    title: "C2 Šlachy",
    slug: "c2-slachy",
    order: 302,
    questions: [
      { title: "C2-1 Flexory", slug: "c2-1-flexory" },
      { title: "C2-2 Extenzory", slug: "c2-2-extenzory" },
      { title: "C2-3 Rekonstrukce šlach", slug: "c2-3-rekonstrukce-slach" },
    ],
  },
  {
    title: "C3 Nervy + plexus",
    slug: "c3-nervy-plexus",
    order: 303,
    questions: [{ title: "C3-1 Poranění nervů HK, parézy, brachiální plexus, dlahování/elektro", slug: "c3-1-poraneni-nervu-hk-parezy-brachialni-plexus-dlahovani-elektro" }],
  },
  {
    title: "C4 Skelet/klouby",
    slug: "c4-skelet-klouby",
    order: 304,
    questions: [{ title: "C4-1 Kosti/klouby ruky a zápěstí, osteosyntézy, komplikace", slug: "c4-1-kosti-klouby-ruky-zapesti-osteosyntezy-komplikace" }],
  },
  {
    title: "C5 Měkké tkáně + amputace + laloky na ruce",
    slug: "c5-mekke-tkane-amputace-laloky-ruka",
    order: 305,
    questions: [{ title: "C5-1 Defekty, špička prstu, základní laloky, amputace", slug: "c5-1-defekty-spicka-prstu-zakladni-laloky-amputace" }],
  },
  {
    title: "C6 Rekonstrukce funkce",
    slug: "c6-rekonstrukce-funkce",
    order: 306,
    questions: [{ title: "C6-1 Rekonstrukce prstů/palce, úchop, přenos prstů z nohy", slug: "c6-1-rekonstrukce-prstu-palce-uchop-prenos-prstu-z-nohy" }],
  },
  {
    title: "C7 Akutní jednotky",
    slug: "c7-akutni-jednotky",
    order: 307,
    questions: [{ title: "C7-1 Kompartment, Volkmann, CRPS", slug: "c7-1-kompartment-volkmann-crps" }],
  },
  {
    title: "C8 Úžiny",
    slug: "c8-uziny",
    order: 308,
    questions: [{ title: "C8-1 CTS, kubitál, Guyon, EMG", slug: "c8-1-cts-kubital-guyon-emg" }],
  },
  {
    title: "C9 Záněty/degenerace",
    slug: "c9-zanety-degenerace",
    order: 309,
    questions: [
      { title: "C9-1 Tenosynovitidy, de Quervain, ganglion, revmatická ruka", slug: "c9-1-tenosynovitidy-dequervain-ganglion-revmaticka-ruka" },
      { title: "C9-2 Dupuytren", slug: "c9-2-dupuytren" },
      { title: "C9-3 Infekce ruky", slug: "c9-3-infekce-ruky" },
      { title: "C9-4 Degenerativní (artróza, náhrady, rhizartróza)", slug: "c9-4-degenerativni-artroza-nahrady-rhizartróza" },
    ],
  },
  {
    title: "C10 Estetika – obličej",
    slug: "c10-estetika-oblicej",
    order: 310,
    questions: [
      { title: "C10-1 Facelift", slug: "c10-1-facelift" },
      { title: "C10-2 Blefaroplastika", slug: "c10-2-blefaroplastika" },
      { title: "C10-3 Forehead/brow, rty, alopecie, transplantace vlasů", slug: "c10-3-forehead-brow-rty-alopecie-transplantace-vlasu" },
      { title: "C10-4 Rhinoplastika (primární/sekundární, analýza, komplikace)", slug: "c10-4-rhinoplastika-primarni-sekundarni-analyza-komplikace" },
    ],
  },
  {
    title: "C11 Estetika – prsy a trup",
    slug: "c11-estetika-prsy-trup",
    order: 311,
    questions: [
      { title: "C11-1 Redukce/modelace + gynekomastie", slug: "c11-1-redukce-modelace-gynekomastie" },
      { title: "C11-2 Augmentace + sekundární + komplikace + augmentace s modelací", slug: "c11-2-augmentace-sekundarni-komplikace-augmentace-s-modelaci" },
      { title: "C11-3 Abdominoplastika", slug: "c11-3-abdominoplastika" },
      { title: "C11-4 Postbariatrická chirurgie", slug: "c11-4-postbariatricka-chirurgie" },
      { title: "C11-5 Liposukce", slug: "c11-5-liposukce" },
    ],
  },
  {
    title: "C12 Estetika – genitál + miniinvazivní",
    slug: "c12-estetika-genital-miniinvazivni",
    order: 312,
    questions: [
      { title: "C12-1 Estetické úpravy genitálu", slug: "c12-1-esteticke-upravy-genitalu" },
      { title: "C12-2 Lasery a fyzikální metody, resurfacing", slug: "c12-2-lasery-fyzikalni-metody-resurfacing" },
      { title: "C12-3 Botulotoxin, výplně, závěsné metody", slug: "c12-3-botulotoxin-vyplne-zavesne-metody" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding topics + questions...");

  for (const t of topics) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        order: t.order,
      },
      create: {
        title: t.title,
        slug: t.slug,
        order: t.order,
      },
    });

    // upsert each question by unique slug
    for (const q of t.questions) {
      await prisma.question.upsert({
        where: { slug: q.slug },
        update: {
          title: q.title,
          topicId: topic.id, // in case you move it between topics later
          // keep contentHtml as-is if someone already wrote it
        },
        create: {
          title: q.title,
          slug: q.slug,
          topicId: topic.id,
          status: "DRAFT",
          contentHtml: "",
        },
      });
    }
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });