import "./globals.css";
import "./atesto-ui.css";
import Providers from "@/app/components/Providers";

import type { Metadata } from "next";
import Sidebar from "@/app/components/Sidebar";
import Copilot from "@/app/components/copilot/Copilot";

export const metadata: Metadata = {
  title: "MedNexus",
  description: "Vzdělávací portál pro medicínu (MedNexus) + nástroje (MedVerse)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
  const adminHref = adminKey ? `/admin?key=${encodeURIComponent(adminKey)}` : "/admin";

  return (
    <html lang="cs">
      <body>
        <div className="mn-shell">
          <Sidebar adminHref={adminHref} />
          <div className="mn-main">
            <div className="atesto-container atesto-shell">{children}</div>
          </div>
        </div>

        {/* AI Copilot (MVP2: napojíme na API + kontext stránky) */}
        <Copilot />
      </body>
    </html>
  );
}
