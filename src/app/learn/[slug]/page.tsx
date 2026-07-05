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
 * Layout matches aura.build:
 *  - 256px sidebar (transparent, no border, sticky independent scroll)
 *  - Wide content area, breathing room
 *  - Mobile: hamburger button → slide-in drawer with backdrop
 *  - Smooth scroll, scroll-padding-top for sticky header offset
 */
export default function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  const page = getLearnPage(slug);
  if (!page) return null;

  const Body = page.body;

  return (
    <div className="app" style={{ minHeight: "100vh" }}>
      {/* Header — our branding */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            {/* Mobile hamburger button */}
            <button
              className="learn-mobile-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          </div>
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
            <button className="header-icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">
              {dark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {mobileNavOpen && (
        <div
          className="learn-mobile-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Layout: sidebar + verbatim aura.build content */}
      <div className="learn-layout-react">
        <Sidebar
          activeSlug={slug}
          onNavigate={() => setMobileNavOpen(false)}
          mobileOpen={mobileNavOpen}
        />

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
