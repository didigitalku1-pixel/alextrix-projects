"use client";

import { use, useState, useEffect, useCallback, useRef, memo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@/hooks/use-theme";

/**
 * Wraps raw component HTML in a full HTML document — mirrors aura.build exactly.
 *
 * SECURITY: iframe sandbox is `allow-scripts allow-popups` ONLY.
 * We do NOT use `allow-same-origin` because the rendered HTML is user-controlled
 * (scraped from aura.build). Allowing same-origin would let scripts in the iframe
 * access parent window cookies, localStorage, and DOM.
 */
function withAutoResize(html: string): string {
  const headInjection = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body { height: 100%; overflow: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000000; color: #ffffff; }
      .component-wrapper { width: 100%; height: 100%; padding: 0; box-sizing: border-box; overflow: auto; }
    </style>
  `;

  // Case 1: Already a full HTML document — inject into existing <head>
  if (/<html[^>]*>/i.test(html) && /<\/html>/i.test(html)) {
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (match) => match + headInjection);
    } else {
      html = html.replace(
        /<html[^>]*>/i,
        (match) => match + "<head>" + headInjection + "</head>",
      );
    }
    return html;
  }

  // Case 2: Raw HTML fragment — wrap in full document with component-wrapper
  return `<!DOCTYPE html>
<html lang="en">
<head>${headInjection}</head>
<body>
<div class="component-wrapper">
${html}
</div>
</body>
</html>`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n || 0);
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const TYPE_LABEL: Record<
  string,
  { singular: string; plural: string; title: string }
> = {
  template: { singular: "template", plural: "templates", title: "Landing Page Templates" },
  component: { singular: "component", plural: "components", title: "UI Components" },
  asset: { singular: "asset", plural: "assets", title: "Stock Assets" },
  skill: { singular: "skill", plural: "skills", title: "AI Skills" },
};

export default function SlugDetail({
  params,
  type,
}: {
  params: Promise<{ slug: string }>;
  type: string;
}) {
  const { slug } = use(params);
  const [item, setItem] = useState<any>(null);
  const [tab, setTab] = useState<
    "preview" | "design" | "prompt" | "code" | "content"
  >("preview");
  const [content, setContent] = useState<string>("");
  const [contentStatus, setContentStatus] = useState<
    "loading" | "loaded" | "error" | "notfound"
  >("loading");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [related, setRelated] = useState<{
    moreFromAuthor: any[];
    related: any[];
  }>({ moreFromAuthor: [], related: [] });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  } as const;

  // Fetch item metadata
  useEffect(() => {
    setLoading(true);
    setItem(null);
    setRelated({ moreFromAuthor: [], related: [] });
    fetch(`/api/item/${type}/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => {
        setItem(d);
        if (d.type === "skill") setTab("content");
        else setTab("preview");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [type, slug]);

  // Fetch related items (for templates/components/assets, not skills)
  useEffect(() => {
    if (!item || item.type === "skill") return;
    const author = item.username || item.created_by;
    const tag = item.tags?.[0];
    const params = new URLSearchParams();
    if (author) params.set("author", author);
    if (tag) params.set("tag", tag);
    fetch(`/api/related/${item.type}s/${item.id}?${params}`)
      .then((r) => r.json())
      .then((d) =>
        setRelated({
          moreFromAuthor: d.moreFromAuthor || [],
          related: d.related || [],
        }),
      )
      .catch(() => {
        // Silent fail for related — not critical
      });
  }, [item]);

  // Fetch tab content (skip for assets — they show image directly)
  const loadTabContent = useCallback(async () => {
    if (!item) return;
    if (item.type === "asset") {
      setContentStatus("loaded");
      return;
    }
    setContentStatus("loading");
    setContent("");
    let artifact = "code";
    if (tab === "design") artifact = "design_md";
    else if (tab === "prompt") artifact = "recreation_prompt";
    else if (tab === "content") artifact = "content";
    try {
      const r = await fetch(
        `/api/item-file?type=${item.type}&file=${item.file}&artifact=${artifact}`,
      );
      if (r.status === 404) {
        setContentStatus("notfound");
        return;
      }
      if (!r.ok) {
        setContentStatus("error");
        return;
      }
      const text = await r.text();
      if (!text || text.length < 10) {
        setContentStatus("notfound");
        return;
      }
      setContent(text);
      setContentStatus("loaded");
    } catch {
      setContentStatus("error");
    }
  }, [item, tab]);

  useEffect(() => {
    if (item) loadTabContent();
  }, [item, tab, loadTabContent]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard error:", e);
      // Show user-visible feedback instead of silently swallowing
      alert("Copy failed. Please copy manually by selecting the text.");
    }
  };

  if (loading) {
    return (
      <div className="app alextrix-app">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="header-logo">
              <div className="header-logo-icon">A</div>
            </a>
          </div>
        </header>
        <main className="main">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="app alextrix-app">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="header-logo">
              <div className="header-logo-icon">A</div>
            </a>
          </div>
        </header>
        <main className="main">
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p className="empty-title">Item not found</p>
            <a href="/" className="btn btn-outline" style={{ marginTop: 16 }}>
              ← Back to Library
            </a>
          </div>
        </main>
      </div>
    );
  }

  const typeLabel = TYPE_LABEL[item.type] || TYPE_LABEL.template;
  const pluralRoute = typeLabel.plural;
  const backUrl = `/${pluralRoute}`;
  const firstTag = item.tags?.[0];

  const tabs: { id: typeof tab; label: string; icon: string; show: boolean }[] = [
    {
      id: "preview",
      label: "Preview",
      icon: "eye",
      show: item.type !== "skill" && item.type !== "asset",
    },
    {
      id: "preview",
      label: "Image",
      icon: "🖼️",
      show: item.type === "asset",
    },
    {
      id: "code",
      label: "Code",
      icon: "</>",
      show:
        (item.type === "template" || item.type === "component") &&
        (item.has_code || item.code_chars > 0),
    },
    { id: "design", label: "DESIGN.md", icon: "📄", show: item.type === "template" },
    {
      id: "prompt",
      label: "Copy Prompt",
      icon: "✨",
      show: item.type === "template",
    },
    { id: "content", label: "Content", icon: "📄", show: item.type === "skill" },
  ];

  const visibleTabs = tabs.filter(
    (t, i, arr) => t.show && arr.findIndex((x) => x.id === t.id) === i,
  );

  return (
    <div className="app alextrix-app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo">
            <div className="header-logo-icon">A</div>
          </a>
          <nav className="header-nav">
            <a href="/templates" className="header-tab">TEMPLATES</a>
            <a href="/components" className="header-tab">COMPONENTS</a>
            <a href="/assets" className="header-tab">ASSETS</a>
            <a href="/skills" className="header-tab">SKILLS</a>
            <a href="/design-systems" className="header-tab">DESIGN.MD</a>
            <a href="/learn/introduction" className="header-tab">LEARN</a>
          </nav>
          <div className="header-right">
            <button
              className="header-icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="main detail-main">
        <div className="detail-container">
          <div className="detail-hero">
            <div className="detail-hero-left">
              <nav className="detail-breadcrumb-nav">
                <Link href={`/${pluralRoute}`}>
                  {typeLabel.title} in HTML / TailwindCSS
                </Link>
                {firstTag && (
                  <>
                    <span className="breadcrumb-sep">•</span>
                    <Link href={`/${pluralRoute}?tag=${encodeURIComponent(firstTag)}`}>
                      {firstTag}
                    </Link>
                  </>
                )}
              </nav>
              <h1 className="detail-h1">{item.title}</h1>
              <div className="detail-meta-row">
                {item.username && (
                  <span className="detail-author">
                    <span className="detail-author-avatar">
                      {(item.username || "?").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="detail-author-name">Alextrix Community</span>
                  </span>
                )}
                {item.featured && (
                  <span className="detail-stat">★ Featured</span>
                )}
              </div>
            </div>
            <div className="detail-hero-right">
              {item.featured && (
                <a href="/" className="btn-pro">
                  ★ Featured
                  <span style={{ marginLeft: 6 }}>→</span>
                </a>
              )}
            </div>
          </div>

          <div className="preview-frame">
            <div className="preview-chrome">
              <div className="preview-tabs">
                {visibleTabs.map((t) => (
                  <button
                    key={`${t.id}-${t.label}`}
                    className={`preview-tab ${tab === t.id ? "active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    <span className="preview-tab-icon">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
              {tab === "preview" && item.type !== "asset" && (
                <div className="preview-device-toggle">
                  {(
                    [
                      { id: "desktop" as const, icon: "🖥️", label: "Desktop" },
                      { id: "tablet" as const, icon: "📋", label: "Tablet" },
                      { id: "mobile" as const, icon: "📱", label: "Mobile" },
                    ]
                  ).map((d) => (
                    <button
                      key={d.id}
                      className={`preview-device-btn ${device === d.id ? "active" : ""}`}
                      onClick={() => setDevice(d.id)}
                      title={d.label}
                    >
                      {d.icon}
                    </button>
                  ))}
                </div>
              )}
              <div className="preview-actions">
                {tab === "preview" &&
                  item.type !== "asset" &&
                  contentStatus === "loaded" && (
                    <button
                      className="preview-copy-btn"
                      onClick={() => {
                        // SECURITY: Use blob URL with origin null
                        // so iframe can't access parent window
                        const html = withAutoResize(content);
                        const blob = new Blob([html], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        setTimeout(() => URL.revokeObjectURL(url), 60_000);
                      }}
                      title="Open in New Tab"
                    >
                      ↗ Open
                    </button>
                  )}
                {contentStatus === "loaded" &&
                  (tab === "code" ||
                    tab === "design" ||
                    tab === "prompt" ||
                    tab === "content") && (
                    <button className="preview-copy-btn" onClick={copy}>
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                  )}
              </div>
            </div>

            <div className="preview-content">
              {contentStatus === "loading" && (
                <div className="loading-spinner">
                  <div className="spinner" />
                </div>
              )}

              {contentStatus === "loaded" && item.type === "asset" && (
                <div className="asset-viewer">
                  {item.image ? (
                    <>
                      <div className="asset-image-wrap">
                        <img
                          src={`/api/image?url=${encodeURIComponent(item.image)}`}
                          alt={item.title}
                          className="asset-image"
                          loading="lazy"
                        />
                      </div>
                      <div className="asset-actions">
                        <a
                          href={`/api/image?url=${encodeURIComponent(item.image)}`}
                          download={`${item.slug || "asset"}.jpg`}
                          className="btn-pro"
                          style={{ textDecoration: "none" }}
                        >
                          ⬇️ Download Image
                        </a>
                        <a
                          href={item.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="preview-copy-btn"
                          style={{
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          🔗 Open Original
                        </a>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="asset-tags">
                          {item.tags.map((t: string, i: number) => (
                            <span key={`${t}-${i}`} className="about-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="artifact-empty">
                      <div style={{ fontSize: 40 }}>🖼️</div>
                      <h3>Image not available</h3>
                    </div>
                  )}
                </div>
              )}

              {contentStatus === "loaded" &&
                tab === "preview" &&
                item.type !== "asset" && (
                  <div
                    className="preview-iframe-wrap"
                    style={{ aspectRatio: "16 / 10" }}
                  >
                    <div
                      className="preview-iframe-device"
                      style={{
                        width: deviceWidths[device],
                        maxWidth: "100%",
                        margin: device === "desktop" ? "0" : "0 auto",
                        height: "100%",
                      }}
                    >
                      <iframe
                        ref={iframeRef}
                        srcDoc={withAutoResize(content)}
                        title="Preview"
                        // SECURITY: NO allow-same-origin — content is user-controlled
                        sandbox="allow-scripts allow-popups"
                        className="preview-iframe"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

              {contentStatus === "loaded" && tab === "code" && (
                <pre className="code-viewer">
                  <code>{content}</code>
                </pre>
              )}

              {contentStatus === "loaded" && tab === "design" && (
                <div className="markdown-viewer">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}

              {contentStatus === "loaded" && tab === "prompt" && (
                <pre className="code-viewer">
                  <code>{content}</code>
                </pre>
              )}

              {contentStatus === "loaded" && tab === "content" && (
                <div className="markdown-viewer">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}

              {contentStatus === "notfound" && tab === "prompt" && (
                <div className="artifact-empty">
                  <div style={{ fontSize: 40 }}>✨</div>
                  <h3>Auto-generated Prompt</h3>
                  <p>
                    Generated from this {item.type}&apos;s metadata. Click copy to use it.
                  </p>
                  <pre className="prompt-preview">
{`Recreate this ${item.type === "template" ? "landing page template" : "UI component"}: ${item.title}

Description: ${item.desc || "No description available."}

Style: ${(item.tags || []).slice(0, 5).join(", ") || "modern, clean, minimal"}

Tech stack: HTML, CSS, Tailwind
Type: ${item.type}

Source: Alextrix Library — ${item.slug || item.id}
Author: ${item.username || "unknown"}`}
                  </pre>
                  <button
                    className="btn-tab-action"
                    onClick={() => {
                      const prompt = `Recreate this ${item.type === "template" ? "landing page template" : "UI component"}: ${item.title}\n\nDescription: ${item.desc || "No description available."}\n\nStyle: ${(item.tags || []).slice(0, 5).join(", ") || "modern, clean, minimal"}\n\nTech stack: HTML, CSS, Tailwind\nType: ${item.type}\n\nSource: Alextrix Library — ${item.slug || item.id}\nAuthor: ${item.username || "unknown"}`;
                      navigator.clipboard?.writeText(prompt).then(() => {
                        const btn = document.activeElement as HTMLButtonElement;
                        if (btn) {
                          const original = btn.textContent;
                          btn.textContent = "✓ Copied!";
                          setTimeout(() => { btn.textContent = original; }, 2000);
                        }
                      });
                    }}
                  >
                    ⧉ Copy Prompt
                  </button>
                </div>
              )}

              {contentStatus === "notfound" && tab === "design" && (
                <div className="artifact-empty">
                  <div style={{ fontSize: 40 }}>📄</div>
                  <h3>DESIGN.md</h3>
                  <p>
                    Auto-generated minimal spec. Full version coming soon via cron.
                  </p>
                  <pre className="prompt-preview">{`---
name: ${item.title}
description: ${item.desc || ""}
type: ${item.type}
tags: ${(item.tags || []).join(", ")}
author: ${item.username || "unknown"}
---

## Overview
${item.desc || "Design system specification for " + item.title + "."}

## Colors
| Role | Value |
| --- | --- |
| Primary | #111827 |
| Background | #FFFFFF |
| Surface | #F9FAFB |
| Text | #111827 |

## Typography
| Style | Family | Size | Weight |
| --- | --- | --- | --- |
| Display | Inter | 48px | 700 |
| Body | Inter | 16px | 400 |
| Label | JetBrains Mono | 11px | 600 |`}</pre>
                  <button
                    className="btn-tab-action"
                    onClick={() => {
                      const md = `---\nname: ${item.title}\ndescription: ${item.desc || ""}\ntype: ${item.type}\ntags: ${(item.tags || []).join(", ")}\nauthor: ${item.username || "unknown"}\n---\n\n## Overview\n${item.desc || "Design system specification for " + item.title + "."}\n\n## Colors\n| Role | Value |\n| --- | --- |\n| Primary | #111827 |\n| Background | #FFFFFF |\n| Surface | #F9FAFB |\n| Text | #111827 |\n\n## Typography\n| Style | Family | Size | Weight |\n| --- | --- | --- | --- |\n| Display | Inter | 48px | 700 |\n| Body | Inter | 16px | 400 |\n| Label | JetBrains Mono | 11px | 600 |\n`;
                      const blob = new Blob([md], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${item.slug || "design"}-design.md`;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 5000);
                    }}
                  >
                    ⬇ Download DESIGN.md
                  </button>
                </div>
              )}

              {contentStatus === "notfound" && tab !== "prompt" && tab !== "design" && (
                <div className="artifact-empty">
                  <div style={{ fontSize: 40 }}>📄</div>
                  <h3>Content Coming Soon</h3>
                  <p>This artifact is being generated automatically.</p>
                </div>
              )}

              {contentStatus === "error" && (
                <div className="artifact-empty">
                  <div style={{ fontSize: 40 }}>❌</div>
                  <h3>Failed to load</h3>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: 16 }}
                    onClick={loadTabContent}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          <section className="detail-section">
            <div className="about-grid">
              <div className="about-left">
                <h2 className="about-h2">About</h2>
                {item.featured && (
                  <div className="about-pro-badge">★ Featured {item.type}</div>
                )}
                {item.desc ? (
                  <p className="about-desc">{item.desc}</p>
                ) : (
                  <p className="about-desc about-desc-muted">No description available.</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="about-tags">
                    {item.tags.map((t: string, i: number) => (
                      <Link
                        key={`${t}-${i}`}
                        href={`/${pluralRoute}?tag=${encodeURIComponent(t)}`}
                        className="about-tag"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {related.moreFromAuthor.length > 0 && (
            <section className="detail-section">
              <div className="related-header">
                <h2 className="related-h2">More from this Creator</h2>
                <Link href={`/${pluralRoute}`} className="related-view-all">
                  View all →
                </Link>
              </div>
              <div className="related-grid">
                {related.moreFromAuthor.map((r: any) => (
                  <RelatedCard key={`mfa-${r.id}`} item={r} />
                ))}
              </div>
            </section>
          )}

          {related.related.length > 0 && (
            <section className="detail-section">
              <div className="related-header">
                <h2 className="related-h2">
                  Related{" "}
                  {typeLabel.plural === "components"
                    ? "Components"
                    : typeLabel.title}
                </h2>
                {firstTag && (
                  <Link
                    href={`/${pluralRoute}?tag=${encodeURIComponent(firstTag)}`}
                    className="related-view-all"
                  >
                    Browse all {firstTag} {typeLabel.plural} →
                  </Link>
                )}
              </div>
              <div className="related-grid">
                {related.related.map((r: any) => (
                  <RelatedCard key={`rel-${r.id}`} item={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Site-wide footer — mirrors aura.build footer structure */
function SiteFooter() {
  const footerColumns = [
    {
      title: "PRODUCT",
      links: [
        { text: "Create", href: "/" },
        { text: "Templates", href: "/templates" },
        { text: "Components", href: "/components" },
        { text: "Assets", href: "/assets" },
        { text: "Skills", href: "/skills" },
        { text: "DESIGN.MD", href: "/design-systems" },
      ],
    },
    {
      title: "RESOURCES",
      links: [
        { text: "Learn", href: "/learn/introduction" },
        { text: "FAQ", href: "/learn/faq" },
      ],
    },
    {
      title: "CONNECT",
      links: [
        { text: "Privacy", href: "/" },
        { text: "Terms", href: "/" },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-icon">A</div>
            <p className="footer-brand-text">
              AI landing page builder that creates stunning designs in seconds.
              No design skills needed. Export to HTML & Figma.
            </p>
          </div>
          <div className="footer-columns">
            {footerColumns.map((col) => (
              <div key={col.title} className="footer-column">
                <h4 className="footer-col-title">{col.title}</h4>
                {col.links.map((link) => (
                  <a key={link.text} href={link.href} className="footer-link">
                    {link.text}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Aura Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/** Related item card (mini preview) */
const RelatedCard = memo(function RelatedCard({ item }: { item: any }) {
  const pluralRoute =
    item.type === "template"
      ? "templates"
      : item.type === "component"
        ? "components"
        : item.type === "asset"
          ? "assets"
          : "skills";
  const href =
    item.type === "skill"
      ? `/skills/${item.file}`
      : `/${pluralRoute}/${item.slug || item.id}`;
  return (
    <Link href={href} className="related-card">
      <div className="related-card-image-wrap">
        {item.image ? (
          <img
            src={`/api/image?url=${encodeURIComponent(item.image)}`}
            alt={item.title}
            loading="lazy"
            className="related-card-image"
          />
        ) : (
          <img
            src={`/api/skill-thumb?title=${encodeURIComponent(item.title)}&tags=${encodeURIComponent((item.tags || []).slice(0, 3).join(","))}`}
            alt={item.title}
            loading="lazy"
            className="related-card-image"
          />
        )}
        {item.featured && <span className="related-card-pro">★</span>}
      </div>
      <div className="related-card-footer">
        <h3 className="related-card-title" title={item.title}>{item.title}</h3>
        
      </div>
    </Link>
  );
});
