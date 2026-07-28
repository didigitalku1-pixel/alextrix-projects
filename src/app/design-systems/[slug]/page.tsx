"use client";

import { use, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@/hooks/use-theme";

/**
 * Wraps raw HTML in full document with Tailwind CDN + dark bg (mirrors aura.build).
 *
 * SECURITY: No allow-same-origin in sandbox — content is user-controlled.
 */
function withTailwindAndAutoResize(html: string): string {
  const hasTailwind = /cdn\.tailwindcss\.com/i.test(html);
  const tailwindScript = hasTailwind
    ? ""
    : `<script src="https://cdn.tailwindcss.com"></script>`;

  const headInjection = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    ${tailwindScript}
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body { height: 100%; overflow: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000000; color: #ffffff; }
      .component-wrapper { width: 100%; height: 100%; padding: 0; box-sizing: border-box; overflow: auto; }
    </style>
  `;

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

export default function DesignSystemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [item, setItem] = useState<any>(null);
  const [tab, setTab] = useState<"design" | "html">("design");
  const [loading, setLoading] = useState(true);
  const { isDark, toggle: toggleTheme } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
    setItem(null);
    fetch(`/api/design-systems/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => {
        setItem(d);
        setLoading(false);
      })
      .catch((e) => {
        console.error("DS detail fetch error:", e);
        setLoading(false);
      });
  }, [slug]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error("Clipboard error:", e);
      alert("Copy failed. Please select and copy manually.");
    }
  };

  if (loading) {
    return (
      <div className="app">
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
      <div className="app">
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
            <p className="empty-title">Design system not found</p>
            <a
              href="/design-systems"
              className="btn btn-outline"
              style={{ marginTop: 16 }}
            >
              ← Back to Design Systems
            </a>
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: "templates", label: "Templates", href: "/?tab=templates" },
    { id: "components", label: "Components", href: "/?tab=components" },
    { id: "assets", label: "Assets", href: "/?tab=assets" },
    { id: "skills", label: "Skills", href: "/?tab=skills" },
    { id: "design-md", label: "DESIGN.MD", active: true },
  ];

  const visibleTabs: { id: typeof tab; label: string; icon: string; show: boolean }[] = [
    { id: "design", label: "DESIGN.md", icon: "📄", show: !!item.content },
    { id: "html", label: "Preview", icon: "👁", show: !!item.preview_html },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo">
            <div className="header-logo-icon">A</div>
          </a>
          <nav className="header-nav">
            {tabs.map((t) => (
              <a
                key={t.id}
                href={t.href || "/design-systems"}
                className={`header-tab ${t.active ? "active" : ""}`}
              >
                {t.label}
              </a>
            ))}
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
                <a href="/design-systems">Design Systems</a>
                {item.featured && (
                  <>
                    <span className="breadcrumb-sep">•</span>
                    <span>Featured</span>
                  </>
                )}
              </nav>
              <h1 className="detail-h1">{item.title}</h1>
              {item.desc && (
                <p className="about-desc" style={{ maxWidth: 800, marginTop: 12 }}>
                  {item.desc}
                </p>
              )}
              <div className="detail-meta-row" style={{ marginTop: 16 }}>
                <span className="detail-stat">
                  👁 {item.views?.toLocaleString() || 0} views
                </span>
                {item.forks > 0 && (
                  <span className="detail-stat">⑂ {item.forks} remixes</span>
                )}
                {item.featured && (
                  <span className="detail-stat">★ Featured</span>
                )}
                {item.created_at && (
                  <span className="detail-stat">
                    📅 {new Date(item.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="detail-hero-right">
              {item.content && (
                <button
                  className="btn-pro"
                  onClick={() => copyToClipboard(item.content, "DESIGN.md")}
                  style={{ textDecoration: "none", border: "none", cursor: "pointer" }}
                >
                  {copied === "DESIGN.md" ? "✓ Copied!" : "📋 Add to Prompt"}
                </button>
              )}
            </div>
          </div>

          <div className="preview-frame">
            <div className="preview-chrome">
              <div className="preview-traffic-lights">
                <span className="traffic-light red" />
                <span className="traffic-light yellow" />
                <span className="traffic-light green" />
              </div>
              <div className="preview-tabs">
                {visibleTabs
                  .filter((t) => t.show)
                  .map((t) => (
                    <button
                      key={t.id}
                      className={`preview-tab ${tab === t.id ? "active" : ""}`}
                      onClick={() => setTab(t.id)}
                    >
                      <span className="preview-tab-icon">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
              </div>
              {tab === "design" && item.content && (
                <button
                  className="preview-copy-btn"
                  onClick={() => copyToClipboard(item.content, "DESIGN.md")}
                >
                  {copied === "DESIGN.md" ? "✓ Copied!" : "Copy"}
                </button>
              )}
            </div>

            <div className="preview-content">
              {tab === "design" && item.content && (
                <div className="markdown-viewer">
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
              )}
              {tab === "html" && item.preview_html && (
                <div className="preview-iframe-wrap" style={{ aspectRatio: "16 / 10" }}>
                  <iframe
                    ref={iframeRef}
                    srcDoc={withTailwindAndAutoResize(item.preview_html)}
                    title="HTML Preview"
                    // SECURITY: NO allow-same-origin
                    sandbox="allow-scripts allow-popups"
                    className="preview-iframe"
                    loading="lazy"
                  />
                </div>
              )}
              {tab === "design" && !item.content && (
                <div className="artifact-empty">
                  <div style={{ fontSize: 40 }}>⚠️</div>
                  <h3>No DESIGN.md content</h3>
                </div>
              )}
            </div>
          </div>

          <section className="detail-section">
            <div className="about-grid">
              <div className="about-left">
                <h2 className="about-h2">About</h2>
                <p className="about-desc">{item.desc || "No description available."}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="about-tags">
                    {item.tags.map((t: string, i: number) => (
                      <span key={`${t}-${i}`} className="about-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="about-right">
                <h3 className="about-h3">Details</h3>
                <div className="about-stats">
                  <div className="about-stat-row">
                    <span>Views</span>
                    <span>{(item.views || 0).toLocaleString()}</span>
                  </div>
                  {item.forks > 0 && (
                    <div className="about-stat-row">
                      <span>Remixes</span>
                      <span>{item.forks}</span>
                    </div>
                  )}
                  <div className="about-stat-row">
                    <span>Type</span>
                    <span>Design System</span>
                  </div>
                  {item.created_at && (
                    <div className="about-stat-row">
                      <span>Created</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {item.updated_at && (
                    <div className="about-stat-row">
                      <span>Updated</span>
                      <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {item.source_name && (
                    <div className="about-stat-row">
                      <span>Source</span>
                      <span>{item.source_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
