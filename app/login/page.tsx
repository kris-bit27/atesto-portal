"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const showConfigError = error === "Configuration";

  return (
    <main className="atesto-container" style={{ maxWidth: 420 }}>
      <h1 className="atesto-h1">Přihlášení</h1>
      <p className="atesto-subtle">
        Přihlás se pomocí e-mailu (magic link)
      </p>
      {showConfigError ? (
        <p className="atesto-subtle" style={{ color: "rgb(255,120,120)" }}>
          Email provider není nakonfigurován (EMAIL_SERVER / EMAIL_FROM).
        </p>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn("email", { email, callbackUrl: "/" });
        }}
        className="atesto-stack"
      >
        <input
          className="atesto-input"
          type="email"
          placeholder="tvuj@email.cz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="atesto-btn" type="submit">
          Poslat přihlašovací odkaz
        </button>
      </form>
    </main>
  );
}
