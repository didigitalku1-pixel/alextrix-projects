"use client";

import { use, useState, useEffect } from "react";
import Script from "next/script";
import { notFound } from "next/navigation";
import Sidebar from "../_components/Sidebar";
import { getLearnPage } from "../_content";
import { VALID_LEARN_SLUGS, SIDEBAR } from "../_content/types";

/**
 * Learn detail page.
 *
 * Renders the article body scraped verbatim from
 * https://www.aura.build/learn/<slug> via dangerouslySetInnerHTML.
 *
 * Layout matches aura.build: 280px sidebar + wide content area.
 * No iframe, no shaking, no logo bug. Sidebar uses next/link so
 * back/forward and cmd-click work natively.
 */
export default function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [dark, setDark] = useState(false);

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
      {/* Load Tailwind Play CDN so ALL classes in the scraped aura.build
          HTML are styled at runtime. This is the same approach the old
          iframe used and guarantees 100% visual match with aura.build.
          The CDN scans the DOM after render and generates CSS for every
          class it finds, including ones inside dangerouslySetInnerHTML.
          It also watches for DOM changes via MutationObserver, so
          navigation between learn pages re-scans automatically. */}
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="afterInteractive"
      />

      {/* Header — our branding */}
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

      {/* Layout: sidebar + verbatim aura.build content */}
      <div className="learn-layout-react">
        <Sidebar activeSlug={slug} />

        {/* The Body component renders the verbatim scraped HTML inside a
            div.aura-learn-content. CSS for that class is minimal — we want
            aura.build's Tailwind classes to apply directly. */}
        <main className="learn-content-react learn-content-verbatim">
          <Body />
        </main>
      </div>
    </div>
  );
}
