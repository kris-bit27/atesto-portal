"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "@/app/components/AuthButtons";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`atesto-navlink ${active ? "active" : ""}`}
      style={{
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.10)",
        background: active ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.02)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {label}
    </Link>
  );
}

export default function TopBar() {
  return (
    <div className="mn-topbar">
      <div className="mn-topbar-inner">
        <Link className="mn-brand" href="/">
          <span className="dot" />
          <span style={{ fontWeight: 800, letterSpacing: 0.2 }}>MedNexus</span>
          <span style={{ opacity: 0.6, fontWeight: 700 }}>•</span>
          <span style={{ opacity: 0.85, fontWeight: 700 }}>MedVerse</span>
        </Link>

        <div className="mn-top-actions">
          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <NavLink href="/" label="Dashboard" />
            <NavLink href="/read" label="Read" />
            <NavLink href="/review" label="Review" />
            <NavLink href="/search" label="Search" />
            <NavLink href="/editor" label="Editor" />
          </nav>

          <div style={{ width: 1, height: 26, background: "rgba(255,255,255,.10)" }} />

          {/* Login / Logout */}
          <AuthButtons />
        </div>
      </div>
    </div>
  );
}
