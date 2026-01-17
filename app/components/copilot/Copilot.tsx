"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { role: "user" | "assistant"; text: string };

type QuestionCtx = {
  slug?: string;
  title?: string;
  content?: string;
  updatedAt?: string;
  status?: string;
};

function getAdminKey() {
  if (typeof window !== "undefined") {
    // preferuj query ?key=... (když admin běží takhle)
    try {
      const sp = new URLSearchParams(window.location.search);
      const qk = sp.get("key");
      if (qk) return qk;
    } catch {}
  }
  // fallback: veřejný build-time klíč (MVP)
  return process.env.NEXT_PUBLIC_ADMIN_KEY || "";
}

function buildAdminUrl(path: string, key: string) {
  const sep = path.includes("?") ? "&" : "?";
  return key ? `${path}${sep}key=${encodeURIComponent(key)}` : path;
}

function getQuestionSlug(pathname: string) {
  // očekává /questions/<slug>
  const m = pathname.match(/^\/questions\/([^\/?#]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function defaultSuggestions(pathname: string) {
  if (pathname.startsWith("/questions/")) {
    return [
      "Shrň to do 10 bullet pointů pro atestaci",
      "Vytvoř 8 flashcards (Q/A)",
      "Vytvoř 5 MCQ + vysvětlení",
      "Najdi klinické pearls + komplikace",
    ];
  }
  if (pathname.startsWith("/topics/")) {
    return ["Navrhni pořadí učení", "Vyber 10 nejdůležitějších otázek", "Udělej checklist témat"];
  }
  return ["Vytvoř plán učení na 7 dní", "Vygeneruj 10 flashcards z vybraného tématu", "Shrň poslední editovanou otázku"];
}

async function fetchQuestionContext(slug: string): Promise<QuestionCtx | null> {
  try {
    const res = await fetch(`/api/questions/${encodeURIComponent(slug)}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;

    // Tvůj /api/questions/[slug] vrací { slug,title,status,content,updatedAt }
    return {
      slug: data?.slug,
      title: data?.title,
      status: data?.status,
      content: data?.content,
      updatedAt: data?.updatedAt,
    };
  } catch {
    return null;
  }
}

export default function Copilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [targetKind, setTargetKind] = useState<CopilotKind>("ANSWER");
  const [insertMode, setInsertMode] = useState<"append" | "replace">("append");

  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Copilot je připraven. MVP2: volá interní API stub. MVP3: napojíme reálné AI + export do editoru." },
  ]);

  const lastAssistantText = useMemo(() => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "assistant") return msgs[i].text;
    }
    return "";
  }, [msgs]);

  const pathname = usePathname() || "/";
  const suggestions = useMemo(() => defaultSuggestions(pathname), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function callCopilot(prompt: string) {
    const p = prompt.trim();
    if (!p) return;

    setSending(true);
    setMsgs((m) => [...m, { role: "user", text: p }]);

    const slug = getQuestionSlug(pathname);
    const question = slug ? await fetchQuestionContext(slug) : null;

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          context: {
            pathname,
            question: question || undefined,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setMsgs((m) => [...m, { role: "assistant", text: String(data?.reply || "OK") }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "assistant", text: `❌ Chyba: ${e?.message || "request failed"}` }]);
    } finally {
      setSending(false);
      setInput("");
    }

  async function generateByKind(kind: CopilotKind) {
    const slug = getQuestionSlug(pathname);
    if (!slug) {
      setMsgs((m) => [...m, { role: "assistant", text: "❌ Nejsi na /questions/[slug]." }]);
      return;
    }
    const qctx = await fetchQuestionContext(slug);
    const title = qctx?.title || slug;
    const existing = qctx?.content || "";
    const prompt = buildPrompt(kind, title, existing);
    setTargetKind(kind);
    await callCopilot(prompt);
  }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsgs((m) => [...m, { role: "assistant", text: "📋 Zkopírováno do schránky." }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "❌ Nelze zkopírovat (clipboard blocked)." }]);
    }
  }

  async function insertToQuestion() {
    const key = getAdminKey();
    const slug = getQuestionSlug(pathname);
    const text = lastAssistantText || "";
    if (!slug) {
      setMsgs((m) => [...m, { role: "assistant", text: "❌ Insert: nejsi na /questions/[slug]." }]);
      return;
    }
    if (!key) {
      setMsgs((m) => [...m, { role: "assistant", text: "❌ Insert: chybí admin key (NEXT_PUBLIC_ADMIN_KEY nebo ?key=...)." }]);
      return;
    }
    if (!text.trim()) {
      setMsgs((m) => [...m, { role: "assistant", text: "❌ Insert: není co vložit (žádná odpověď copilot)." }]);
      return;
    }

    // načti aktuální obsah otázky
    const qctx = await fetchQuestionContext(slug);
    const prev = (qctx?.content || "").trim();
    const merged = insertMode === "replace" ? text : (prev ? (prev + "\n\n<hr/>\n\n" + text) : text);

    try {
      const url = buildAdminUrl(`/api/admin/question/${encodeURIComponent(slug)}`, key);
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentHtml: merged, status: qctx?.status || "DRAFT", kind: targetKind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMsgs((m) => [...m, { role: "assistant", text: "✅ Vloženo do otázky (uloženo do DB)." }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "assistant", text: `❌ Insert selhal: ${e?.message || "request failed"}` }]);
    }
  }

  function send(text: string) {
    void callCopilot(text);
  }

  return (
    <>
      <button className="mn-copilot-fab" onClick={() => setOpen(true)} title="AI Copilot (⌘/Ctrl + K)">
        ✨ Copilot
      </button>

      {open ? (
        <div className="mn-copilot-overlay" onClick={() => setOpen(false)}>
          <div className="mn-copilot-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mn-copilot-head">
              <div style={{ display: "grid" }}>
                <strong>AI Copilot</strong>
                <span className="mn-muted">
                  {sending ? "odesílám…" : "⌘/Ctrl+K • Esc"} • {pathname}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="mn-btn mn-btn-ghost" disabled={sending} onClick={() => send("Shrň obsah stručně (max 10 bodů) + 3 klinické pearls.")}>
                  Summarize
                </button>
                <button className="mn-btn mn-btn-ghost" disabled={sending} onClick={() => send("Vytvoř 10 flashcards (Q/A) z kontextu otázky.")}>
                  Flashcards
                </button>
                <button className="mn-btn mn-btn-ghost" disabled={sending} onClick={() => send("Vytvoř 5 MCQ (A–D) + správná odpověď + krátké vysvětlení.")}>
                  MCQ
                </button>
                <button className="mn-btn mn-btn-ghost" disabled={sending} onClick={() => copyToClipboard(lastAssistantText)}>
                  Copy
                </button>
                <button className="mn-btn mn-btn-ghost" disabled={sending} onClick={insertToQuestion}>
                  Insert
                </button>
                <button className="mn-btn mn-btn-ghost" onClick={() => setOpen(false)}>
                  Zavřít
                </button>
              </div>
            </div>

            <div className="mn-copilot-suggest">
              {suggestions.map((s) => (
                <button key={s} className="mn-chipbtn" disabled={sending} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>

            <div className="mn-copilot-body">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "mn-msg mn-msg-user" : "mn-msg mn-msg-ai"}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="mn-copilot-input">
              <input
                className="mn-input"
                placeholder="Napiš požadavek…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input);
                }}
                disabled={sending}
              />
              <button className="mn-btn" onClick={() => send(input)} disabled={sending}>
                Odeslat
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
