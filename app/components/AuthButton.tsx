"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="atesto-subtle">…</span>;
  }

  if (!session) {
    return (
      <button className="atesto-btn" onClick={() => signIn()}>
        Login
      </button>
    );
  }

  return (
    <button className="atesto-btn" onClick={() => signOut()}>
      Logout
    </button>
  );
}
