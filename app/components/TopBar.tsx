"use client";

import AuthButtons from "@/app/components/AuthButtons";
import { SessionProvider } from "next-auth/react";

export default function TopBar() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,12,0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 10,
      }}
    >
      <SessionProvider>
        <AuthButtons />
      </SessionProvider>
    </div>
  );
}
