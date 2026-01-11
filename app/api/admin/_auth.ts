import type { NextRequest } from "next/server";

export function assertAdminKey(req: NextRequest) {
  const expected = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  const key = req.nextUrl.searchParams.get("key") || "";
  if (!expected) return { ok: false, error: "NEXT_PUBLIC_ADMIN_KEY není nastavené v .env.local" };
  if (!key) return { ok: false, error: "Chybí ?key=..." };
  if (key !== expected) return { ok: false, error: "Unauthorized (špatný key)" };
  return { ok: true as const, key };
}

export function getKeyFromUrl(url: string) {
  try {
    const u = new URL(url);
    return u.searchParams.get("key") || "";
  } catch {
    return "";
  }
}
