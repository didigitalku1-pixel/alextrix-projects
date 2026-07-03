"use client";

import { useEffect, useState, useCallback } from "react";

type ItemType = "template" | "component" | "asset" | "skill";
type TabType = "templates" | "components" | "assets" | "skills" | "design-md" | "learn" | "progress";

interface Item {
  id: string | number;
  type: ItemType;
  title: string;
  desc: string;
  tags: string[];
  image: string | null;
  views: number;
  forks: number;
  premium: boolean;
  featured: boolean;
  username: string | null;
  created_at: string | null;
  code_chars: number;
  file: string;
}

interface Stats {
  total_items: number;
  templates: number;
  components: number;
  assets: number;
  skills: number;
  featured: number;
  premium: number;
}

const PAGE_INFO: Record<string, { eyebrow: string; title: string; desc: string; pulseTitle: string }> = {
  templates: {
    eyebrow: "Landing Page Templates",
    title: "HTML, CSS, and React landing page templates",
    desc: "Browse reusable Aura landing page templates for SaaS, portfolio, ecommerce, and AI websites. Remix designs visually, edit templates in Aura, and export HTML, CSS, or React.",
    pulseTitle: "Template Pulse",
  },
  components: {
    eyebrow: "UI Components",
    title: "Reusable HTML, CSS, and React components",
    desc: "Browse reusable Aura UI components — hero sections, navigation, cards, forms, and more. Copy HTML or React code directly, or remix in Aura to customize.",
    pulseTitle: "Component Pulse",
  },
  assets: {
    eyebrow: "Stock Assets",
    title: "High-quality stock images and visual assets",
    desc: "Browse thousands of curated stock photos, illustrations, and visual assets for your designs. Filter by color, resolution, and category.",
    pulseTitle: "Asset Pulse",
  },
  skills: {
    eyebrow: "AI Skills",
    title: "AI agent skills and prompt templates",
    desc: "Browse AI agent skills — pre-configured prompt templates for design, coding, content creation, and more. Copy and use with any AI model.",
    pulseTitle: "Skill Pulse",
  },
  "design-md": {
    eyebrow: "Design Systems",
    title: "Design system specifications and documentation",
    desc: "Browse design systems with complete DESIGN.md specifications, color tokens, typography, and component documentation.",
    pulseTitle: "Design Pulse",
  },
};

