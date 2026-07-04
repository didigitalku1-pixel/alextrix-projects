"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";

/**
 * Injects an auto-resize script into the iframe's srcDoc HTML.
 * The script measures the actual content height (after fonts/images load)
 * and posts it to the parent window via postMessage.
 *
 * This solves the bug where component previews were truncated because the
 * iframe had a fixed `height: 700px` but the content was often >2000px tall.
 */
function withAutoResize(html: string): string {
  const script = `<script>(function(){
    var send = function(){
      var h = Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement ? document.documentElement.scrollHeight : 0
      );
      try { parent.postMessage({ source: 'aura-preview', height: h }, '*'); } catch (e) {}
    };
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      send();
    } else {
      document.addEventListener('DOMContentLoaded', send);
    }
    window.addEventListener('load', send);
    // Re-measure after a beat (in case fonts/images change layout)
    setTimeout(send, 100);
    setTimeout(send, 500);
    setTimeout(send, 1500);
    // Observe DOM mutations (animations, dynamic content)
    if (typeof MutationObserver !== 'undefined' && document.body) {
      new MutationObserver(function(){ send(); }).observe(document.body, { childList: true, subtree: true, attributes: true });
    }
    // Observe resize (responsive components)
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      new ResizeObserver(function(){ send(); }).observe(document.body);
    }
  })();</script>`;
  // Inject before </body> if present, else append
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, script + "</body>");
  }
  return html + script;
}

