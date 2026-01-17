import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Payload = {
  prompt?: string;
  context?: {
    pathname?: string;
    question?: {
      slug?: string;
      title?: string;
      content?: string;
      updatedAt?: string;
      status?: string;
    };
  };
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Payload;

  const prompt = (body.prompt || "").trim();
  const q = body.context?.question;

  // MVP2 stub: jen zrcadlí co přišlo + lehce strukturuje.
  // MVP3: tady nahradíme voláním AI modelu.
  const reply =
    prompt.length === 0
      ? "Pošli prompt (text), co mám udělat."
      : [
          "✅ Copilot (stub) – přijato.",
          "",
          `Prompt: ${prompt}`,
          q?.slug ? `Otázka: ${q.title || ""} (${q.slug})` : "Otázka: (žádný kontext)",
          "",
          "MVP3: zde bude reálné AI generování (shrnutí, flashcards, MCQ, návrh algoritmu) + možnost vložit do editoru.",
        ].join("\n");

  return NextResponse.json({
    ok: true,
    reply,
    meta: {
      hasQuestionContext: Boolean(q?.slug),
      pathname: body.context?.pathname || "",
      receivedAt: new Date().toISOString(),
    },
  });
}
