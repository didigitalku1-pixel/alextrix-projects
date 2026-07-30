"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

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
  tags?: string[];
}

// Pulse stats removed - using clean layout

export default function DesignSystemsPage() {
  const [items, setItems] = useState<DSItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);
  
  const { isDark, toggle: toggleTheme } = useTheme();



  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/design-systems?sort=${sort}&page=${page}&limit=24`);
      if (!r.ok) throw new Error("Failed to fetch");
      const d = await r.json();
      setItems(d.items || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 0);
    } catch (e) {
      console.error("Design systems fetch error:", e);
      setItems([]);
    }
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
  ];

  return (
    <div className="app">
      <main className="main alextrix-app">
        <div className="main-content">
          {/* === Hero section === */}
          <div className="ds-hero">
            <p className="hero-eyebrow">DESIGN.md LIBRARY</p>
            <h1 className="hero-title">DESIGN.md templates for AI web design</h1>
            <p className="hero-desc">Browse, upload, or generate DESIGN.md systems for typography, colors, spacing, components, motion, and style rules. Aura turns websites and templates into reusable prompt context for stronger generated UIs.</p>
          {/* CTA buttons - disabled until upload feature is implemented */}
            <div className="ds-cta-row">
              <button className="ds-cta-primary" disabled title="Segera hadir">
                <span className="ds-cta-icon">+</span>
                Add DESIGN.md
              </button>
              <button className="ds-cta-secondary" disabled title="Segera hadir">
                <span className="ds-cta-icon">⬆</span>
                Import from Templates
              </button>
            </div>
          </div>



          {/* === Sort tabs === */}
          <div className="ds-sort-row">
            <div className="ds-sort-tabs">
              {sorts.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSort(s.id)}
                  className={`ds-sort-tab ${sort === s.id ? "active" : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* === Result count === */}
          <div className="ds-result-count">
            {loading ? (
              "Loading..."
            ) : (
              <>
                Showing <strong>{Math.min(page * 24, total)}</strong> of <strong>{total.toLocaleString()}</strong>
                {page > 1 && <span className="ds-page-info"> · Page {page} of {totalPages}</span>}
              </>
            )}
          </div>

          {/* === Grid === */}
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
                      <img
                        src={`/api/image?url=${encodeURIComponent(item.image)}`}
                        alt={item.title}
                        loading="lazy"
                        className="card-image"
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
                    {item.has_design_md && (
                      <span className="ds-card-badge">DESIGN.md</span>
                    )}
                  </div>
                  <div className="card-footer">
                    <h3 className="card-title" title={item.title}>{item.title}</h3>
                    {item.featured && <span className="card-pro-badge">FEATURED</span>}
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* === Pagination === */}
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
