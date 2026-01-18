"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  adminHref: string;
};

function SbLink({ href, label, pill }: { href: string; label: string; pill?: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link className={`mn-sb-link ${active ? "active" : ""}`} href={href}>
      <span>{label}</span>
      {pill ? <span className="mn-sb-pill">{pill}</span> : null}
    </Link>
  );
}

export default function Sidebar({ adminHref }: Props) {
  return (
    <aside className="mn-sidebar">
      <div className="mn-sb-brand">
        <span className="dot" />
        <div>
          <div className="mn-sb-title">MedNexus</div>
          <div className="mn-sb-sub">Education • Knowledge • Tools</div>
        </div>
      </div>

      <div className="mn-sb-section">
        <div className="mn-sb-section-title">MedNexus</div>
        <SbLink href="/" label="Dashboard" />
        <SbLink href="/read" label="Read" />
        <SbLink href="/review" label="Review" pill="SRS" />
        <SbLink href="/search" label="Search" />
      </div>

      <div className="mn-sb-section">
        <div className="mn-sb-section-title">MedVerse</div>
        <SbLink href="/editor" label="Editor" pill="AI" />
      </div>

      <div className="mn-sb-section">
        <div className="mn-sb-section-title">Admin</div>
        <SbLink href={adminHref} label="Admin" />
      </div>
    </aside>
  );
}
