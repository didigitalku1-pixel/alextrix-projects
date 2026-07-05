import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura Library — 54,996 Templates, Components, Assets & Skills",
  description:
    "Personal library of 54,996 web design templates, UI components, stock assets, and AI skills. Each item includes HTML code, design.md specs, and AI recreation prompts.",
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
      <body>{children}</body>
    </html>
  );
}
