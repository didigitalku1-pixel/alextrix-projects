"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

/**
 * Injects an auto-resize script into the iframe's srcDoc HTML.
 * The script measures the actual content height (after fonts/images load)
 * and posts it to the parent window via postMessage.
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
    setTimeout(send, 100);
    setTimeout(send, 500);
    setTimeout(send, 1500);
    if (typeof MutationObserver !== 'undefined' && document.body) {
      new MutationObserver(function(){ send(); }).observe(document.body, { childList: true, subtree: true, attributes: true });
    }
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      new ResizeObserver(function(){ send(); }).observe(document.body);
    }
  })();</script>`;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, script + "</body>");
  }
  return html + script;
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
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const TYPE_LABEL: Record<string, { singular: string; plural: string; title: string }> = {
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
  const [tab, setTab] = useState<"preview" | "design" | "prompt" | "code" | "content">("preview");
  const [content, setContent] = useState<string>("");
  const [contentStatus, setContentStatus] = useState<"loading" | "loaded" | "error" | "notfound">("loading");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number>(600);
  const [related, setRelated] = useState<{ moreFromAuthor: any[]; related: any[] }>({ moreFromAuthor: [], related: [] });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for height messages from the iframe (auto-resize)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.source === "aura-preview" && typeof e.data.height === "number") {
        const next = Math.max(300, Math.min(e.data.height + 20, 4000));
        setIframeHeight(next);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => { setIframeHeight(600); }, [content, tab]);

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  // Fetch item metadata
  useEffect(() => {
    setLoading(true);
    setItem(null);
    setRelated({ moreFromAuthor: [], related: [] });
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

  // Fetch related items (for templates/components/assets, not skills)
  useEffect(() => {
    if (!item || item.type === "skill") return;
    const author = item.username || item.created_by;
    const tag = item.tags?.[0];
    const params = new URLSearchParams();
    if (author) params.set("author", author);
    if (tag) params.set("tag", tag);
    fetch(`/api/related/${item.type}s/${item.id}?${params}`)
      .then(r => r.json())
      .then(d => setRelated({ moreFromAuthor: d.moreFromAuthor || [], related: d.related || [] }))
      .catch(() => {});
  }, [item]);

  // Fetch tab content
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

  useEffect(() => { if (item) loadTabContent(); }, [item, tab, loadTabContent]);

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

  const typeLabel = TYPE_LABEL[item.type] || TYPE_LABEL.template;
  const pluralRoute = typeLabel.plural;
  const backUrl = `/?tab=${pluralRoute}`;
  const firstTag = item.tags?.[0];

  const tabs: { id: typeof tab; label: string; icon: string; show: boolean }[] = [
    { id: "preview", label: "Preview", icon: "👁", show: item.type !== "skill" },
    { id: "code", label: "Code", icon: "</>", show: (item.type === "template" || item.type === "component") && (item.has_code || item.code_chars > 0) },
    { id: "design", label: "DESIGN.md", icon: "📄", show: item.type === "template" },
    { id: "prompt", label: "Copy Prompt", icon: "✨", show: item.type === "template" },
    { id: "content", label: "Content", icon: "📄", show: item.type === "skill" },
  ];

  const visibleTabs = tabs.filter(t => t.show);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            <a href="/?tab=templates" className="header-tab">TEMPLATES</a>
            <a href="/?tab=components" className="header-tab">COMPONENTS</a>
            <a href="/?tab=assets" className="header-tab">ASSETS</a>
            <a href="/?tab=skills" className="header-tab">SKILLS</a>
            <a href="/design-systems" className="header-tab">DESIGN.MD</a>
            <a href="/learn" className="header-tab">LEARN</a>
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="main detail-main">
        <div className="detail-container">
          {/* === Header section (title, breadcrumb, author, stats, CTA) === */}
          <div className="detail-hero">
            <div className="detail-hero-left">
              {/* Breadcrumb */}
              <nav className="detail-breadcrumb-nav">
                <Link href={`/?tab=${pluralRoute}`}>{typeLabel.title} in HTML / TailwindCSS</Link>
                {firstTag && (
                  <>
                    <span className="breadcrumb-sep">•</span>
                    <Link href={`/?tab=${pluralRoute}&tag=${encodeURIComponent(firstTag)}`}>{firstTag}</Link>
                  </>
                )}
              </nav>
              {/* Title */}
              <h1 className="detail-h1">{item.title}</h1>
              {/* Meta row: author + views + remixes + pro badge (clean, like aura.build) */}
              <div className="detail-meta-row">
                {item.username && (
                  <span className="detail-author">
                    <span className="detail-author-avatar">
                      {(item.username || "?").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="detail-author-name">by Creator</span>
                  </span>
                )}
                <span className="detail-stat">👁 {formatCount(item.views)} views</span>
                {item.forks > 0 && <span className="detail-stat">⑂ {formatCount(item.forks)} remixes</span>}
                {item.premium && <span className="detail-stat">👑 Pro</span>}
              </div>
            </div>
            <div className="detail-hero-right">
              {item.premium && (
                <a href="/" className="btn-pro">
                  Upgrade to Pro
                  <span style={{ marginLeft: 6 }}>→</span>
                </a>
              )}
            </div>
          </div>

          {/* === Preview section (browser-style chrome with tabs) === */}
          <div className="preview-frame">
            {/* Browser chrome */}
            <div className="preview-chrome">
              <div className="preview-traffic-lights">
                <span className="traffic-light red" />
                <span className="traffic-light yellow" />
                <span className="traffic-light green" />
              </div>
              <div className="preview-tabs">
                {visibleTabs.map(t => (
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
              {contentStatus === "loaded" && (tab === "code" || tab === "design" || tab === "prompt" || tab === "content") && (
                <button className="preview-copy-btn" onClick={copy}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              )}
            </div>

            {/* Content area */}
            <div className="preview-content">
              {contentStatus === "loading" && <div className="loading-spinner"><div className="spinner" /></div>}

              {contentStatus === "loaded" && tab === "preview" && (
                <iframe
                  ref={iframeRef}
                  srcDoc={withAutoResize(content)}
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  className="preview-iframe"
                  style={{ height: `${iframeHeight}px`, transition: "height 0.2s ease-out" }}
                  loading="eager"
                />
              )}

              {contentStatus === "loaded" && tab === "code" && (
                <pre className="code-viewer"><code>{content}</code></pre>
              )}

              {contentStatus === "loaded" && tab === "design" && (
                <div className="markdown-viewer" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
              )}

              {contentStatus === "loaded" && tab === "prompt" && (
                <pre className="code-viewer"><code>{content}</code></pre>
              )}

              {contentStatus === "loaded" && tab === "content" && (
                <div className="markdown-viewer" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
              )}

              {contentStatus === "notfound" && (
                <div className="artifact-empty">
                  <div style={{ fontSize: 40 }}>⚠️</div>
                  <h3>{tab === "design" ? "DESIGN.md not generated yet" : tab === "prompt" ? "Copy Prompt not generated yet" : "Content not available"}</h3>
                  <p>{tab === "design" || tab === "prompt" ? "This artifact is being generated in the background." : ""}</p>
                </div>
              )}

              {contentStatus === "error" && (
                <div className="artifact-empty">
                  <div style={{ fontSize: 40 }}>❌</div>
                  <h3>Failed to load</h3>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={loadTabContent}>Retry</button>
                </div>
              )}
            </div>
          </div>

          {/* === About section (description + tags) === */}
          <section className="detail-section">
            <div className="about-grid">
              <div className="about-left">
                <h2 className="about-h2">About</h2>
                {item.desc ? (
                  <p className="about-desc">{item.desc}</p>
                ) : (
                  <p className="about-desc about-desc-muted">No description available.</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="about-tags">
                    {item.tags.map((t: string) => (
                      <Link
                        key={t}
                        href={`/?tab=${pluralRoute}&tag=${encodeURIComponent(t)}`}
                        className="about-tag"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="about-right">
                <h3 className="about-h3">Creator</h3>
                <div className="about-author-card">
                  <div className="about-author-avatar">
                    {(item.username || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="about-author-name">Creator</div>
                    <div className="about-author-sub">{item.premium ? "Pro Member" : "Member"}</div>
                  </div>
                </div>
                <h3 className="about-h3" style={{ marginTop: 24 }}>Details</h3>
                <div className="about-stats">
                  <div className="about-stat-row"><span>Views</span><span>{formatCount(item.views)}</span></div>
                  {item.forks > 0 && <div className="about-stat-row"><span>Remixes</span><span>{formatCount(item.forks)}</span></div>}
                  <div className="about-stat-row"><span>Code size</span><span>{formatCount(item.code_chars)} chars</span></div>
                  {item.created_at && <div className="about-stat-row"><span>Created</span><span>{formatDate(item.created_at)}</span></div>}
                  {item.featured && <div className="about-stat-row"><span>Featured</span><span>★ Yes</span></div>}
                  <div className="about-stat-row"><span>Type</span><span style={{ textTransform: "capitalize" }}>{item.type}</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* === More from Creator === */}
          {related.moreFromAuthor.length > 0 && (
            <section className="detail-section">
              <div className="related-header">
                <h2 className="related-h2">More from this Creator</h2>
                <Link href={`/?tab=${pluralRoute}`} className="related-view-all">View all →</Link>
              </div>
              <div className="related-grid">
                {related.moreFromAuthor.map((r: any) => (
                  <RelatedCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}

          {/* === Related Components === */}
          {related.related.length > 0 && (
            <section className="detail-section">
              <div className="related-header">
                <h2 className="related-h2">Related {typeLabel.plural === "components" ? "Components" : typeLabel.title}</h2>
                {firstTag && (
                  <Link href={`/?tab=${pluralRoute}&tag=${encodeURIComponent(firstTag)}`} className="related-view-all">
                    Browse all {firstTag} {typeLabel.plural} →
                  </Link>
                )}
              </div>
              <div className="related-grid">
                {related.related.map((r: any) => (
                  <RelatedCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

/** Related item card (mini preview) */
function RelatedCard({ item }: { item: any }) {
  const pluralRoute = item.type === "template" ? "templates" : item.type === "component" ? "components" : item.type === "asset" ? "assets" : "skills";
  const href = item.type === "skill"
    ? `/skills/${item.file}`
    : `/${pluralRoute}/${item.slug}`;
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
        {item.premium && <span className="related-card-pro">PRO</span>}
      </div>
      <div className="related-card-footer">
        <h3 className="related-card-title" title={item.title}>{item.title}</h3>
        <div className="related-card-stats">
          <span>👁 {formatCount(item.views)}</span>
          {item.forks > 0 && <span>⑂ {formatCount(item.forks)}</span>}
        </div>
      </div>
    </Link>
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
