"use client";

import { use, useState, useEffect } from "react";

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

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    setLoading(true);
    setItem(null);
    fetch(`/api/design-systems/${slug}`)
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(d => { setItem(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard!`);
    }).catch(() => {});
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
    { id: "templates", label: "Templates" },
    { id: "components", label: "Components" },
    { id: "assets", label: "Assets" },
    { id: "skills", label: "Skills" },
    { id: "design-md", label: "DESIGN.MD", active: true },
    { id: "learn", label: "Learn" },
    { id: "progress", label: "Progress" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            {tabs.map(t => (
              <a key={t.id} href={t.id === "design-md" ? "/design-systems" : `/?tab=${t.id}`}
                 className={`header-tab ${t.active ? "active" : ""}`}>{t.label}</a>
            ))}
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="detail-page">
          {/* Breadcrumb + Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <a href="/design-systems" className="detail-back">← Back to design systems</a>
            <div style={{ display: "flex", gap: 8 }}>
              {item.content && (
                <button className="btn btn-sm" onClick={() => copyToClipboard(item.content, "DESIGN.md")}>
                  📋 Add to Prompt
                </button>
              )}
              <button className={`btn btn-sm ${tab === "design" ? "" : "btn-outline"}`} onClick={() => setTab("design")}>📄 DESIGN.md</button>
              {item.preview_html && (
                <button className={`btn btn-sm ${tab === "html" ? "" : "btn-outline"}`} onClick={() => setTab("html")}>🌐 HTML</button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="detail-header">
            {item.featured && <span className="badge badge-featured" style={{ marginBottom: 8 }}>Featured</span>}
            <h1 className="detail-title">{item.title}</h1>
            {item.desc && <p className="detail-desc">{item.desc}</p>}
            <div className="detail-meta">
              <span className="detail-meta-item">👁 {item.views?.toLocaleString() || 0} views</span>
              {item.forks > 0 && <span className="detail-meta-item">⑂ {item.forks} remixes</span>}
              {item.created_at && <span className="detail-meta-item">{new Date(item.created_at).toLocaleDateString()}</span>}
            </div>
          </div>

          {/* Content */}
          <div className="detail-tab-panel">
            {tab === "design" && item.content && (
              <div className="code-pane-wrap" style={{ background: "hsl(var(--background))" }}>
                <button className="copy-btn" onClick={() => copyToClipboard(item.content, "DESIGN.md")}>Copy DESIGN.md</button>
                <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }} />
              </div>
            )}
            {tab === "html" && item.preview_html && (
              <iframe srcDoc={item.preview_html} title="HTML Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                className="preview-pane" />
            )}
            {tab === "design" && !item.content && (
              <div className="artifact-empty"><div className="artifact-empty-content"><h3>No DESIGN.md content</h3></div></div>
            )}
          </div>
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
      // Render frontmatter as table rows
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
