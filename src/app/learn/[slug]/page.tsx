"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Sidebar from "../_components/Sidebar";
import { ScrollSpy } from "../_components/ScrollSpy";
import { getLearnPage } from "../_content";
import { VALID_LEARN_SLUGS } from "../_content/types";
import { useTheme } from "@/hooks/use-theme";

/**
 * Learn detail page.
 *
 * Layout: 3-column desktop (sidebar | article | TOC), responsive.
 * - Left: 256px learn navigation sidebar (transparent, sticky)
 * - Center: 720px article (optimal reading width)
 * - Right: 240px TOC with scroll-spy (sticky)
 *
 * Mobile: hamburger button opens sidebar drawer; TOC collapses below article.
 */
export default function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isDark, toggle: toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!VALID_LEARN_SLUGS.has(slug)) {
      notFound();
    }
  }, [slug]);

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
    <div className="app alextrix-app" style={{ minHeight: "100vh" }}>
      {/* Mobile drawer — now handled by global SiteHeader MobileDrawer */}
      {mobileNavOpen && (
        <div
          className="learn-mobile-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3-column layout */}
      <div className="learn-layout-react">
        <Sidebar
          activeSlug={slug}
          onNavigate={() => setMobileNavOpen(false)}
          mobileOpen={mobileNavOpen}
        />

        <main className="learn-content-react">
          <div className="docs-container">
            <Body />

            {/* Right-side TOC (desktop only) */}
            {page.toc && page.toc.length > 0 && (
              <aside className="docs-toc-aside">
                <ScrollSpy items={page.toc} />
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
