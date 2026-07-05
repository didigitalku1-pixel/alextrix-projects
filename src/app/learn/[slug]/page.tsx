"use client";

import { use, useState, useEffect } from "react";
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

  // Load Tailwind Play CDN on this page only. The CDN scans the DOM at
  // runtime and generates CSS for every Tailwind class it finds —
  // including the ones inside the scraped aura.build HTML. This is the
  // same approach the old iframe used and guarantees 100% visual match.
  // We inject the script tag manually (not via next/script) because the
  // CDN needs to execute synchronously to style the page before paint.
  useEffect(() => {
    if (document.querySelector('script[data-tailwind-cdn]')) return;
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    script.async = false;
    script.setAttribute("data-tailwind-cdn", "true");
    document.head.appendChild(script);
    return () => {
      // Don't remove on unmount — the CDN adds a <style> tag that
      // would lose its source. The script itself is harmless if it
      // stays, and it'll be reused on next learn page navigation.
    };
  }, []);

  const page = getLearnPage(slug);
  if (!page) return null;

  const Body = page.body;

  return (
    <div className="app" style={{ minHeight: "100vh" }}>
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
