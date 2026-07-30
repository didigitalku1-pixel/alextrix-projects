"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NAV_TABS } from "./nav-config";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Mobile navigation drawer (hamburger menu).
 * Slide-in from left, with backdrop overlay.
 */
export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (tab: (typeof NAV_TABS)[number]) => {
    if (pathname === tab.href) return true;
    return tab.activePaths?.some((p) => pathname.startsWith(p)) ?? false;
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        className="header-mobile-btn"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <nav
        className={`mobile-drawer${open ? " open" : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="mobile-drawer-header">
          <a href="/" className="header-logo alextrix-logo" onClick={() => setOpen(false)}>
            <div className="header-logo-icon">A</div>
            <span className="alextrix-name">Alextrix</span>
          </a>
          <button
            className="mobile-drawer-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mobile-drawer-nav">
          {NAV_TABS.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              className={`mobile-nav-tab${isActive(tab) ? " active" : ""}`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        <div className="mobile-drawer-footer">
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
}
