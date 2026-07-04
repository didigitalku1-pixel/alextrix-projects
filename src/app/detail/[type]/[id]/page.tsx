"use client";

import { use, useState, useEffect, useCallback } from "react";

export default function DetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = use(params);
  const [item, setItem] = useState<any>(null);
  const [tab, setTab] = useState<"preview" | "design" | "prompt" | "code" | "content">("preview");
  const [content, setContent] = useState<string>("");
  const [contentStatus, setContentStatus] = useState<"loading" | "loaded" | "error" | "notfound">("loading");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Fetch item metadata
  useEffect(() => {
    setLoading(true);
    setItem(null);
    fetch(`/api/item/${type}/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(d => {
        setItem(d);
        // For skills, default to "content" tab
        if (d.type === "skill") setTab("content");
        else setTab("preview");
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [type, id]);

  // Fetch tab content
  const loadTabContent = useCallback(async () => {
    if (!item) return;
    setContentStatus("loading");
    setContent("");

    // Map tab to artifact
    let artifact = "code";
    if (tab === "design") artifact = "design_md";
    else if (tab === "prompt") artifact = "recreation_prompt";
    else if (tab === "content") artifact = "content";
    else artifact = "code"; // preview or code

    try {
      const r = await fetch(`/api/item-file?type=${item.type}&file=${item.file}&artifact=${artifact}`);
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
    } catch {}
  };

  if (loading) {
    return (
      <div className="app">
        <header className="header"><div className="header-inner"><div className="header-left"><div className="header-logo-icon">A</div></div></div></header>
        <main className="main"><div className="loading-spinner"><div className="spinner" /></div></main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="app">
        <header className="header"><div className="header-inner"><div className="header-left"><a href="/"><div className="header-logo-icon">A</div></a></div></div></header>
        <main className="main">
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p className="empty-title">Item not found</p>
            <a href="/" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to Library</a>
          </div>
        </main>
      </div>
    );
  }

  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1) + "s";
  const formatCount = (n: number) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n || 0);
  };

  const tabs: { id: typeof tab; label: string; show: boolean }[] = [
    { id: "preview", label: "👁 Preview", show: item.type !== "skill" },
    { id: "design", label: "📄 DESIGN.md", show: item.type === "template" },
    { id: "prompt", label: "✨ Copy Prompt", show: item.type === "template" },
    { id: "code", label: "</> Code", show: (item.type === "template" || item.type === "component") && (item.has_code || item.code_chars > 0) },
    { id: "content", label: "📄 Content", show: item.type === "skill" },
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <a href="/" className="header-logo">
              <div className="header-logo-icon">A</div>
            </a>
          </div>
          <nav className="header-nav">
            <a href="/" className="header-tab active">{typeLabel.toUpperCase()}</a>
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Detail Page */}
      <main className="main">
        <div className="detail-page">
          {/* Breadcrumb */}
          <a href="/" className="detail-back">← Back to {typeLabel}</a>

          {/* Header */}
          <div className="detail-header">
            <div className="detail-breadcrumb">
              {typeLabel} {item.tags && item.tags.length > 0 ? `• ${item.tags[0]}` : ""}
            </div>
            <h1 className="detail-title">{item.title}</h1>
            {item.desc && (
              <p className="detail-desc">{item.desc}</p>
            )}
            <div className="detail-meta">
              {item.username && <span className="detail-meta-item">by {item.username.slice(0, 20)}</span>}
              <span className="detail-meta-item">👁 {item.views?.toLocaleString() || 0}</span>
              {item.forks > 0 && <span className="detail-meta-item">⑂ {item.forks.toLocaleString()}</span>}
              <span className="detail-meta-item">📝 {(item.code_chars || 0).toLocaleString()} chars</span>
              {item.created_at && (
                <span className="detail-meta-item">{new Date(item.created_at).toLocaleDateString()}</span>
              )}
              {item.premium && <span className="badge badge-pro">PRO</span>}
              {item.featured && <span className="badge badge-featured">★ Featured</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="detail-tabs">
            {tabs.filter(t => t.show).map(t => (
              <button
                key={t.id}
                className={`detail-tab ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="detail-tab-panel">
            {contentStatus === "loading" && (
              <div className="loading-spinner"><div className="spinner" /></div>
            )}

            {contentStatus === "loaded" && tab === "preview" && (
              <iframe
                srcDoc={content}
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                className="preview-pane"
              />
            )}

            {contentStatus === "loaded" && tab === "code" && (
              <div className="code-pane-wrap">
                <button className="copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy HTML"}
                </button>
                <pre className="code-pane"><code>{content}</code></pre>
              </div>
            )}

            {contentStatus === "loaded" && tab === "design" && (
              <div className="code-pane-wrap" style={{ background: "hsl(var(--background))" }}>
                <button className="copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy DESIGN.md"}
                </button>
                <div
                  className="markdown"
                  style={{ background: "hsl(var(--background))" }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              </div>
            )}

            {contentStatus === "loaded" && tab === "prompt" && (
              <div className="code-pane-wrap">
                <button className="copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy Prompt"}
                </button>
                <pre className="code-pane"><code>{content}</code></pre>
              </div>
            )}

            {contentStatus === "loaded" && tab === "content" && (
              <div className="code-pane-wrap" style={{ background: "hsl(var(--background))" }}>
                <button className="copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy Content"}
                </button>
                <div
                  className="markdown"
                  style={{ background: "hsl(var(--background))" }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              </div>
            )}

            {contentStatus === "notfound" && (
              <div className="artifact-empty">
                <div className="artifact-empty-content">
                  <div style={{ fontSize: 40 }}>⚠️</div>
                  <h3>{tab === "design" ? "DESIGN.md not generated yet" : tab === "prompt" ? "Copy Prompt not generated yet" : "Content not available"}</h3>
                  <p>
                    {tab === "design" || tab === "prompt"
                      ? "This artifact is generated via Aura's Edge Function. Check the Progress tab for generation status."
                      : "The code for this item is not available."}
                  </p>
                  {tab === "design" || tab === "prompt" ? (
                    <a href="/" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>View Progress →</a>
                  ) : null}
                </div>
              </div>
            )}

            {contentStatus === "error" && (
              <div className="artifact-empty">
                <div className="artifact-empty-content">
                  <div style={{ fontSize: 40 }}>❌</div>
                  <h3>Failed to load</h3>
                  <p>There was an error fetching this content. Please try again.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={loadTabContent}>Retry</button>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.tags.map((t: string) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            </div>
          )}
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
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const renderInline = (text: string) => {
    let r = esc(text);
    r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
    r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    r = r.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return r;
  };
  lines.forEach(line => {
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
