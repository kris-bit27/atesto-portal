"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

function NavLink({ href, label }: NavItem) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link className={active ? "mn-navlink mn-navlink-active" : "mn-navlink"} href={href}>
      {label}
    </Link>
  );
}

export default function Sidebar({ adminHref }: { adminHref: string }) {
  const items: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/read", label: "Read" },
    { href: "/review", label: "Review" },
    { href: "/search", label: "Search" },
    { href: "/editor", label: "Editor" },
    { href: adminHref, label: "Admin" },
  ];

  return (
    <aside className="mn-sidebar">
      <div className="mn-brand">
        <div className="mn-brand-title">MedNexus</div>
        <div className="mn-brand-sub">Education • Knowledge • Tools</div>
      </div>

      <nav className="mn-nav">
        {items.map((it) => (
          <NavLink key={it.href} href={it.href} label={it.label} />
        ))}
      

      <div style={{ marginTop: 16 }}>
</div>

    </nav>

      <div className="mn-sidebar-footer">
        <div className="mn-chip">MVP</div>
        <div className="mn-muted">v2-ready</div>
      </div>
    </aside>
  );
}
