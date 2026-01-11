import Link from "next/link";

export const dynamic = "force-dynamic";

export default function EditorIndex() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0 }}>EDITOR</h1>
      <p style={{ opacity: 0.8, margin: 0 }}>
        Pro MVP je editace řešená přes Admin rozhraní (Topics + Questions + TipTap).
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/" style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)" }}>
          ← Zpět na Home
        </Link>
        <Link href="/admin" style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)" }}>
          Otevřít Admin →
        </Link>
      </div>
      <p style={{ opacity: 0.65, margin: 0, fontSize: 13 }}>
        Pozn.: Pokud máš Admin chráněný přes key, otevři /admin?key=TVŮJ_KLÍČ.
      </p>
    </main>
  );
}
