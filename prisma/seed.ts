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

type SeedCategory = {
  title: string;
  slug: string;
  order: number;
};

type SeedSubcategory = {
  title: string;
  slug: string;
  order: number;
  categorySlug: string;
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

const categories: SeedCategory[] = [
  { title: "Základy & perioperační péče", slug: "zaklady-perioperacni-pece", order: 1 },
  { title: "Laloky & rekonstrukce", slug: "laloky-rekonstrukce", order: 2 },
  { title: "Chirurgie ruky", slug: "chirurgie-ruky", order: 3 },
  { title: "Kraniofaciál & vrozené vady", slug: "kraniofacial-vrozene-vady", order: 4 },
  { title: "Nádory & kožní léze", slug: "nadory-kozni-leze", order: 5 },
  { title: "Popáleniny & termická poranění", slug: "popaleniny-termicka-poraneni", order: 6 },
  { title: "Rekonstrukce specifických oblastí", slug: "rekonstrukce-specificke-oblasti", order: 7 },
  { title: "Estetika", slug: "estetika", order: 8 },
];

const subcategories: SeedSubcategory[] = [
  { title: "Hojení ran, jizvy, krytí", slug: "hojeni-ran-jizvy-kryti", order: 10, categorySlug: "zaklady-perioperacni-pece" },
  { title: "ATB profylaxe, tromboprofylaxe", slug: "atb-trombo-profy", order: 11, categorySlug: "zaklady-perioperacni-pece" },
  { title: "Anestezie (lokální/svodná)", slug: "anestezie-lokalni-svodna", order: 12, categorySlug: "zaklady-perioperacni-pece" },
  {
    title: "Mikrochirurgie základy, instrumentárium, turniket",
    slug: "mikrochirurgie-zaklady-instrumentarium-turniket",
    order: 13,
    categorySlug: "zaklady-perioperacni-pece",
  },

  {
    title: "Rekonstrukční žebřík, angiosomy, perforátory, delay",
    slug: "rekonstrukcni-zebrik-angiosomy-perforatory-delay",
    order: 20,
    categorySlug: "laloky-rekonstrukce",
  },
  { title: "Místní/regionální laloky", slug: "mistni-regionalni-laloky", order: 21, categorySlug: "laloky-rekonstrukce" },
  { title: "Volné laloky + monitorace", slug: "volne-laloky-monitorace", order: 22, categorySlug: "laloky-rekonstrukce" },
  {
    title: "Kožní štěpy, dermální náhrady, expandéry, lipofilling",
    slug: "kozni-stepy-dermalni-nahrady-expandery-lipofilling",
    order: 23,
    categorySlug: "laloky-rekonstrukce",
  },

  {
    title: "Vyšetření ruky, rehabilitace, dlahování",
    slug: "vysetreni-ruky-rehabilitace-dlahovani",
    order: 30,
    categorySlug: "chirurgie-ruky",
  },
  { title: "Šlachy flexory/extenzory", slug: "slachy-flexory-extenzory", order: 31, categorySlug: "chirurgie-ruky" },
  { title: "Periferní nervy, úžiny", slug: "periferni-nervy-uziny", order: 32, categorySlug: "chirurgie-ruky" },
  {
    title: "Infekce ruky, Dupuytren, degenerativní onemocnění",
    slug: "infekce-ruky-dupuytren-degenerativni",
    order: 33,
    categorySlug: "chirurgie-ruky",
  },
  {
    title: "Replantace/revaskularizace, amputace, krytí defektů",
    slug: "replantace-revaskularizace-amputace-kryti-defektu",
    order: 34,
    categorySlug: "chirurgie-ruky",
  },

  { title: "Rozštěpy (rtu/patra), VPI", slug: "rozstepy-rtu-patra-vpi", order: 40, categorySlug: "kraniofacial-vrozene-vady" },
  { title: "Kraniosynostózy, syndromy", slug: "kraniosynostozy-syndromy", order: 41, categorySlug: "kraniofacial-vrozene-vady" },
  {
    title: "Vady ucha, prsu/hrudní stěny, genitálu",
    slug: "vady-ucha-prsu-hrudni-steny-genitalu",
    order: 42,
    categorySlug: "kraniofacial-vrozene-vady",
  },
  { title: "Vrozené vady ruky (OMT 2014)", slug: "vrozene-vady-ruky-omt-2014", order: 43, categorySlug: "kraniofacial-vrozene-vady" },

  { title: "Melanom, NMSC, prekancerózy", slug: "melanom-nmsc-prekancerozy", order: 50, categorySlug: "nadory-kozni-leze" },
  { title: "Benigní nádory, malformace", slug: "benigni-nadory-malformace", order: 51, categorySlug: "nadory-kozni-leze" },

  {
    title: "Klasifikace, první pomoc, šok",
    slug: "popaleniny-klasifikace-prvni-pomoc-sok",
    order: 60,
    categorySlug: "popaleniny-termicka-poraneni",
  },
  {
    title: "Nekrektomie, štěpy, kryty, rekonstrukce, rehab",
    slug: "nekrektomie-stepy-kryty-rekonstrukce-rehab",
    order: 61,
    categorySlug: "popaleniny-termicka-poraneni",
  },
  {
    title: "Omrzliny, elektrická/chemická/radiační poranění",
    slug: "omrzliny-elektricka-chemicka-radiacni",
    order: 62,
    categorySlug: "popaleniny-termicka-poraneni",
  },

  {
    title: "Skalpa/čelo, víčka, nos, rty, tvář/mandibula/maxilla",
    slug: "skalp-celo-vicka-nos-rty-tvar-mandibula-maxilla",
    order: 70,
    categorySlug: "rekonstrukce-specificke-oblasti",
  },
  { title: "Paréza n. facialis", slug: "pareza-n-facialis", order: 71, categorySlug: "rekonstrukce-specificke-oblasti" },
  { title: "Dekubity, břišní stěna/perineum", slug: "dekubity-brisni-stena-perineum", order: 72, categorySlug: "rekonstrukce-specificke-oblasti" },
  { title: "DK defekty (bérec/noha/diabetická noha)", slug: "dk-defekty-berec-noha-diabeticka-noha", order: 73, categorySlug: "rekonstrukce-specificke-oblasti" },

  {
    title: "Základy (laser, botulotoxin, výplně, liposukce, facelift, blefaroplastika, rhinoplastika)",
    slug: "estetika-zaklady",
    order: 80,
    categorySlug: "estetika",
  },
];

const normalize = (input: string) =>
  input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasAny = (haystack: string, keywords: string[]) => keywords.some((k) => haystack.includes(k));

const subcategoryRules = [
  { slug: "hojeni-ran-jizvy-kryti", category: "zaklady-perioperacni-pece", keywords: ["hojeni", "jizv", "kryti", "rana"] },
  { slug: "atb-trombo-profy", category: "zaklady-perioperacni-pece", keywords: ["trombo", "dvt", "pe", "atb", "profylax"] },
  { slug: "anestezie-lokalni-svodna", category: "zaklady-perioperacni-pece", keywords: ["anestez", "svodn", "lokaln"] },
  { slug: "mikrochirurgie-zaklady-instrumentarium-turniket", category: "zaklady-perioperacni-pece", keywords: ["mikrochir", "instrument", "turniket", "magnifik"] },

  { slug: "rekonstrukcni-zebrik-angiosomy-perforatory-delay", category: "laloky-rekonstrukce", keywords: ["zebrik", "angiosom", "perfor", "delay"] },
  { slug: "mistni-regionalni-laloky", category: "laloky-rekonstrukce", keywords: ["mistni", "regional", "vzdalen", "laloky"] },
  { slug: "volne-laloky-monitorace", category: "laloky-rekonstrukce", keywords: ["volne", "free", "monitor", "nonreflow"] },
  { slug: "kozni-stepy-dermalni-nahrady-expandery-lipofilling", category: "laloky-rekonstrukce", keywords: ["step", "transplant", "dermaln", "expanz", "lipofill"] },

  { slug: "vysetreni-ruky-rehabilitace-dlahovani", category: "chirurgie-ruky", keywords: ["vysetren", "rehabilit", "dlah", "protetik", "fixac"] },
  { slug: "slachy-flexory-extenzory", category: "chirurgie-ruky", keywords: ["slach", "flexor", "extenzor", "mallet", "boutonniere"] },
  { slug: "periferni-nervy-uziny", category: "chirurgie-ruky", keywords: ["nerv", "uzin", "cts", "karp", "kubit", "guyon"] },
  { slug: "infekce-ruky-dupuytren-degenerativni", category: "chirurgie-ruky", keywords: ["infekc", "dupuytren", "degenerativ"] },
  { slug: "replantace-revaskularizace-amputace-kryti-defektu", category: "chirurgie-ruky", keywords: ["replant", "revask", "amputac", "isch", "kryti defekt"] },

  { slug: "rozstepy-rtu-patra-vpi", category: "kraniofacial-vrozene-vady", keywords: ["rozstep", "vpi", "patra", "rtu"] },
  { slug: "kraniosynostozy-syndromy", category: "kraniofacial-vrozene-vady", keywords: ["kraniosyn", "syndrom"] },
  { slug: "vady-ucha-prsu-hrudni-steny-genitalu", category: "kraniofacial-vrozene-vady", keywords: ["bolt", "ucha", "prs", "hrudn", "genital", "hypospad", "epispad", "extrof"] },
  { slug: "vrozene-vady-ruky-omt-2014", category: "kraniofacial-vrozene-vady", keywords: ["vrozene vady ruky", "omt"] },

  { slug: "melanom-nmsc-prekancerozy", category: "nadory-kozni-leze", keywords: ["melanom", "nmsc", "prekancer", "malign"] },
  { slug: "benigni-nadory-malformace", category: "nadory-kozni-leze", keywords: ["benign", "malformac", "nev", "tumor"] },

  { slug: "popaleniny-klasifikace-prvni-pomoc-sok", category: "popaleniny-termicka-poraneni", keywords: ["popalen", "prvni pomoc", "sok", "eschar"] },
  { slug: "nekrektomie-stepy-kryty-rekonstrukce-rehab", category: "popaleniny-termicka-poraneni", keywords: ["nekrektom", "autotrans", "kryt", "nahrad", "rehab"] },
  { slug: "omrzliny-elektricka-chemicka-radiacni", category: "popaleniny-termicka-poraneni", keywords: ["omrzlin", "elektr", "chemick", "radiac", "inhalac"] },

  {
    slug: "skalp-celo-vicka-nos-rty-tvar-mandibula-maxilla",
    category: "rekonstrukce-specificke-oblasti",
    keywords: ["skalp", "celo", "vicka", "nos", "ret", "tvar", "maxill", "mandibul"],
  },
  { slug: "pareza-n-facialis", category: "rekonstrukce-specificke-oblasti", keywords: ["facialis", "pareza"] },
  { slug: "dekubity-brisni-stena-perineum", category: "rekonstrukce-specificke-oblasti", keywords: ["dekubit", "brisni", "perine"] },
  { slug: "dk-defekty-berec-noha-diabeticka-noha", category: "rekonstrukce-specificke-oblasti", keywords: ["berec", "noha", "hlezno", "diabet"] },

  { slug: "estetika-zaklady", category: "estetika", keywords: ["estet", "laser", "botulotoxin", "vypln", "liposuk", "facelift", "blefaroplast", "rhinoplast"] },
];

const categoryRules = [
  { slug: "chirurgie-ruky", keywords: ["ruka", "hand", "karp", "cts", "flexor", "extenzor", "dupuytren"] },
  { slug: "popaleniny-termicka-poraneni", keywords: ["popalen", "termick", "omrzlin", "elektr", "chemick", "radiac"] },
  { slug: "nadory-kozni-leze", keywords: ["melanom", "nmsc", "prekancer", "malign", "nador", "tumor"] },
  { slug: "kraniofacial-vrozene-vady", keywords: ["rozstep", "kranio", "syndrom", "vrozene", "bolt", "genital"] },
  { slug: "rekonstrukce-specificke-oblasti", keywords: ["skalp", "celo", "vicka", "nos", "ret", "tvar", "mandibul", "maxill", "dekubit", "berec", "noha"] },
  { slug: "laloky-rekonstrukce", keywords: ["lalok", "step", "rekonstruk", "expanz", "lipofill", "angiosom", "perfor"] },
  { slug: "zaklady-perioperacni-pece", keywords: ["hojeni", "trombo", "anestez", "mikrochir", "turniket", "lymfe"] },
  { slug: "estetika", keywords: ["estet", "laser", "botulotoxin", "vypln", "liposuk", "facelift", "blefaroplast", "rhinoplast"] },
];

const topicSlugCategory = (topicSlug: string, haystack: string) => {
  if (topicSlug.startsWith("a1")) return "zaklady-perioperacni-pece";
  if (topicSlug.startsWith("a2") || topicSlug.startsWith("a3")) return "laloky-rekonstrukce";
  if (topicSlug.startsWith("a6") || topicSlug.startsWith("a7")) return "kraniofacial-vrozene-vady";
  if (topicSlug.startsWith("b8")) return "nadory-kozni-leze";
  if (topicSlug.startsWith("b9")) return "popaleniny-termicka-poraneni";
  if (topicSlug.startsWith("b1") || topicSlug.startsWith("b3") || topicSlug.startsWith("b5") || topicSlug.startsWith("b7")) {
    return "rekonstrukce-specificke-oblasti";
  }
  if (topicSlug.startsWith("b6")) return "chirurgie-ruky";
  if (topicSlug.startsWith("c")) {
    if (haystack.includes("estet")) return "estetika";
    return "chirurgie-ruky";
  }
  if (topicSlug.startsWith("b2")) {
    if (haystack.includes("nador") || haystack.includes("malign")) return "nadory-kozni-leze";
    return "laloky-rekonstrukce";
  }
  return "";
};

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

  console.log("🌱 Seeding categories + subcategories...");

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { title: c.title, order: c.order, isActive: true },
      create: { title: c.title, slug: c.slug, order: c.order, isActive: true },
    });
  }

  const categoryBySlug = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id])
  );

  for (const s of subcategories) {
    const categoryId = categoryBySlug.get(s.categorySlug);
    if (!categoryId) continue;
    await prisma.subcategory.upsert({
      where: { slug: s.slug },
      update: { title: s.title, order: s.order, isActive: true, categoryId },
      create: { title: s.title, slug: s.slug, order: s.order, isActive: true, categoryId },
    });
  }

  const subcategoryBySlug = new Map(
    (await prisma.subcategory.findMany({ select: { id: true, slug: true, categoryId: true } })).map((s) => [
      s.slug,
      s,
    ])
  );

  console.log("🧭 Assigning category/subcategory to questions...");
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      subcategoryId: true,
      topic: { select: { slug: true, title: true } },
    },
  });

  let updatedCount = 0;
  for (const q of allQuestions) {
    const haystack = normalize(`${q.title} ${q.slug} ${q.topic?.title || ""} ${q.topic?.slug || ""}`);
    const topicSlug = normalize(q.topic?.slug || "");

    const subRule = subcategoryRules.find((r) => hasAny(haystack, r.keywords));
    const subSlug = subRule?.slug || "";
    let catSlug = subRule?.category || "";

    if (!catSlug) {
      const catRule = categoryRules.find((r) => hasAny(haystack, r.keywords));
      catSlug = catRule?.slug || "";
    }
    if (!catSlug) catSlug = topicSlugCategory(topicSlug, haystack);

    let categoryId = catSlug ? categoryBySlug.get(catSlug) : undefined;
    const subcategory = subSlug ? subcategoryBySlug.get(subSlug) : undefined;
    const subcategoryId = subcategory?.id;
    if (!categoryId && subcategory?.categoryId) categoryId = subcategory.categoryId;

    if (!categoryId && !subcategoryId) continue;

    const data: { categoryId?: string; subcategoryId?: string } = {};
    if (categoryId && q.categoryId !== categoryId) data.categoryId = categoryId;
    if (subcategoryId && q.subcategoryId !== subcategoryId) data.subcategoryId = subcategoryId;
    if (!Object.keys(data).length) continue;

    await prisma.question.update({ where: { id: q.id }, data });
    updatedCount += 1;
  }

  console.log(`✅ Categories assigned: ${updatedCount}`);
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
