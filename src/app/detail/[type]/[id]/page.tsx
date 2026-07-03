"use client";

import { use, useState, useEffect } from "react";

export default function DetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = use(params);
  const [item, setItem] = useState<any>(null);
  const [tab, setTab] = useState<"preview" | "design" | "prompt" | "code">("preview");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/item/${type}/${id}`)
      .then(r => r.json())
      .then(d => { setItem(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type, id]);

  useEffect(() => {
    if (!item) return;
    setContent("");
    setTab("preview");
  }, [item]);

  useEffect(() => {
    if (!item) return;
    setContent("");
    const loadTab = async () => {
      if (tab === "preview" || tab === "code") {
        const r = await fetch(`/api/item-file?type=${item.type}&file=${item.file}&artifact=code`);
        if (r.ok) {
          const text = await r.text();
          setContent(text);
        }
      } else {
        const artifact = tab === "design" ? "design_md" : "recreation_prompt";
        const r = await fetch(`/api/item-file?type=${item.type}&file=${item.file}&artifact=${artifact}`);
        if (r.ok) {
          const text = await r.text();
          setContent(text);
        }
      }
    };
    loadTab();
  }, [tab, item]);

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
        <nav className="topnav">
          <div className="topnav-logo">
            <div className="topnav-logo-icon">A</div>
            <span>Aura Library</span>
          </div>
        </nav>
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="app">
        <nav className="topnav">
          <div className="topnav-logo">
            <div className="topnav-logo-icon">A</div>
            <span>Aura Library</span>
          </div>
        </nav>
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <p className="empty-title">Item not found</p>
          <a href="/" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to Library</a>
        </div>
      </div>
    );
  }

  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1) + "s";
  const formatCount = (n: number) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n || 0);
  };

  return (
    <div className="app">
      {/* Top Nav */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-icon">A</div>
          <span>Aura Library</span>
        </div>
        <div className="topnav-tabs">
          <a href="/" className="topnav-tab">{typeLabel}</a>
        </div>
        <div className="topnav-actions">
          <button className="topnav-icon-btn" onClick={() => document.documentElement.classList.toggle("dark")}>
            🌙
          </button>
        </div>
      </nav>

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
              <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 12 }}>{item.desc}</p>
            )}
            <div className="detail-meta">
              {item.username && <span className="detail-meta-item">by {item.username.slice(0, 20)}</span>}
              <span className="detail-meta-item">👁 {item.views?.toLocaleString() || 0}</span>
              {item.forks > 0 && <span className="detail-meta-item">⑂ {item.forks.toLocaleString()}</span>}
              <span className="detail-meta-item">📝 {(item.code_chars || 0).toLocaleString()} chars</span>
              {item.created_at && (
                <span className="detail-meta-item">{new Date(item.created_at).toLocaleDateString()}</span>
              )}
              {item.premium && <span className="badge badge-pro">Pro</span>}
              {item.featured && <span className="badge badge-featured">Featured</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="detail-tabs">
            <button
              className={`detail-tab ${tab === "preview" ? "active" : ""}`}
              onClick={() => setTab("preview")}
            >
              👁 Preview
            </button>
            {item.type === "template" && (
              <button
                className={`detail-tab ${tab === "design" ? "active" : ""}`}
                onClick={() => setTab("design")}
              >
                📄 DESIGN.md
              </button>
            )}
            {item.type === "template" && (
              <button
                className={`detail-tab ${tab === "prompt" ? "active" : ""}`}
                onClick={() => setTab("prompt")}
              >
                ✨ Copy Prompt
              </button>
            )}
            {item.has_code && (
              <button
                className={`detail-tab ${tab === "code" ? "active" : ""}`}
                onClick={() => setTab("code")}
              >
                &lt;/&gt; Code
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="detail-tab-panel">
            {!content && tab === "preview" && (
              <div className="loading-spinner"><div className="spinner" /></div>
            )}
            {content && tab === "preview" && (
              <iframe
                srcDoc={content}
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                className="preview-pane"
              />
            )}
            {content && tab === "code" && (
              <div className="code-pane-wrap">
                <button className="copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy HTML"}
                </button>
                <pre className="code-pane"><code>{content}</code></pre>
              </div>
            )}
            {content && tab === "design" && (
              <div className="code-pane-wrap" style={{ background: "var(--bg)" }}>
                <button className="copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy DESIGN.md"}
                </button>
                <div
                  className="markdown"
                  style={{ background: "var(--bg)" }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              </div>
            )}
            {content && tab === "prompt" && (
              <div className="code-pane-wrap">
                <button className="copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy Prompt"}
                </button>
                <pre className="code-pane"><code>{content}</code></pre>
              </div>
            )}
            {!content && tab !== "preview" && (
              <div className="artifact-empty">
                <div className="artifact-empty-content">
                  <div style={{ fontSize: 40 }}>⚠️</div>
                  <h3>Artifact not generated yet</h3>
                  <p>
                    This <code>{tab === "design" ? "design_md" : "recreation_prompt"}</code> needs to be
                    generated via Aura's Edge Function.
                  </p>
                  <p style={{ fontSize: 12, marginTop: 12 }}>
                    File expected at:{" "}
                    <code>
                      {item.type === "component" ? "components" : "templates"}/{item.file}.
                      {tab === "design" ? "design.md" : "prompt.md"}
                    </code>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tags</h3>
              <div className="card-tags">
                {item.tags.map((t: string) => (
                  <span key={t} className="badge badge-outline">{t}</span>
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
