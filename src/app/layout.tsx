import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alextrix — Premium Templates, Components & Design Systems",
  description: "Browse premium HTML, CSS, React templates, UI components, and design systems. Export production-ready code instantly.",
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
