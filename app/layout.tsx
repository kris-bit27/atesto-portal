import "./globals.css";
import "./atesto-ui.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atesto portál",
  description: "Vzdělávací portál pro atestaci z plastické chirurgie",
};

function navLink(href: string, label: string) {
  return (
    <Link className="atesto-navlink" href={href}>
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  const adminHref = adminKey ? `/admin?key=${encodeURIComponent(adminKey)}` : "/admin";

  return (
    <html lang="cs">
      <body>
        <div className="atesto-topbar">
          <div className="atesto-topbar-inner">
            <Link className="atesto-brand" href="/">
              Atesto<span className="atesto-brand-dot">•</span>portál
            </Link>

            <nav className="atesto-nav">
              {navLink("/", "Home")}
              {navLink("/read", "Read")}
              {navLink("/review", "Review")}
              {navLink("/search", "Search")}
              {navLink("/editor", "Editor")}
              {navLink(adminHref, "Admin")}
            </nav>
          </div>
        </div>

        <div className="atesto-page"><div className="atesto-container atesto-shell">{children}</div></div>
      </body>
    </html>
  );
}
