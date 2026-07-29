"use client";

import { use, useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@/hooks/use-theme";

/**
 * Parse DESIGN.md frontmatter (YAML between --- markers) into structured data.
 * Returns { frontmatter, body } where frontmatter is a nested object.
 */
function parseDesignMd(content: string): {
  frontmatter: Record<string, any>;
  body: string;
} {
  if (!content) return { frontmatter: {}, body: "" };

  // Check for frontmatter delimiters
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!fmMatch) {
    return { frontmatter: {}, body: content };
  }

  const fmRaw = fmMatch[1];
  const body = fmMatch[2] || "";

  // Simple YAML parser for our flat/nested structure
  const frontmatter: Record<string, any> = {};
  const lines = fmRaw.split("\n");
  let currentKey = "";
  let currentObj: Record<string, any> | null = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // Top-level key (no leading space)
    if (!line.startsWith(" ") && line.includes(":")) {
      const idx = line.indexOf(":");
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();

      if (val === "" || val === undefined) {
        // Nested object starts
        currentKey = key;
        currentObj = {};
        frontmatter[key] = currentObj;
      } else {
        // Scalar value - strip quotes
        frontmatter[key] = val.replace(/^["']|["']$/g, "");
        currentKey = "";
        currentObj = null;
      }
    } else if (currentObj && line.startsWith("  ")) {
      // Nested key
      const trimmed = line.trim();
      if (trimmed.includes(":")) {
        const idx = trimmed.indexOf(":");
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        currentObj[key] = val;
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Wraps raw HTML in full document with Tailwind CDN + dark bg.
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

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DesignSystemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [item, setItem] = useState<any>(null);
  const [tab, setTab] = useState<"preview" | "design">("preview");
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
        // Default tab: preview if preview_html exists, else design
        setTab(d.preview_html ? "preview" : "design");
        setLoading(false);
      })
      .catch((e) => {
        console.error("DS detail fetch error:", e);
        setLoading(false);
      });
  }, [slug]);

  // Parse DESIGN.md content into frontmatter + body
  const { frontmatter, body } = useMemo(
    () => parseDesignMd(item?.content || ""),
    [item?.content],
  );

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

  const navTabs = [
    { id: "templates", label: "Templates", href: "/?tab=templates" },
    { id: "components", label: "Components", href: "/?tab=components" },
    { id: "assets", label: "Assets", href: "/?tab=assets" },
    { id: "skills", label: "Skills", href: "/?tab=skills" },
    { id: "design-md", label: "DESIGN.MD", active: true },
    { id: "learn", label: "Learn", href: "/learn/introduction" },
  ];

  const colors = frontmatter.colors || {};
  const typography = frontmatter.typography || {};
  const spacing = frontmatter.spacing || {};
  const rounded = frontmatter.rounded || {};

  return (
    <div className="app ds-app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo">
            <div className="header-logo-icon">A</div>
          </a>
          <nav className="header-nav">
            {navTabs.map((t) => (
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

      {/* Main content - 2 column layout */}
      <main className="main ds-main">
        <div className="ds-grid">
          {/* LEFT: Main column */}
          <div className="ds-main-col">
            {/* Hero */}
            <div className="ds-hero">
              <div className="ds-hero-top">
                <a href="/design-systems" className="ds-back-link">
                  ← Back to design systems
                </a>
              </div>
              <div className="ds-hero-content">
                <div className="ds-hero-left">
                  <h1 className="ds-title">{item.title}</h1>
                  {item.source_name && (
                    <div className="ds-filepath">
                      <span className="ds-filepath-icon">📄</span>
                      <code>{item.source_name}</code>
                    </div>
                  )}
                  {item.featured && (
                    <span className="ds-featured-badge">✦ Featured</span>
                  )}
                  {item.desc && (
                    <p className="ds-description">{item.desc}</p>
                  )}
                </div>
                <div className="ds-hero-actions">
                  {item.content && (
                    <button
                      className="ds-btn-primary"
                      onClick={() => copyToClipboard(item.content, "prompt")}
                    >
                      {copied === "prompt" ? "✓ Copied!" : "⚡ Add to Prompt"}
                    </button>
                  )}
                  {item.content && (
                    <button
                      className="ds-btn-ghost"
                      onClick={() => copyToClipboard(item.content, "design-md")}
                    >
                      {copied === "design-md" ? "✓ Copied!" : "⬇ DESIGN.md"}
                    </button>
                  )}
                  {item.preview_html && (
                    <button
                      className="ds-btn-ghost"
                      onClick={() => {
                        const blob = new Blob(
                          [withTailwindAndAutoResize(item.preview_html)],
                          { type: "text/html" },
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${item.slug || "design-system"}.html`;
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 5000);
                      }}
                    >
                      ⬇ HTML
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {item.preview_html && (
              <div className="ds-preview-card">
                <div className="ds-preview-chrome">
                  <div className="ds-traffic-lights">
                    <span className="traffic-light red" />
                    <span className="traffic-light yellow" />
                    <span className="traffic-light green" />
                  </div>
                  <span className="ds-preview-label">HTML Preview</span>
                  <span className="ds-preview-file">
                    {item.slug}.html
                  </span>
                </div>
                <div className="ds-preview-body">
                  <iframe
                    ref={iframeRef}
                    srcDoc={withTailwindAndAutoResize(item.preview_html)}
                    title="HTML Preview"
                    sandbox="allow-scripts allow-popups"
                    className="ds-preview-iframe"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* DESIGN.md Viewer Card */}
            {item.content && (
              <div className="ds-designmd-card">
                <div className="ds-designmd-header">
                  <span className="ds-section-label">DESIGN . MD</span>
                  <h2 className="ds-designmd-title">Prompt context source</h2>
                </div>

                {/* Frontmatter table */}
                {Object.keys(frontmatter).length > 0 && (
                  <div className="ds-fm-table">
                    {frontmatter.version && (
                      <FmRow label="version" value={frontmatter.version} />
                    )}
                    {frontmatter.name && (
                      <FmRow label="name" value={frontmatter.name} />
                    )}
                    {frontmatter.description && (
                      <FmRow
                        label="description"
                        value={frontmatter.description}
                      />
                    )}

                    {/* Colors */}
                    {Object.keys(colors).length > 0 && (
                      <FmGroup label="colors">
                        {Object.entries(colors).map(([k, v]) => (
                          <FmRow
                            key={k}
                            label={k}
                            value={String(v)}
                            swatch={String(v).startsWith("#") ? String(v) : undefined}
                          />
                        ))}
                      </FmGroup>
                    )}

                    {/* Typography */}
                    {Object.keys(typography).length > 0 && (
                      <FmGroup label="typography">
                        {Object.entries(typography).map(([k, v]) => (
                          <FmRow
                            key={k}
                            label={k}
                            value={typeof v === "object" ? JSON.stringify(v) : String(v)}
                          />
                        ))}
                      </FmGroup>
                    )}

                    {/* Spacing */}
                    {Object.keys(spacing).length > 0 && (
                      <FmGroup label="spacing">
                        {Object.entries(spacing).map(([k, v]) => (
                          <FmRow key={k} label={k} value={String(v)} />
                        ))}
                      </FmGroup>
                    )}

                    {/* Rounded */}
                    {Object.keys(rounded).length > 0 && (
                      <FmGroup label="rounded">
                        {Object.entries(rounded).map(([k, v]) => (
                          <FmRow key={k} label={k} value={String(v)} />
                        ))}
                      </FmGroup>
                    )}
                  </div>
                )}

                {/* Markdown body */}
                {body && (
                  <div className="ds-markdown-body">
                    <ReactMarkdown>{body}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="ds-sidebar">
            {/* Author */}
            <div className="ds-sb-card">
              <div className="ds-sb-label">AUTHOR</div>
              <div className="ds-author">
                <div className="ds-author-avatar">
                  {(item.username || item.created_by || "A")
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="ds-author-name">
                    {item.username || item.created_by || "Aura"}
                  </div>
                  <div className="ds-author-sub">Design system creator</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="ds-sb-card">
              <div className="ds-stats-grid">
                <div className="ds-stat-item">
                  <div className="ds-stat-num">
                    {(item.views || 0).toLocaleString()}
                  </div>
                  <div className="ds-sb-label">VIEWS</div>
                </div>
                <div className="ds-stat-item">
                  <div className="ds-stat-num">{item.forks || 0}</div>
                  <div className="ds-sb-label">USES</div>
                </div>
                <div className="ds-stat-item">
                  <div className="ds-stat-num">●</div>
                  <div className="ds-sb-label">LIGHT</div>
                </div>
              </div>
            </div>

            {/* Dates */}
            {item.created_at && (
              <div className="ds-sb-card">
                <div className="ds-sb-label">PUBLISHED</div>
                <div className="ds-date-primary">
                  {formatDate(item.created_at)}
                </div>
                {item.updated_at && (
                  <div className="ds-date-secondary">
                    Updated {formatDate(item.updated_at)}
                  </div>
                )}
              </div>
            )}

            {/* Visual Cards - Colors */}
            {Object.keys(colors).length > 0 && (
              <div className="ds-sb-card">
                <div className="ds-sb-label">VISUAL CARDS</div>
                <div className="ds-color-swatches">
                  {Object.entries(colors)
                    .filter(([, v]) => String(v).startsWith("#"))
                    .slice(0, 6)
                    .map(([k, v]) => (
                      <div key={k} className="ds-swatch-row">
                        <span
                          className="ds-swatch"
                          style={{ background: String(v) }}
                        />
                        <span className="ds-swatch-label">{k}</span>
                        <span className="ds-swatch-hex">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Typography */}
            {Object.keys(typography).length > 0 && (
              <div className="ds-sb-card">
                <div className="ds-sb-label">TYPOGRAPHY</div>
                <div className="ds-typo-list">
                  {Object.entries(typography).map(([k, v]: [string, any]) => (
                    <div key={k} className="ds-typo-card">
                      <div
                        className="ds-typo-sample"
                        style={{
                          fontFamily: v.fontFamily || "inherit",
                          fontSize: v.fontSize || "16px",
                          fontWeight: v.fontWeight || 400,
                        }}
                      >
                        Ag
                      </div>
                      <div className="ds-typo-meta">
                        <div className="ds-typo-name">{k}</div>
                        <div className="ds-typo-font">
                          {v.fontFamily} · {v.fontSize}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spacing */}
            {Object.keys(spacing).length > 0 && (
              <div className="ds-sb-card">
                <div className="ds-sb-label">SPACING</div>
                <div className="ds-spacing-list">
                  {Object.entries(spacing).map(([k, v]) => (
                    <div key={k} className="ds-spacing-row">
                      <span className="ds-spacing-label">{k}</span>
                      <span className="ds-spacing-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Radius */}
            {Object.keys(rounded).length > 0 && (
              <div className="ds-sb-card">
                <div className="ds-sb-label">RADIUS</div>
                <div className="ds-radius-list">
                  {Object.entries(rounded).map(([k, v]) => (
                    <div key={k} className="ds-radius-row">
                      <span
                        className="ds-radius-preview"
                        style={{ borderRadius: String(v) }}
                      />
                      <span className="ds-radius-label">{k}</span>
                      <span className="ds-radius-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <DsFooter />
    </div>
  );
}

/** Frontmatter row (key/value) */
function FmRow({
  label,
  value,
  swatch,
}: {
  label: string;
  value: string;
  swatch?: string;
}) {
  return (
    <div className="ds-fm-row">
      <span className="ds-fm-key">{label}</span>
      <span className="ds-fm-val">
        {swatch && (
          <span
            className="ds-fm-swatch"
            style={{ background: swatch }}
          />
        )}
        <code>{value}</code>
      </span>
    </div>
  );
}

/** Frontmatter group (e.g. colors, typography) */
function FmGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ds-fm-group">
      <div className="ds-fm-group-label">{label}</div>
      {children}
    </div>
  );
}

/** 5-column footer */
function DsFooter() {
  const cols = [
    {
      title: "PRODUCT",
      links: [
        { text: "Create", href: "/" },
        { text: "Templates", href: "/?tab=templates" },
        { text: "Components", href: "/?tab=components" },
        { text: "Assets", href: "/?tab=assets" },
        { text: "Skills", href: "/?tab=skills" },
        { text: "DESIGN.MD", href: "/design-systems" },
      ],
    },
    {
      title: "RESOURCES",
      links: [
        { text: "Learn", href: "/learn/introduction" },
        { text: "Introduction", href: "/learn/introduction" },
        { text: "How to Prompt", href: "/learn/tips-for-prompting" },
        { text: "How to Edit", href: "/learn/how-to-design" },
        { text: "FAQ", href: "/learn/faq" },
      ],
    },
    {
      title: "CONNECT",
      links: [
        { text: "Privacy", href: "/" },
        { text: "Terms", href: "/" },
        { text: "Support", href: "/" },
      ],
    },
  ];

  return (
    <footer className="ds-footer">
      <div className="ds-footer-container">
        <div className="ds-footer-top">
          <div className="ds-footer-brand">
            <div className="ds-footer-logo">A</div>
            <p className="ds-footer-tagline">
              AI landing page builder that creates stunning designs in seconds.
              No design skills needed. Export to HTML & Figma.
            </p>
          </div>
          <div className="ds-footer-cols">
            {cols.map((col) => (
              <div key={col.title} className="ds-footer-col">
                <h4 className="ds-footer-col-title">{col.title}</h4>
                {col.links.map((link) => (
                  <a key={link.text} href={link.href} className="ds-footer-link">
                    {link.text}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="ds-footer-bottom">
          <p>
            © {new Date().getFullYear()} Aura Library. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
