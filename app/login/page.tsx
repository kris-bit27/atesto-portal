"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <main className="atesto-container" style={{ maxWidth: 420 }}>
      <h1 className="atesto-h1">Přihlášení</h1>
      <p className="atesto-subtle">
        Přihlás se pomocí e-mailu (magic link)
      </p>

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
