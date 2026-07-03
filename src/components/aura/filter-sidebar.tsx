"use client";

interface Props {
  type: "all" | "component" | "template";
  setType: (t: "all" | "component" | "template") => void;
  sort: "views" | "recent" | "forks" | "az";
  setSort: (s: "views" | "recent" | "forks" | "az") => void;
  tag: string | null;
  setTag: (t: string | null) => void;
  premium: boolean;
  setPremium: (b: boolean) => void;
  featured: boolean;
  setFeatured: (b: boolean) => void;
  tags: { tag: string; count: number }[];
  stats?: {
    total_items: number;
    components: number;
    templates: number;
  };
}

export function FilterSidebar({
  type,
  setType,
  sort,
  setSort,
  tag,
  setTag,
  premium,
  setPremium,
  featured,
  setFeatured,
  tags,
  stats,
}: Props) {
  return (
    <div className="sidebar-content">
      <section className="sidebar-section">
        <h3>Type</h3>
        <div className="sidebar-grid sidebar-grid-3">
          <button
            className={`sidebar-btn ${type === "all" ? "active" : ""}`}
            onClick={() => setType("all")}
          >
            All {stats && <span style={{ opacity: 0.7 }}>{stats.total_items.toLocaleString()}</span>}
          </button>
          <button
            className={`sidebar-btn ${type === "template" ? "active" : ""}`}
            onClick={() => setType("template")}
          >
            Tpl {stats && <span style={{ opacity: 0.7 }}>{stats.templates.toLocaleString()}</span>}
          </button>
          <button
            className={`sidebar-btn ${type === "component" ? "active" : ""}`}
            onClick={() => setType("component")}
          >
            Comp {stats && <span style={{ opacity: 0.7 }}>{stats.components.toLocaleString()}</span>}
          </button>
        </div>
      </section>

      <div className="sidebar-separator" />

      <section className="sidebar-section">
        <h3>Sort by</h3>
        <div className="sidebar-grid sidebar-grid-2">
          {([
            ["views", "Most viewed"],
            ["forks", "Most forked"],
            ["recent", "Recent"],
            ["az", "A → Z"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={`sidebar-btn ${sort === key ? "active" : ""}`}
              onClick={() => setSort(key)}
            >
              {label}
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
          {tag && (
            <button className="sidebar-clear" onClick={() => setTag(null)}>
              Clear
            </button>
          )}
        </div>
        {tags.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>Loading tags...</p>
        ) : (
          <div className="sidebar-tags-wrap">
            {tags.map(({ tag: t, count }) => (
              <button
                key={t}
                className={`sidebar-tag ${t === tag ? "active" : ""}`}
                onClick={() => setTag(t === tag ? null : t)}
              >
                <span>{t}</span>
                <span className="sidebar-tag-count">{count}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
