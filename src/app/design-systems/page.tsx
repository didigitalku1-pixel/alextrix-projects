"use client";

import { useEffect, useState, useCallback } from "react";

interface DSItem {
  id: string;
  slug: string;
  title: string;
  desc: string;
  image: string | null;
  views: number;
  forks: number;
  featured: boolean;
  has_design_md: boolean;
  has_code: boolean;
  content_chars: number;
}

export default function DesignSystemsPage() {
  const [items, setItems] = useState<DSItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/design-systems?sort=${sort}&page=${page}&limit=24`);
      const d = await r.json();
      setItems(d.items || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 0);
    } catch { setItems([]); }
    setLoading(false);
  }, [sort, page]);

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => { setPage(1); }, [sort]);

  const sorts = [
    { id: "random", label: "RANDOM" },
    { id: "popular", label: "POPULAR" },
    { id: "recent", label: "RECENT" },
    { id: "az", label: "A-Z" },
  ];

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
        <div className="main-content">
          {/* Hero */}
          <div style={{ marginBottom: 32 }}>
            <p className="hero-eyebrow">DESIGN.md LIBRARY</p>
            <h1 className="hero-title">DESIGN.md templates for AI web design</h1>
            <p className="hero-desc">Browse, upload, or generate DESIGN.md systems for typography, colors, spacing, components, motion, and style rules. Aura turns websites and templates into reusable prompt context for stronger generated UIs.</p>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: "4px", borderRadius: 999, border: "1px solid hsl(var(--border))", width: "fit-content" }}>
            {sorts.map(s => (
              <button key={s.id} onClick={() => setSort(s.id)}
                style={{
                  padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                  background: sort === s.id ? "hsl(var(--primary))" : "transparent",
                  color: sort === s.id ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                }}>{s.label}</button>
            ))}
          </div>

          {/* Result count */}
          <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 16 }}>
            {loading ? "Loading..." : <><strong style={{ color: "hsl(var(--foreground))" }}>{total.toLocaleString()}</strong> design systems{page > 1 && <span style={{ marginLeft: 8, fontSize: 12 }}>· Page {page} of {totalPages}</span>}</>}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid">
              {Array.from({ length: 24 }).map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><p className="empty-title">No design systems found</p></div>
          ) : (
            <div className="grid">
              {items.map(item => (
                <a key={item.id} className="card" href={`/design-systems/${item.slug}`}>
                  <div className="card-image-wrap">
                    {item.image ? (
                      <img src={`/api/image?url=${encodeURIComponent(item.image)}`} alt={item.title} loading="lazy" className="card-image"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.style.display = "none";
                          const p = t.parentElement;
                          if (p && !p.querySelector(".card-image-placeholder")) {
                            const d = document.createElement("div");
                            d.className = "card-image-placeholder";
                            d.textContent = item.title.substring(0, 20);
                            p.appendChild(d);
                          }
                        }}
                      />
                    ) : (
                      <div className="card-image-placeholder">{item.title.substring(0, 20)}</div>
                    )}
                    {item.featured && <span className="card-badge badge-featured" style={{ background: "rgba(16, 185, 129, 0.95)" }}>★</span>}
                  </div>
                  <div className="card-footer">
                    <h3 className="card-title" title={item.title}>{item.title}</h3>
                    <div className="card-stats">
                      <span className="card-stat">👁 {item.views.toLocaleString()}</span>
                      {item.forks > 0 && <span className="card-stat">⑂ {item.forks}</span>}
                      {item.has_design_md && <span className="card-stat" style={{ marginLeft: "auto", color: "hsl(var(--muted-foreground))" }}>DESIGN.md</span>}
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
    </div>
  );
}
