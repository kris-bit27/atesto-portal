export type CopilotKind = "ANSWER" | "FLASHCARDS" | "MCQ";

function baseRules() {
  return [
    "Piš česky.",
    "Piš jako učebnicové skriptum pro lékaře (atestace / vzdělávání).",
    "Bez obrázků.",
    "Struktura: nadpisy + krátké odstavce + rozumně odrážky.",
    "Klinicky orientované: indikace, DDx, komplikace, algoritmy, praktické tipy.",
    "Bez vymýšlení guideline čísel pokud si nejsi jistý; raději obecně a bezpečně."
  ].join("\n");
}

export function buildPrompt(kind: CopilotKind, title: string, existingHtml?: string) {
  const ctx = existingHtml?.trim()
    ? `\n\nKONTEXT (existující obsah otázky – můžeš doplnit / opravit / přepsat):\n${existingHtml}\n`
    : "";

  if (kind === "ANSWER") {
    return [
      `Napiš kompletní odpověď k otázce: "${title}".`,
      baseRules(),
      "Délka: dlouhá (učebnicová), ale čitelná.",
      "Přidej: definice → epidemiologie/etiologie → klinika → diagnostika → léčba → komplikace → pearls & pitfalls → krátké shrnutí.",
      "Výstup vrať jako HTML (h2/h3, p, ul/li).",
      ctx,
    ].join("\n\n");
  }

  if (kind === "FLASHCARDS") {
    return [
      `Vytvoř flashcards k otázce: "${title}".`,
      baseRules(),
      "Formát výstupu (HTML):",
      "- h2: Flashcards",
      "- pro každou kartu: <h3>Q:</h3><p>...</p><h3>A:</h3><p>...</p>",
      "Počet: 20–35 karet, od základů po pokročilé klinické rozhodování.",
      "Zahrň: klasifikace, indikace, kontraindikace, komplikace, red flags, nejčastější chyby.",
      ctx,
    ].join("\n\n");
  }

  // MCQ
  return [
    `Vytvoř MCQ k otázce: "${title}".`,
    baseRules(),
    "Formát výstupu (HTML):",
    "- h2: MCQ",
    "- Každá otázka: <h3>Otázka X</h3><p>Stem...</p><ul><li>A) ...</li>...</ul>",
    "- Pak: <p><b>Správně:</b> B</p><p><b>Vysvětlení:</b> ...</p>",
    "Počet: 12–20 otázek.",
    "Mix: 60% klinické scénáře, 40% faktické znalosti. Přidej aspoň 3 otázky na komplikace/management.",
    ctx,
  ].join("\n\n");
}
