import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Alextrix — Template, Komponen, & Design System Premium",
  description: "Jelajahi template HTML, CSS, React, komponen UI, dan design system premium. Ekspor kode siap produksi secara instan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inter font — loaded via <link> so we don't violate the CSS
            @import ordering rule (must precede all rules aside from
            @charset and @layer). Includes 300/400/500/600/700 weights
            to match aura.build's typography scale. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Global header — rendered on ALL pages via layout */}
        <Suspense fallback={<header className="header"><div className="header-inner"><div className="header-left"><a href="/" className="header-logo alextrix-logo"><div className="header-logo-icon">A</div><span className="alextrix-name">Alextrix</span></a></div></div></header>}>
          <SiteHeader />
        </Suspense>

        {/* Page content */}
        {children}

        {/* Global footer — rendered on ALL pages via layout */}
        <SiteFooter />
      </body>
    </html>
  );
}