export default function Home() {
  const [tab, setTab] = useState<TabType>("templates");
  const [sort, setSort] = useState("views");
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [premium, setPremium] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [page, setPage] = useState(1);
  const [dark, setDark] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  // Reset page on filter change
  useEffect(() => setPage(1), [tab, sort, tag, debouncedQ, premium, featured]);

  // Load stats and tags
  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
    fetch("/api/tags").then(r => r.json()).then(d => setTags(d.tags || [])).catch(() => {});
  }, []);

  // Load items
  const loadItems = useCallback(async () => {
    if (tab === "learn" || tab === "progress") return;
    setLoading(true);
    const apiType = tab === "templates" ? "template" : tab === "components" ? "component" : tab === "assets" ? "asset" : "skill";
    const params = new URLSearchParams({ type: apiType, sort, page: String(page), limit: "24" });
    if (tag) params.set("tag", tag);
    if (debouncedQ) params.set("q", debouncedQ);
    if (premium) params.set("premium", "true");
    if (featured) params.set("featured", "true");
    try {
      const r = await fetch(`/api/items?${params}`);
      const d = await r.json();
      setItems(d.items || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 0);
    } catch { setItems([]); }
    setLoading(false);
  }, [tab, sort, tag, debouncedQ, premium, featured, page]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const resetFilters = () => {
    setQ(""); setTag(null); setPremium(false); setFeatured(false); setPage(1);
  };

  const formatCount = (n: number) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n || 0);
  };

  const tabs: { id: TabType; label: string; count?: string }[] = [
    { id: "templates", label: "Templates", count: stats?.templates?.toLocaleString() },
    { id: "components", label: "Components", count: stats?.components?.toLocaleString() },
    { id: "assets", label: "Assets", count: stats?.assets?.toLocaleString() },
    { id: "skills", label: "Skills", count: stats?.skills?.toLocaleString() },
    { id: "design-md", label: "DESIGN.MD" },
    { id: "learn", label: "Learn" },
    { id: "progress", label: "Progress" },
  ];

  const info = PAGE_INFO[tab] || PAGE_INFO.templates;
  const pulseItems = tab === "templates" ? [
    { label: "Free", count: stats?.templates ? Math.floor(stats.templates * 0.95) : 0, color: "#10b981" },
    { label: "Pro", count: 496, color: "#f59e0b" },
    { label: "Paid", count: 58, color: "#a855f7" },
  ] : [
    { label: "All", count: stats ? (stats as any)[tab === "design-md" ? "templates" : tab] || 0 : 0, color: "#3b82f6" },
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
            {tabs.map(t => (
              <button
                key={t.id}
                className={`header-tab ${t.id === tab ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}{t.count && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10 }}>{t.count}</span>}
              </button>
            ))}
          </nav>
          <div className="header-right">
            <div className="header-search">
              <span className="header-search-icon">🔍</span>
              <input
                type="text"
                className="header-search-input"
                placeholder="Search..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              {q && <button className="header-search-clear" onClick={() => setQ("")}>✕</button>}
            </div>
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      {tab === "learn" ? (
        <LearnView />
      ) : tab === "progress" ? (
        <ProgressView />
      ) : tab === "design-md" ? (
        <DesignSystemsView />
      ) : (
        <main className="main">
          <div className="main-content">
            {/* Hero */}
            <div className="hero">
              <div className="hero-text">
                <p className="hero-eyebrow">{info.eyebrow}</p>
                <h1 className="hero-title">{info.title}</h1>
                <p className="hero-desc">{info.desc}</p>
              </div>
              <div className="pulse-box">
                <p className="pulse-title">{info.pulseTitle}</p>
                <div>
                  {pulseItems.map(p => (
                    <div key={p.label} className="pulse-item">
                      <span className="pulse-item-label">
                        <span className="pulse-item-dot" style={{ background: p.color }}></span>
                        {p.label}
                      </span>
                      <span className="pulse-item-count">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter chips */}
            {(tag || premium || featured) && (
              <div className="filter-chips">
                {tag && <span className="chip" onClick={() => setTag(null)}>#{tag} ✕</span>}
                {premium && <span className="chip" onClick={() => setPremium(false)}>Premium ✕</span>}
                {featured && <span className="chip" onClick={() => setFeatured(false)}>Featured ✕</span>}
              </div>
            )}

            {/* Sort + result info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {loading ? "Loading..." : <><strong style={{ color: "hsl(var(--foreground))" }}>{total.toLocaleString()}</strong> items{page > 1 && <span style={{ marginLeft: 8, fontSize: 12 }}>· Page {page} of {totalPages}</span>}</>}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(["views", "forks", "recent", "az"] as const).map(s => (
                  <button
                    key={s}
                    className={`pulse-item ${sort === s ? "active" : ""}`}
                    style={{ padding: "4px 10px", fontSize: 12, marginBottom: 0 }}
                    onClick={() => setSort(s)}
                  >
                    {s === "views" ? "Popular" : s === "forks" ? "Most forked" : s === "recent" ? "Recent" : "A → Z"}
                  </button>
                ))}
                <button
                  className={`pulse-item ${premium ? "active" : ""}`}
                  style={{ padding: "4px 10px", fontSize: 12, marginBottom: 0 }}
                  onClick={() => setPremium(!premium)}
                >
                  ★ Premium
                </button>
                <button
                  className={`pulse-item ${featured ? "active" : ""}`}
                  style={{ padding: "4px 10px", fontSize: 12, marginBottom: 0 }}
                  onClick={() => setFeatured(!featured)}
                >
                  ★ Featured
                </button>
                <button
                  className="pulse-item"
                  style={{ padding: "4px 10px", fontSize: 12, marginBottom: 0 }}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  🏷️ Tags
                </button>
              </div>
            </div>

            {/* Tag filter (collapsible) */}
            {showFilters && (
              <div style={{ marginBottom: 16, padding: 16, background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", marginBottom: 8, letterSpacing: "0.05em" }}>Tags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tags.map(t => (
                    <button
                      key={t.tag}
                      className={`tag-pill ${tag === t.tag ? "active" : ""}`}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        cursor: "pointer",
                        border: "1px solid hsl(var(--border))",
                        background: tag === t.tag ? "hsl(var(--primary))" : "transparent",
                        color: tag === t.tag ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                      }}
                      onClick={() => setTag(tag === t.tag ? null : t.tag)}
                    >
                      {t.tag} <span style={{ opacity: 0.6 }}>{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid">
                {Array.from({ length: 24 }).map((_, i) => <div key={i} className="skeleton" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📭</div>
                <p className="empty-title">No items found</p>
                <p className="empty-desc">Try adjusting your filters or search query.</p>
                <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={resetFilters}>Reset filters</button>
              </div>
            ) : (
              <div className="grid">
                {items.map(item => (
                  <a
                    key={`${item.type}-${item.id}`}
                    className="card"
                    href={`/detail/${item.type}/${item.type === "skill" ? item.file : item.id}`}
                  >
                    <div className="card-image-wrap">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="card-image"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.style.display = "none";
                            const p = t.parentElement;
                            if (p && !p.querySelector(".card-image-placeholder")) {
                              const d = document.createElement("div");
                              d.className = "card-image-placeholder";
                              d.textContent = "No preview";
                              p.appendChild(d);
                            }
                          }}
                        />
                      ) : (
                        <div className="card-image-placeholder">No preview</div>
                      )}
                      <div className="card-overlay"></div>
                      {item.premium && <span className="card-badge badge-pro">PRO</span>}
                      {(item.type === "template" || item.type === "component") && (
                        <div className="card-actions">
                          <span className="card-action-btn">📄 DESIGN.md</span>
                          <span className="card-action-btn">✨ Copy</span>
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <h3 className="card-title" title={item.title}>{item.title}</h3>
                      <div className="card-stats">
                        <span className="card-stat">👁 {formatCount(item.views)}</span>
                        {item.forks > 0 && <span className="card-stat">⑂ {formatCount(item.forks)}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
                <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{page} / {totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}

// === Learn View ===
function LearnView() {
  const [activePage, setActivePage] = useState("introduction");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/learn?page=${activePage}`)
      .then(r => r.json())
      .then(d => { setContent(d.content || "Konten belum tersedia."); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activePage]);

  const learnPages = [
    { id: "introduction", label: "Pengenalan" },
    { id: "tips-for-prompting", label: "Tips Prompting" },
    { id: "how-to-prompt", label: "Cara Prompt" },
    { id: "how-to-design", label: "Cara Edit" },
    { id: "seo-settings", label: "Pengaturan SEO" },
    { id: "faq", label: "FAQ" },
    { id: "custom-domain", label: "Domain Kustom" },
    { id: "video-tutorials", label: "Tutorial Video" },
    { id: "documentation", label: "Dokumentasi" },
  ];

  return (
    <main className="main">
      <div className="learn-layout">
        <aside className="learn-sidebar">
          <h3>Learn</h3>
          {learnPages.map(p => (
            <a
              key={p.id}
              className={p.id === activePage ? "active" : ""}
              onClick={e => { e.preventDefault(); setActivePage(p.id); }}
            >
              {p.label}
            </a>
          ))}
        </aside>
        <div className="learn-content">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          )}
        </div>
      </div>
    </main>
  );
}

// === Progress View ===
function ProgressView() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetch2 = () => {
      fetch("/api/progress").then(r => r.json()).then(setData).catch(() => {});
    };
    fetch2();
    const interval = setInterval(fetch2, 10000);
    return () => clearInterval(interval);
  }, []);

  const done = data?.progress?.done ? Object.keys(data.progress.done).length : 0;
  const cached = data?.progress?.stats?.cached || 0;
  const fresh = data?.progress?.stats?.fresh || 0;
  const errors = data?.progress?.stats?.errors || 0;
  const totalTemplates = 21435;
  const pct = totalTemplates > 0 ? (done / totalTemplates * 100) : 0;

  return (
    <main className="main">
      <div className="progress-page">
        <div className="progress-hero">
          <h1>Generation Progress</h1>
          <p>Real-time tracking of DESIGN.md and Copy Prompt generation for {totalTemplates.toLocaleString()} templates via Aura's Edge Function.</p>
        </div>
        <div className="progress-stats">
          <div className="progress-stat-card">
            <div className="progress-stat-label">Templates Done</div>
            <div className="progress-stat-value">{done.toLocaleString()}</div>
            <div className="progress-stat-sub">of {totalTemplates.toLocaleString()} ({pct.toFixed(1)}%)</div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Cached</div>
            <div className="progress-stat-value" style={{ color: "#10b981" }}>{cached.toLocaleString()}</div>
            <div className="progress-stat-sub">Reused from cache</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Fresh Generated</div>
            <div className="progress-stat-value" style={{ color: "#3b82f6" }}>{fresh.toLocaleString()}</div>
            <div className="progress-stat-sub">New from Edge Function</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Errors (403 Premium)</div>
            <div className="progress-stat-value" style={{ color: "#ef4444" }}>{errors.toLocaleString()}</div>
            <div className="progress-stat-sub">Skipped (premium content)</div>
          </div>
        </div>
        <div className="progress-section">
          <h3>Recent Activity (live log)</h3>
          <div className="progress-log">
            {data?.log?.length ? (
              data.log.map((line: string, i: number) => (
                <div key={i} className={`progress-log-line ${line.includes("ERROR") ? "error" : line.includes("✓") ? "success" : ""}`}>
                  {line}
                </div>
              ))
            ) : (
              <div style={{ color: "#888" }}>No log entries yet</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// === Design Systems View ===
function DesignSystemsView() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/items?type=template&sort=views&featured=true&limit=12")
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="main">
      <div className="main-content">
        <div style={{ marginBottom: 32 }}>
          <p className="hero-eyebrow">Design Systems</p>
          <h1 className="hero-title">Design system specifications and documentation</h1>
          <p className="hero-desc">Browse design systems with complete DESIGN.md specifications, color tokens, typography, and component documentation.</p>
        </div>
        {loading ? (
          <div className="grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {items.map(item => (
              <a key={item.id} className="card" href={`/detail/template/${item.id}`} style={{ maxWidth: "none" }}>
                <div className="card-image-wrap" style={{ aspectRatio: "21 / 9" }}>
                  {item.image ? <img src={item.image} alt={item.title} className="card-image" /> : <div className="card-image-placeholder">No preview</div>}
                  {item.premium && <span className="card-badge badge-pro">PRO</span>}
                </div>
                <div className="card-footer" style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{item.title}</h2>
                  {item.desc && <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 14, marginBottom: 12 }}>{item.desc}</p>}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                    {item.username && <span>by {item.username.slice(0, 20)}</span>}
                    <span>👁 {item.views.toLocaleString()} views</span>
                    {item.forks > 0 && <span>⑂ {item.forks.toLocaleString()}</span>}
                    {item.created_at && <span>{new Date(item.created_at).toLocaleDateString()}</span>}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {item.tags.slice(0, 8).map(t => <span key={t} className="tag-pill">{t}</span>)}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// === Markdown renderer ===
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
