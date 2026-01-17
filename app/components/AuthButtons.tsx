"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  // během načítání nic “nebliká”
  if (status === "loading") return null;

  if (!session) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="atesto-btn"
          onClick={() => signIn(undefined, { callbackUrl: "/" })}
        >
          Login
        </button>

        {/* pokud chceš mít i klasickou stránku */}
        <Link className="atesto-btn" href="/login">
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <span className="atesto-subtle">
        {session.user?.email ?? session.user?.name ?? "Signed in"}
      </span>
      <button type="button" className="atesto-btn" onClick={() => signOut({ callbackUrl: "/" })}>
        Logout
      </button>
    </div>
  );
}
