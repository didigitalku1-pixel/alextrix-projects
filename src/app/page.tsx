"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

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

interface TagInfo {
  tag: string;
  count: number;
}

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
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [debouncedQ, setDebouncedQ] = useState("");

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
    if (tab === "learn" || tab === "progress" || tab === "design-md") return;
    setLoading(true);
    const apiType = tab === "templates" ? "template" : tab === "components" ? "component" : tab === "assets" ? "asset" : "skill";
    const params = new URLSearchParams({
      type: apiType, sort, page: String(page), limit: "24",
    });
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

  const typeBadge = (type: ItemType) => {
    const map: Record<string, { cls: string; label: string }> = {
      template: { cls: "badge-template", label: "Template" },
      component: { cls: "badge-component", label: "Component" },
      asset: { cls: "badge-asset", label: "Asset" },
      skill: { cls: "badge-skill", label: "Skill" },
    };
    const m = map[type] || map.template;
    return <span className={`badge ${m.cls}`}>{m.label}</span>;
  };

  const tabs: { id: TabType; label: string; count?: string }[] = [
    { id: "templates", label: "Templates", count: stats?.templates?.toLocaleString() },
    { id: "components", label: "Components", count: stats?.components?.toLocaleString() },
    { id: "assets", label: "Assets", count: stats?.assets?.toLocaleString() },
    { id: "skills", label: "Skills", count: stats?.skills?.toLocaleString() },
    { id: "design-md", label: "Design Systems" },
    { id: "learn", label: "Learn" },
    { id: "progress", label: "Progress" },
  ];

  return (
    <div className="app">
      {/* Top Nav */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-icon">A</div>
          <span>Aura Library</span>
        </div>
        <div className="topnav-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`topnav-tab ${t.id === tab ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.count && <span className="topnav-tab-count">{t.count}</span>}
            </button>
          ))}
        </div>
        <div className="topnav-search">
          <span className="topnav-search-icon">🔍</span>
          <input
            type="text"
            className="topnav-search-input"
            placeholder="Search..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          {q && (
            <button className="topnav-search-clear" onClick={() => setQ("")}>✕</button>
          )}
        </div>
        <div className="topnav-actions">
          <button className="topnav-icon-btn" onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* Content */}
      {tab === "learn" ? (
        <LearnView />
      ) : tab === "progress" ? (
        <ProgressView />
      ) : tab === "design-md" ? (
        <DesignSystemsView />
      ) : (
        <div className="body">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-content">
              <section className="sidebar-section">
                <h3>Sort by</h3>
                <div className="sidebar-grid sidebar-grid-2">
                  {(["views", "forks", "recent", "az"] as const).map(s => (
                    <button
                      key={s}
                      className={`sidebar-btn ${sort === s ? "active" : ""}`}
                      onClick={() => setSort(s)}
                    >
                      {s === "views" ? "Most viewed" : s === "forks" ? "Most forked" : s === "recent" ? "Recent" : "A → Z"}
                    </button>
                  ))}
                </div>
              </section>
              <div className="sidebar-separator" />
              <section className="sidebar-section">
                <h3>Filter</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    className={`sidebar-toggle ${premium ? "active" : ""}`}
                    onClick={() => setPremium(!premium)}
                  >
                    <span style={{ color: "var(--amber)" }}>★</span> Premium only
                  </button>
                  <button
                    className={`sidebar-toggle ${featured ? "active" : ""}`}
                    onClick={() => setFeatured(!featured)}
                  >
                    <span style={{ color: "var(--blue)" }}>★</span> Featured only
                  </button>
                </div>
              </section>
              <div className="sidebar-separator" />
              <section className="sidebar-section">
                <div className="sidebar-section-header">
                  <h3>Tags</h3>
                  {tag && <button className="sidebar-clear" onClick={() => setTag(null)}>Clear</button>}
                </div>
                <div className="sidebar-tags-wrap">
                  {tags.map(t => (
                    <button
                      key={t.tag}
                      className={`sidebar-tag ${tag === t.tag ? "active" : ""}`}
                      onClick={() => setTag(tag === t.tag ? null : t.tag)}
                    >
                      <span>{t.tag}</span>
                      <span className="sidebar-tag-count">{t.count}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          {/* Main */}
          <main className="main">
            <div className="main-content">
              <div className="result-info">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    <strong>{total.toLocaleString()}</strong> items
                    {page > 1 && (
                      <span style={{ marginLeft: 8, fontSize: 12 }}>
                        · Page {page} of {totalPages}
                      </span>
                    )}
                    {(tag || premium || featured) && (
                      <span style={{ marginLeft: 12, display: "flex", gap: 6 }}>
                        {tag && <span className="chip" onClick={() => setTag(null)}>#{tag} ✕</span>}
                        {premium && <span className="chip chip-amber" onClick={() => setPremium(false)}>Premium ✕</span>}
                        {featured && <span className="chip chip-blue" onClick={() => setFeatured(false)}>Featured ✕</span>}
                      </span>
                    )}
                  </>
                )}
              </div>

              {loading ? (
                <div className="grid">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="skeleton" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <p className="empty-title">No items found</p>
                  <p className="empty-desc">Try adjusting your filters or search query.</p>
                  <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={resetFilters}>
                    Reset filters
                  </button>
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
                            onError={e => {
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
                        <div className="card-badge-row">
                          {item.premium && <span className="badge badge-pro">Pro</span>}
                          {item.featured && <span className="badge badge-featured">★</span>}
                        </div>
                        <div className="card-badge-row-right">
                          {typeBadge(item.type)}
                        </div>
                      </div>
                      <div className="card-body">
                        <h3 className="card-title" title={item.title}>{item.title}</h3>
                        {item.desc && <p className="card-desc">{item.desc}</p>}
                        {item.tags && item.tags.length > 0 && (
                          <div className="card-tags">
                            {item.tags.slice(0, 3).map(t => (
                              <span key={t} className="badge badge-outline">{t}</span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="card-tag-more">+{item.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="card-stats">
                          <span className="card-stat">👁 {formatCount(item.views)}</span>
                          {item.forks > 0 && <span className="card-stat">⑂ {formatCount(item.forks)}</span>}
                          <span className="card-stat card-stat-right">
                            {item.code_chars > 0 ? `${formatCount(item.code_chars)}c` : item.type}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
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
      .then(d => {
        setContent(d.content || "Konten belum tersedia.");
        setLoading(false);
      })
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
    <div style={{ display: "flex", maxWidth: 1280, margin: "0 auto", padding: 24 }}>
      <aside className="learn-sidebar">
        <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 8, padding: "0 12px" }}>Learn</h3>
        {learnPages.map(p => (
          <a
            key={p.id}
            className={p.id === activePage ? "active" : ""}
            onClick={e => { e.preventDefault(); setActivePage(p.id); }}
            href="#"
          >
            {p.label}
          </a>
        ))}
      </aside>
      <main style={{ flex: 1, minWidth: 0, paddingLeft: 32 }}>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        )}
      </main>
    </div>
  );
}

// === Progress View ===
function ProgressView() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetch2 = () => {
      fetch("/api/progress")
        .then(r => r.json())
        .then(setData)
        .catch(() => {});
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
            <div className="progress-stat-value" style={{ color: "var(--emerald)" }}>{cached.toLocaleString()}</div>
            <div className="progress-stat-sub">Reused from cache</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Fresh Generated</div>
            <div className="progress-stat-value" style={{ color: "var(--blue)" }}>{fresh.toLocaleString()}</div>
            <div className="progress-stat-sub">New from Edge Function</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-label">Errors (403 Premium)</div>
            <div className="progress-stat-value" style={{ color: "var(--red)" }}>{errors.toLocaleString()}</div>
            <div className="progress-stat-sub">Skipped (premium content)</div>
          </div>
        </div>
        <div className="progress-section">
          <h3>Recent Activity (live log)</h3>
          <div className="progress-log">
            {data?.log?.length ? (
              data.log.map((line: string, i: number) => (
                <div
                  key={i}
                  className={`progress-log-line ${line.includes("ERROR") ? "error" : line.includes("✓") ? "success" : ""}`}
                >
                  {line}
                </div>
              ))
            ) : (
              <div style={{ color: "var(--fg-muted)" }}>No log entries yet</div>
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
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Design Systems</h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 16 }}>
            Featured template collections with complete design specifications, AI prompts, and HTML code.
          </p>
        </div>
        {loading ? (
          <div className="grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {items.map(item => (
              <a
                key={item.id}
                className="card"
                href={`/detail/template/${item.id}`}
                style={{ maxWidth: "none" }}
              >
                <div className="card-image-wrap" style={{ aspectRatio: "21 / 9" }}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="card-image" />
                  ) : (
                    <div className="card-image-placeholder">No preview</div>
                  )}
                  <div className="card-badge-row">
                    {item.premium && <span className="badge badge-pro">Pro</span>}
                    {item.featured && <span className="badge badge-featured">★ Featured</span>}
                  </div>
                </div>
                <div className="card-body" style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{item.title}</h2>
                  {item.desc && <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 12 }}>{item.desc}</p>}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--fg-muted)" }}>
                    {item.username && <span>by {item.username.slice(0, 20)}</span>}
                    <span>👁 {item.views.toLocaleString()} views</span>
                    {item.forks > 0 && <span>⑂ {item.forks.toLocaleString()}</span>}
                    {item.created_at && <span>{new Date(item.created_at).toLocaleDateString()}</span>}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="card-tags" style={{ marginTop: 12 }}>
                      {item.tags.slice(0, 8).map(t => <span key={t} className="badge badge-outline">{t}</span>)}
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
