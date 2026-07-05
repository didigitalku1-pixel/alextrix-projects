"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Sidebar from "../_components/Sidebar";
import { getLearnPage } from "../_content";
import { VALID_LEARN_SLUGS } from "../_content/types";

/**
 * Learn detail page.
 *
 * Renders the original content for each learn slug directly in React — no
 * iframe, no scraped HTML. The sidebar is sticky and uses next/link for
 * navigation, so back/forward and cmd-click all work as expected.
 */
export default function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [dark, setDark] = useState(false);

  // Validate slug — if unknown, 404
  useEffect(() => {
    if (!VALID_LEARN_SLUGS.has(slug)) {
      notFound();
    }
  }, [slug]);

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  const page = getLearnPage(slug);
  if (!page) return null;

  const Body = page.body;

  return (
    <div className="app" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            <a href="/" className="header-tab">CREATE</a>
            <a href="/?tab=templates" className="header-tab">TEMPLATES</a>
            <a href="/?tab=components" className="header-tab">COMPONENTS</a>
            <a href="/?tab=assets" className="header-tab">ASSETS</a>
            <a href="/?tab=skills" className="header-tab">SKILLS</a>
            <a href="/design-systems" className="header-tab">DESIGN.MD</a>
            <a href="/learn/introduction" className="header-tab active">LEARN</a>
            <a href="/" className="header-tab">PRICING</a>
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      {/* Main layout — sidebar + content */}
      <div className="learn-layout learn-layout-react">
        <Sidebar activeSlug={slug} />

        <main className="learn-content learn-content-react">
          <div className="learn-breadcrumb">
            Learn / <span className="learn-breadcrumb-active">{page.title}</span>
          </div>

          <h1 className="learn-h1">{page.title}</h1>
          <div className="learn-underline" />

          <div className="learn-markdown learn-markdown-react">
            <Body />
          </div>

          {/* Footer nav — prev/next */}
          <LearnFooterNav activeSlug={slug} />
        </main>
      </div>
    </div>
  );
}

/**
 * Inline prev/next footer nav.
 * Reads from SIDEBAR to find neighbors of the current page.
 */
function LearnFooterNav({ activeSlug }: { activeSlug: string }) {
  // Lazy import to avoid circular issues at module load time.
  // SIDEBAR is small and static so the cost is negligible.
  const { SIDEBAR } = require("../_content/types") as typeof import("../_content/types");

  // Flatten all sidebar entries into a single ordered list of slugs
  const flat: { slug: string; label: string }[] = [];
  for (const group of SIDEBAR) {
    for (const entry of group.entries) {
      if (entry.slug) flat.push({ slug: entry.slug, label: entry.label });
    }
  }
  const idx = flat.findIndex((e) => e.slug === activeSlug);
  if (idx < 0) return null;
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <nav className="learn-footer-nav">
      {prev && (
        <a href={`/learn/${prev.slug}`} className="learn-footer-nav-item learn-footer-nav-prev">
          <div className="learn-footer-nav-label">Previous</div>
          <div className="learn-footer-nav-title">← {prev.label}</div>
        </a>
      )}
      {next && (
        <a href={`/learn/${next.slug}`} className="learn-footer-nav-item learn-footer-nav-next">
          <div className="learn-footer-nav-label">Next</div>
          <div className="learn-footer-nav-title">{next.label} →</div>
        </a>
      )}
    </nav>
  );
}
