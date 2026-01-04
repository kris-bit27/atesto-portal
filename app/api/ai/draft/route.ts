import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `Jsi odborný asistent pro atestační přípravu z plastické a rekonstrukční chirurgie. Piš česky, medicínsky přesně, strukturovaně a prakticky. Nevymýšlej si fakta. Když si nejsi jistý, napiš „Nejsem si jistý“ a navrhni, co ověřit.`;

function buildUserPrompt(params: { title: string; notes?: string | null; topicTitle?: string | null }) {
  const { title, notes, topicTitle } = params;
  return `Vygeneruj “ATTESTAČNÍ ODPOVĚĎ” k otázce níže.

VSTUP:
- Název otázky: ${title}
- Zadání/poznámky (pokud jsou): ${notes ?? ""}
- Okruh/téma: ${topicTitle ?? ""}
- Chci styl: stručné, ale kompletní; prioritně klinicky použitelné.

VÝSTUP – dodrž přesně tuto strukturu (Markdown):

# ${title}

## 1) Definice a cíl
- 3–6 bodů, jasně.

## 2) Anatomie / fyziologie (jen relevantní)
- 5–10 bodů, vyber jen to, co je nutné pro pochopení a operativu.

## 3) Epidemiologie / etiologie / patogeneze (pokud dává smysl)
- stručně, max 6 bodů.

## 4) Klinický obraz + DDx
- příznaky, typické nálezy
- diferenciální diagnostika (tabulka: jednotka | jak odlišit)

## 5) Diagnostika – algoritmus
- krok 1: anamnéza
- krok 2: fyzikální vyšetření (co přesně vyšetřit)
- krok 3: zobrazovačky / EMG / lab (kdy ano/ne)
- krok 4: red flags (kdy akutně řešit)
- nakonec “mini flow”: 5–8 řádků typu IF/THEN

## 6) Léčba – algoritmus (konzervativní → operační)
- indikace konzervativně vs operačně
- volba techniky + klíčové kroky
- peroperační tipy & triky
- poop péče + rehab

## 7) Komplikace + prevence
- tabulka: komplikace | prevence | řešení

## 8) Pearls & pitfalls (zkouška)
- 8–12 bodů “co zkoušející chce slyšet”
- napiš i časté chyby kandidátů

## 9) Mini-checklist do služby
- 8–12 odrážek “co udělám dnes na příjmu/na sále”

## 10) Doporučená literatura / zdroje
- 5–10 položek: učebnice/kapitoly/guidelines (bez vymýšlení konkrétních citací, pokud nejsou v podkladech; můžeš napsat obecně např. “Green’s Operative Hand Surgery – kapitola …”)

FORMÁTOVÁNÍ:
- žádné dlouhé odstavce; max 4 řádky na odstavec
- používej tabulky tam, kde to zvyšuje přehlednost
- buď konzistentní v termínech
`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const questionSlug = String(body?.questionSlug || "").trim();
    if (!questionSlug) {
      return NextResponse.json({ error: "Missing questionSlug" }, { status: 400 });
    }

    // najdi otázku + topic
    const q = await prisma.question.findUnique({
      where: { slug: questionSlug },
      include: { topic: true },
    });

    if (!q) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const userPrompt = buildUserPrompt({
      title: q.title,
      notes: (q as any).notes ?? (q as any).content ?? null,
      topicTitle: (q as any).topic?.title ?? null,
    });

    // OpenAI API (přes env OPENAI_API_KEY)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ error: "OpenAI error", detail: txt }, { status: 500 });
    }

    const data = await r.json();
    const draft = data?.choices?.[0]?.message?.content ?? "";

    // uložit do DB (pokud máš pole draft/answer/content – zkusíme nejčastější)
    // Tohle je “best effort”: když nemáš tyhle fieldy, jen vrátíme draft.
    try {
      await prisma.question.update({
        where: { slug: questionSlug },
        data: {
          // uprav si podle svého schema:
          draft: draft,
        } as any,
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true, draft });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
