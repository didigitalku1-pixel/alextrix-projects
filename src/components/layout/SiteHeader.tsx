"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NAV_TABS } from "./nav-config";
import { ThemeToggle } from "./ThemeToggle";
import { MobileDrawer } from "./MobileDrawer";

/**
 * Global SiteHeader — rendered in layout.tsx on ALL pages.
 *
 * Features:
 * - Logo + "Alextrix" brand text (consistent everywhere)
 * - Nav tabs with automatic active state via usePathname()
 * - Global search field (redirects to /templates?q=... on non-browse pages)
 * - SVG theme toggle (consistent cross-platform)
 * - Scroll elevation (shadow appears after 50px scroll)
 * - Mobile hamburger drawer
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  // Sync search from URL when on browse pages
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQ(q);
  }, [searchParams]);

  // Scroll elevation
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Determine if we're on a browse page (search updates URL in-place)
  const isBrowsePage = ["/templates", "/components", "/assets", "/skills"].includes(pathname);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = searchQ.trim();
      if (!q) return;

      if (isBrowsePage) {
        // On browse pages, update URL in-place (preserves current tab)
        const params = new URLSearchParams(searchParams.toString());
        if (q) params.set("q", q);
        else params.delete("q");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        // On other pages, redirect to /templates with search query
        router.push(`/templates?q=${encodeURIComponent(q)}`);
      }
    },
    [searchQ, isBrowsePage, pathname, router, searchParams],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQ(e.target.value);
      // On browse pages, update URL live (debounced via React's batching)
      if (isBrowsePage) {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("q", e.target.value);
        else params.delete("q");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [isBrowsePage, pathname, router, searchParams],
  );

  const isActive = (tab: (typeof NAV_TABS)[number]) => {
    if (pathname === tab.href) return true;
    return tab.activePaths?.some((p) => pathname.startsWith(p)) ?? false;
  };

  return (
    <header className={`header${headerScrolled ? " header-scrolled" : ""}`}>
      <div className="header-inner">
        {/* Left: Logo + Brand */}
        <div className="header-left">
          <a href="/" className="header-logo alextrix-logo">
            <div className="header-logo-icon">A</div>
            <span className="alextrix-name">Alextrix</span>
          </a>
        </div>

        {/* Center: Navigation (desktop only) */}
        <nav className="header-nav">
          {NAV_TABS.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              className={`header-tab${isActive(tab) ? " active" : ""}`}
            >
              {tab.label}
            </a>
          ))}
        </nav>

        {/* Right: Search + Theme Toggle + Mobile Menu */}
        <div className="header-right">
          {/* Search (desktop) */}
          <form className="header-search" onSubmit={handleSearch} role="search">
            <span className="header-search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              className="header-search-input"
              placeholder="Cari template, komponen..."
              value={searchQ}
              onChange={handleSearchChange}
              aria-label="Cari"
            />
            {searchQ && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => {
                  setSearchQ("");
                  if (isBrowsePage) {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("q");
                    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                  }
                }}
                aria-label="Hapus pencarian"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </form>

          {/* Theme Toggle (SVG) */}
          <ThemeToggle />

          {/* Mobile Hamburger */}
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
