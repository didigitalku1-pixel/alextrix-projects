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
      <body>{children}</body>
    </html>
  );
}
