"use client";

import { use, useState, useEffect, useRef } from "react";

/**
 * Wraps raw HTML in full document with Tailwind CDN + dark bg (mirrors aura.build).
 * No auto-resize postMessage — content scrolls inside fixed-height iframe.
 */
function withTailwindAndAutoResize(html: string): string {
  // Only inject Tailwind CDN if not already present
  const hasTailwind = /cdn\.tailwindcss\.com/i.test(html);
  const tailwindScript = hasTailwind ? "" : `<script src="https://cdn.tailwindcss.com"></script>`;

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

  // Case 1: Full HTML document — inject into existing <head>
  if (/<html[^>]*>/i.test(html) && /<\/html>/i.test(html)) {
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (match) => match + headInjection);
    } else {
      html = html.replace(/<html[^>]*>/i, (match) => match + "<head>" + headInjection + "</head>");
    }
    return html;
  }

  // Case 2: Raw HTML fragment — wrap in full document
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
  const [dark, setDark] = useState(false);
  // Fixed iframe height — content scrolls inside iframe (mirrors aura.build)
  // No fixed height — use aspect-ratio in CSS (mirrors aura.build)
  const [copied, setCopied] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setLoading(true);
    setItem(null);
    fetch(`/api/design-systems/${slug}`)
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(d => { setItem(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="app">
        <header className="header"><div className="header-inner"><a href="/" className="header-logo"><div className="header-logo-icon">A</div></a></div></header>
        <main className="main"><div className="loading-spinner"><div className="spinner" /></div></main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="app">
        <header className="header"><div className="header-inner"><a href="/" className="header-logo"><div className="header-logo-icon">A</div></a></div></header>
        <main className="main"><div className="empty"><div className="empty-icon">🔍</div><p className="empty-title">Design system not found</p><a href="/design-systems" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to Design Systems</a></div></main>
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
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            {tabs.map(t => (
              <a key={t.id} href={t.href || "/design-systems"}
                 className={`header-tab ${t.active ? "active" : ""}`}>{t.label}</a>
            ))}
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="main detail-main">
        <div className="detail-container">
          {/* === Hero section === */}
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
              {item.desc && <p className="about-desc" style={{ maxWidth: 800, marginTop: 12 }}>{item.desc}</p>}
              <div className="detail-meta-row" style={{ marginTop: 16 }}>
                <span className="detail-stat">👁 {item.views?.toLocaleString() || 0} views</span>
                {item.forks > 0 && <span className="detail-stat">⑂ {item.forks} remixes</span>}
                {item.featured && <span className="detail-stat">★ Featured</span>}
                {item.created_at && <span className="detail-stat">📅 {new Date(item.created_at).toLocaleDateString()}</span>}
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

          {/* === Preview frame (browser chrome) === */}
          <div className="preview-frame">
            <div className="preview-chrome">
              <div className="preview-traffic-lights">
                <span className="traffic-light red" />
                <span className="traffic-light yellow" />
                <span className="traffic-light green" />
              </div>
              <div className="preview-tabs">
                {visibleTabs.filter(t => t.show).map(t => (
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
                <button className="preview-copy-btn" onClick={() => copyToClipboard(item.content, "DESIGN.md")}>
                  {copied === "DESIGN.md" ? "✓ Copied!" : "Copy"}
                </button>
              )}
            </div>

            <div className="preview-content">
              {tab === "design" && item.content && (
                <div className="markdown-viewer" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }} />
              )}
              {tab === "html" && item.preview_html && (
                <div className="preview-iframe-wrap" style={{ aspectRatio: "16 / 10" }}>
                  <iframe
                    ref={iframeRef}
                    srcDoc={withTailwindAndAutoResize(item.preview_html)}
                    title="HTML Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    className="preview-iframe"
                    loading="eager"
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

          {/* === About section === */}
          <section className="detail-section">
            <div className="about-grid">
              <div className="about-left">
                <h2 className="about-h2">About</h2>
                <p className="about-desc">{item.desc || "No description available."}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="about-tags">
                    {item.tags.map((t: string) => (
                      <span key={t} className="about-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="about-right">
                <h3 className="about-h3">Details</h3>
                <div className="about-stats">
                  <div className="about-stat-row"><span>Views</span><span>{(item.views || 0).toLocaleString()}</span></div>
                  {item.forks > 0 && <div className="about-stat-row"><span>Remixes</span><span>{item.forks}</span></div>}
                  <div className="about-stat-row"><span>Type</span><span>Design System</span></div>
                  {item.created_at && <div className="about-stat-row"><span>Created</span><span>{new Date(item.created_at).toLocaleDateString()}</span></div>}
                  {item.updated_at && <div className="about-stat-row"><span>Updated</span><span>{new Date(item.updated_at).toLocaleDateString()}</span></div>}
                  {item.source_name && <div className="about-stat-row"><span>Source</span><span>{item.source_name}</span></div>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let inFrontmatter = false;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const renderInline = (text: string) => {
    let r = esc(text);
    r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
    r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    r = r.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return r;
  };
  lines.forEach((line, i) => {
    if (i === 0 && line.trim() === "---") { inFrontmatter = true; return; }
    if (inFrontmatter) {
      if (line.trim() === "---") { inFrontmatter = false; return; }
      if (line.includes(":") && !line.startsWith(" ")) {
        const [key, ...valParts] = line.split(":");
        const val = valParts.join(":").trim();
        out.push(`<div style="display:flex;gap:12px;padding:4px 0;border-bottom:1px solid hsl(var(--border))"><strong style="min-width:120px;color:hsl(var(--muted-foreground))">${esc(key)}</strong><span>${renderInline(val)}</span></div>`);
        return;
      }
      if (line.startsWith("  ") && line.includes(":")) {
        const [key, ...valParts] = line.trim().split(":");
        const val = valParts.join(":").trim();
        out.push(`<div style="display:flex;gap:12px;padding:2px 0 2px 24px"><span style="min-width:120px;color:hsl(var(--muted-foreground));font-size:13px">${esc(key)}</span><span style="font-size:13px">${renderInline(val)}</span></div>`);
        return;
      }
      return;
    }
    if (line.startsWith("```")) {
      if (inCode) { out.push(`<pre><code>${esc(codeLines.join("\n"))}</code></pre>`); codeLines = []; inCode = false; }
      else { inCode = true; }
      return;
    }
    if (inCode) { codeLines.push(line); return; }
    if (line.startsWith("# ")) out.push(`<h1>${esc(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) out.push(`<h2>${esc(line.slice(3))}</h2>`);
    else if (line.startsWith("### ")) out.push(`<h3>${esc(line.slice(4))}</h3>`);
    else if (line.startsWith("#### ")) out.push(`<h4>${esc(line.slice(5))}</h4>`);
    else if (line.startsWith("- ") || line.startsWith("* ")) out.push(`<li>${renderInline(line.slice(2))}</li>`);
    else if (/^\d+\.\s/.test(line)) out.push(`<li>${renderInline(line.replace(/^\d+\.\s/, ""))}</li>`);
    else if (line.startsWith("> ")) out.push(`<blockquote>${renderInline(line.slice(2))}</blockquote>`);
    else if (line.trim() === "") out.push(`<div style="height:12px"></div>`);
    else out.push(`<p>${renderInline(line)}</p>`);
  });
  if (inCode && codeLines.length) out.push(`<pre><code>${esc(codeLines.join("\n"))}</code></pre>`);
  return out.join("");
}