export default function SlugDetail({
  params,
  type,
}: {
  params: Promise<{ slug: string }>;
  type: string;
}) {
  const { slug } = use(params);
  const [item, setItem] = useState<any>(null);
  const [tab, setTab] = useState<"preview" | "design" | "prompt" | "code" | "content">("preview");
  const [content, setContent] = useState<string>("");
  const [contentStatus, setContentStatus] = useState<"loading" | "loaded" | "error" | "notfound">("loading");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number>(600); // sensible default
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for height messages from the iframe (auto-resize)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.source === "aura-preview" && typeof e.data.height === "number") {
        // Min 300px, max 4000px (no viewport clamp — let user scroll page for very tall content)
        const next = Math.max(300, Math.min(e.data.height + 20, 4000));
        setIframeHeight(next);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Reset iframe height when content changes (new tab/item)
  useEffect(() => {
    setIframeHeight(600);
  }, [content, tab]);

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
    fetch(`/api/item/${type}/${slug}`)
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(d => {
        setItem(d);
        if (d.type === "skill") setTab("content");
        else setTab("preview");
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [type, slug]);

  const loadTabContent = useCallback(async () => {
    if (!item) return;
    setContentStatus("loading");
    setContent("");
    let artifact = "code";
    if (tab === "design") artifact = "design_md";
    else if (tab === "prompt") artifact = "recreation_prompt";
    else if (tab === "content") artifact = "content";
    try {
      const r = await fetch(`/api/item-file?type=${item.type}&file=${item.file}&artifact=${artifact}`);
      if (r.status === 404) { setContentStatus("notfound"); return; }
      if (!r.ok) { setContentStatus("error"); return; }
      const text = await r.text();
      if (!text || text.length < 10) { setContentStatus("notfound"); return; }
      setContent(text);
      setContentStatus("loaded");
    } catch { setContentStatus("error"); }
  }, [item, tab]);

  useEffect(() => {
    if (item) loadTabContent();
  }, [item, tab, loadTabContent]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  if (loading) return (
    <div className="app">
      <header className="header"><div className="header-inner"><a href="/" className="header-logo"><div className="header-logo-icon">A</div></a></div></header>
      <main className="main"><div className="loading-spinner"><div className="spinner" /></div></main>
    </div>
  );

  if (!item) return (
    <div className="app">
      <header className="header"><div className="header-inner"><a href="/" className="header-logo"><div className="header-logo-icon">A</div></a></div></header>
      <main className="main"><div className="empty"><div className="empty-icon">🔍</div><p className="empty-title">Item not found</p><a href="/" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to Library</a></div></main>
    </div>
  );

  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1) + "s";
  const backUrl = `/?tab=${item.type}s`;

  const tabs: { id: typeof tab; label: string; show: boolean }[] = [
    { id: "preview", label: "👁 Preview", show: item.type !== "skill" },
    { id: "design", label: "📄 DESIGN.md", show: item.type === "template" },
    { id: "prompt", label: "✨ Copy Prompt", show: item.type === "template" },
    { id: "code", label: "</> Code", show: (item.type === "template" || item.type === "component") && (item.has_code || item.code_chars > 0) },
    { id: "content", label: "📄 Content", show: item.type === "skill" },
  ];

  const navTabs = [
    { id: "templates", label: "Templates", href: "/?tab=templates" },
    { id: "components", label: "Components", href: "/?tab=components" },
    { id: "assets", label: "Assets", href: "/?tab=assets" },
    { id: "skills", label: "Skills", href: "/?tab=skills" },
    { id: "design-md", label: "DESIGN.MD", href: "/design-systems" },
    { id: "learn", label: "Learn", href: "/learn" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            {navTabs.map(t => (
              <a key={t.id} href={t.href} className={`header-tab ${t.id === item.type + "s" ? "active" : ""}`}>{t.label}</a>
            ))}
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="detail-page">
          <a href={backUrl} className="detail-back">← Back to {typeLabel}</a>
          <div className="detail-header">
            <div className="detail-breadcrumb">{typeLabel} {item.tags?.length > 0 ? `• ${item.tags[0]}` : ""}</div>
            <h1 className="detail-title">{item.title}</h1>
            {item.desc && <p className="detail-desc">{item.desc}</p>}
            <div className="detail-meta">
              {item.username && <span className="detail-meta-item">by {item.username.slice(0, 20)}</span>}
              <span className="detail-meta-item">👁 {item.views?.toLocaleString() || 0}</span>
              {item.forks > 0 && <span className="detail-meta-item">⑂ {item.forks.toLocaleString()}</span>}
              <span className="detail-meta-item">📝 {(item.code_chars || 0).toLocaleString()} chars</span>
              {item.created_at && <span className="detail-meta-item">{new Date(item.created_at).toLocaleDateString()}</span>}
              {item.premium && <span className="badge badge-pro">PRO</span>}
              {item.featured && <span className="badge badge-featured">★ Featured</span>}
            </div>
          </div>
          <div className="detail-tabs">
            {tabs.filter(t => t.show).map(t => (
              <button key={t.id} className={`detail-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div className="detail-tab-panel">
            {contentStatus === "loading" && <div className="loading-spinner"><div className="spinner" /></div>}
            {contentStatus === "loaded" && tab === "preview" && (
              <iframe
                ref={iframeRef}
                srcDoc={withAutoResize(content)}
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                className="preview-pane"
                style={{ height: `${iframeHeight}px`, transition: "height 0.2s ease-out" }}
                loading="eager"
              />
            )}
            {contentStatus === "loaded" && tab === "code" && (
              <div className="code-pane-wrap">
                <button className="copy-btn" onClick={copy}>{copied ? "✓ Copied!" : "Copy HTML"}</button>
                <pre className="code-pane"><code>{content}</code></pre>
              </div>
            )}
            {contentStatus === "loaded" && tab === "design" && (
              <div className="code-pane-wrap" style={{ background: "hsl(var(--background))" }}>
                <button className="copy-btn" onClick={copy}>{copied ? "✓ Copied!" : "Copy DESIGN.md"}</button>
                <div className="markdown" style={{ background: "hsl(var(--background))" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
              </div>
            )}
            {contentStatus === "loaded" && tab === "prompt" && (
              <div className="code-pane-wrap">
                <button className="copy-btn" onClick={copy}>{copied ? "✓ Copied!" : "Copy Prompt"}</button>
                <pre className="code-pane"><code>{content}</code></pre>
              </div>
            )}
            {contentStatus === "loaded" && tab === "content" && (
              <div className="code-pane-wrap" style={{ background: "hsl(var(--background))" }}>
                <button className="copy-btn" onClick={copy}>{copied ? "✓ Copied!" : "Copy Content"}</button>
                <div className="markdown" style={{ background: "hsl(var(--background))" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
              </div>
            )}
            {contentStatus === "notfound" && (
              <div className="artifact-empty"><div className="artifact-empty-content">
                <div style={{ fontSize: 40 }}>⚠️</div>
                <h3>{tab === "design" ? "DESIGN.md not generated yet" : tab === "prompt" ? "Copy Prompt not generated yet" : "Content not available"}</h3>
                <p>{tab === "design" || tab === "prompt" ? "This artifact is being generated in the background." : ""}</p>
              </div></div>
            )}
            {contentStatus === "error" && (
              <div className="artifact-empty"><div className="artifact-empty-content">
                <div style={{ fontSize: 40 }}>❌</div>
                <h3>Failed to load</h3>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={loadTabContent}>Retry</button>
              </div></div>
            )}
          </div>
          {item.tags?.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.tags.map((t: string) => <span key={t} className="tag-pill">{t}</span>)}
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
