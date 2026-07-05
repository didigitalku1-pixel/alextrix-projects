"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ItemType = "template" | "component" | "asset" | "skill";
type TabType = "templates" | "components" | "assets" | "skills" | "design-md" | "learn" ;

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
  return (
    <Suspense fallback={<div className="app"><main className="main"><div className="loading-spinner"><div className="spinner" /></div></main></div>}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params (one-time read on mount)
  const [tab, setTabState] = useState<TabType>(() => {
    const t = searchParams.get("tab") as TabType;
    return ["templates", "components", "assets", "skills", "design-md", "learn"].includes(t || "")
      ? t!
      : "templates";
  });
  const [sort, setSort] = useState(() => searchParams.get("sort") || "views");
  const [tag, setTag] = useState<string | null>(searchParams.get("tag"));
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [premium, setPremium] = useState(searchParams.get("premium") === "true");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [page, setPageState] = useState(() => Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1));
  const [dark, setDark] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Wrapper setters that also sync to URL
  const setTab = useCallback((t: TabType) => { setTabState(t); setPageState(1); }, []);
  const setPage = useCallback((p: number | ((prev: number) => number)) => {
    setPageState(p);
  }, []);

  // Sync all state → URL (replace history to avoid back/forward spam)
  useEffect(() => {
    if (tab === "skills" || tab === "learn"  || tab === "design-md") {
      // These tabs have their own routes; don't pollute URL
      return;
    }
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (sort !== "views") params.set("sort", sort);
    if (tag) params.set("tag", tag);
    if (debouncedQ) params.set("q", debouncedQ);

    if (featured) params.set("featured", "true");
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    const newUrl = qs ? `/?${qs}` : "/";
    router.replace(newUrl, { scroll: false });
  }, [tab, sort, tag, debouncedQ, featured, page, router]);

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
  useEffect(() => setPage(1), [tab, sort, tag, debouncedQ, featured]);

  // Load stats and tags
  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
    fetch("/api/tags").then(r => r.json()).then(d => setTags(d.tags || [])).catch(() => {});
  }, []);

  // Load items
  const loadItems = useCallback(async () => {
    if (tab === "skills" || tab === "learn" ) return;
    setLoading(true);
    const apiType = tab === "templates" ? "template" : tab === "components" ? "component" : tab === "assets" ? "asset" : "skill";
    const params = new URLSearchParams({ type: apiType, sort, page: String(page), limit: "24" });
    if (tag) params.set("tag", tag);
    if (debouncedQ) params.set("q", debouncedQ);

    if (featured) params.set("featured", "true");
    try {
      const r = await fetch(`/api/items?${params}`);
      const d = await r.json();
      setItems(d.items || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 0);
    } catch { setItems([]); }
    setLoading(false);
  }, [tab, sort, tag, debouncedQ, featured, page]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const resetFilters = () => {
    setQ(""); setTag(null); setFeatured(false); setPage(1);
  };

  const formatCount = (n: number) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n || 0);
  };

  const tabs: { id: TabType; label: string; count?: string; href?: string }[] = [
    { id: "templates", label: "Templates", count: stats?.templates?.toLocaleString() },
    { id: "components", label: "Components", count: stats?.components?.toLocaleString() },
    { id: "assets", label: "Assets", count: stats?.assets?.toLocaleString() },
    { id: "skills", label: "Skills", count: stats?.skills?.toLocaleString() },
    { id: "design-md", label: "DESIGN.MD", href: "/design-systems" },
    { id: "learn", label: "Learn", href: "/learn/introduction" },
  ];

  const info = PAGE_INFO[tab] || PAGE_INFO.templates;
  const pulseItems = tab === "templates" ? [
    { label: "All", count: stats?.templates || 0, color: "#3b82f6" },
    { label: "Featured", count: stats?.featured || 0, color: "#10b981" },
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
              t.href ? (
                <a key={t.id} href={t.href} className="header-tab">
                  {t.label}{t.count && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10 }}>{t.count}</span>}
                </a>
              ) : (
                <button
                  key={t.id}
                  className={`header-tab ${t.id === tab ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}{t.count && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10 }}>{t.count}</span>}
                </button>
              )
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
      {tab === "skills" ? (
        <SkillsView />
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
            {(tag || featured) && (
              <div className="filter-chips">
                {tag && <span className="chip" onClick={() => setTag(null)}>#{tag} ✕</span>}
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
                    href={`/${item.type === "template" ? "templates" : item.type === "component" ? "components" : item.type === "asset" ? "assets" : "skills"}/${item.type === "skill" ? item.file : (item.slug || item.id)}`}
                  >
                    <div className="card-image-wrap">
                      {item.image ? (
                        <img
                          src={`/api/image?url=${encodeURIComponent(item.image)}`}
                          alt={item.title}
                          loading="lazy"
                          className="card-image"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            // Swap to branded placeholder instead of plain "No preview"
                            const p = t.parentElement;
                            if (p && !p.querySelector(".card-image-fallback")) {
                              t.style.display = "none";
                              const fb = document.createElement("img");
                              fb.className = "card-image card-image-fallback";
                              fb.alt = item.title;
                              fb.loading = "lazy";
                              fb.src = `/api/skill-thumb?title=${encodeURIComponent(item.title)}&tags=${encodeURIComponent((item.tags || []).slice(0, 4).join(","))}`;
                              p.appendChild(fb);
                            }
                          }}
                        />
                      ) : (
                        <img
                          src={`/api/skill-thumb?title=${encodeURIComponent(item.title)}&tags=${encodeURIComponent((item.tags || []).slice(0, 4).join(","))}`}
                          alt={item.title}
                          loading="lazy"
                          className="card-image"
                        />
                      )}
                      <div className="card-overlay"></div>
                      {item.featured && <span className="card-badge badge-featured">★</span>}
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
                  {item.image ? <img src={`/api/image?url=${encodeURIComponent(item.image)}`} alt={item.title} className="card-image" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = "none"; const p = t.parentElement; if (p && !p.querySelector(".card-image-placeholder")) { const d = document.createElement("div"); d.className = "card-image-placeholder"; d.textContent = item.title.substring(0, 20); p.appendChild(d); } }} /> : <div className="card-image-placeholder">{item.title.substring(0, 20)}</div>}
                  {item.featured && <span className="card-badge badge-featured">★</span>}
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

// === Skills View — Documentation Viewer (2-column layout) ===
function SkillsView() {
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [skillContent, setSkillContent] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  // Load all skills
  useEffect(() => {
    fetch("/api/items?type=skill&limit=200")
      .then(r => r.json())
      .then(d => {
        setSkills(d.items || []);
        setLoadingList(false);
        if (d.items && d.items.length > 0) {
          setSelectedSkill(d.items[0]);
        }
      })
      .catch(() => setLoadingList(false));
  }, []);

  // Load content for selected skill
  useEffect(() => {
    if (!selectedSkill) return;
    setLoadingContent(true);
    setSkillContent("");
    fetch(`/api/item/skill/${selectedSkill.file}`)
      .then(r => r.json())
      .then(d => {
        const content = d.content || "";
        setSkillContent(content);
        setLoadingContent(false);
      })
      .catch(() => setLoadingContent(false));
  }, [selectedSkill]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    skills.forEach(s => {
      (s.tags || []).forEach((t: string) => {
        tagMap.set(t, (tagMap.get(t) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [skills]);

  // Filter skills by search + tag
  const filteredSkills = useMemo(() => {
    let result = skills;
    if (activeTag) {
      result = result.filter(s => (s.tags || []).includes(activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.desc?.toLowerCase().includes(q) ||
        (s.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [skills, search, activeTag]);

  const formatCount = (n: number) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n || 0);
  };

  return (
    <main className="main" style={{ background: "hsl(var(--background))" }}>
      <div className="skills-doc-layout">
        {/* === Sidebar — list only, no search/tags === */}
        <aside className="skills-doc-sidebar">
          <div className="skills-doc-header">
            <h2 className="skills-doc-title">AI Skills</h2>
            <p className="skills-doc-subtitle">{filteredSkills.length} of {skills.length} skills</p>
          </div>

          {/* Skills list — full height */}
          <nav className="skills-doc-list">
            {loadingList ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : filteredSkills.length === 0 ? (
              <p className="skills-doc-empty">No skills found</p>
            ) : (
              filteredSkills.map(skill => (
                <button
                  key={skill.id}
                  className={`skills-doc-item ${selectedSkill?.id === skill.id ? "active" : ""}`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <div className="skills-doc-item-title">{skill.title}</div>
                  {skill.tags && skill.tags.length > 0 && (
                    <div className="skills-doc-item-tags">
                      {(skill.tags as string[]).slice(0, 2).map(t => (
                        <span key={t} className="skills-doc-item-tag">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="skills-doc-item-stats">
                    <span>👁 {formatCount(skill.views)}</span>
                    {skill.forks > 0 && <span>⑂ {formatCount(skill.forks)}</span>}
                  </div>
                </button>
              ))
            )}
          </nav>
        </aside>

        {/* === Content area === */}
        <div className="skills-doc-content">
          {/* Sticky search + filter bar */}
          <div className="skills-doc-toolbar">
            <div className="skills-doc-search">
              <input
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="skills-doc-search-input"
              />
            </div>
            {allTags.length > 0 && (
              <div className="skills-doc-tags">
                <button
                  className={`skills-doc-tag ${!activeTag ? "active" : ""}`}
                  onClick={() => setActiveTag(null)}
                >All</button>
                {allTags.slice(0, 8).map(([tag, count]) => (
                  <button
                    key={tag}
                    className={`skills-doc-tag ${activeTag === tag ? "active" : ""}`}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    {tag} <span className="skills-doc-tag-count">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loadingContent ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : selectedSkill ? (
            <>
              {/* Breadcrumb */}
              <div className="skills-doc-breadcrumb">
                Skills / {selectedSkill.title}
              </div>
              {/* Title */}
              <h1 className="skills-doc-h1">{selectedSkill.title}</h1>
              {selectedSkill.desc && (
                <p className="skills-doc-desc">{selectedSkill.desc}</p>
              )}
              {/* Meta */}
              <div className="skills-doc-meta">
                <span>👁 {formatCount(selectedSkill.views)} views</span>
                {selectedSkill.forks > 0 && <span>⑂ {formatCount(selectedSkill.forks)} remixes</span>}
              </div>
              {/* Tags */}
              {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                <div className="skills-doc-content-tags">
                  {(selectedSkill.tags as string[]).map(t => (
                    <span key={t} className="about-tag">{t}</span>
                  ))}
                </div>
              )}
              <div style={{ width: 48, height: 3, background: "hsl(var(--foreground))", marginBottom: 32, borderRadius: 2 }} />
              {/* Markdown content */}
              <div
                className="markdown skills-doc-markdown"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(skillContent) }}
              />
              {/* Action buttons */}
              <div className="skills-doc-actions">
                <a
                  href={`/skills/${selectedSkill.file}`}
                  className="btn-pro"
                  style={{ textDecoration: "none" }}
                >
                  ↗ Open Full Page
                </a>
                <button
                  className="preview-copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(skillContent);
                  }}
                >
                  📋 Copy Skill
                </button>
              </div>
            </>
          ) : (
            <div className="empty"><div className="empty-icon">🧩</div><p className="empty-title">Select a skill to read</p></div>
          )}
        </div>
      </div>
    </main>
  );
}
