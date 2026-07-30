"use client";

import { FOOTER_COLUMNS, SOCIAL_LINKS } from "./nav-config";

/**
 * Global SiteFooter — rendered in layout.tsx on ALL pages.
 *
 * Features:
 * - 4-column layout (Brand/Product/Resources/Company)
 * - Social links (Twitter, GitHub, Discord)
 * - Language switcher
 * - Consistent branding: "Alextrix" everywhere
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="alextrix-footer">
      <div className="alextrix-footer-container">
        {/* Brand column */}
        <div className="alextrix-footer-brand">
          <div className="alextrix-footer-logo">A</div>
          <p className="alextrix-footer-tagline">
            Premium templates, components, and design systems. Export production-ready code instantly.
          </p>
          <div className="alextrix-footer-social">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="alextrix-footer-social-link"
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="alextrix-footer-col">
            <h4 className="alextrix-footer-col-title">{col.title}</h4>
            {col.links.map((link) => (
              <a key={link.text} href={link.href} className="alextrix-footer-link">
                {link.text}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="alextrix-footer-bottom">
        <p>© {year} Alextrix. Built with care for developers.</p>
        <div className="alextrix-footer-lang">
          <span aria-hidden="true">🌐</span>
          <select className="alextrix-footer-lang-select" defaultValue="en" aria-label="Select language">
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
      </div>
    </footer>
  );
}
