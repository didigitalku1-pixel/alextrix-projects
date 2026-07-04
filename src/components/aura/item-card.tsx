"use client";

import { ManifestItem } from "@/lib/aura-library";

interface Props {
  item: ManifestItem;
  onClick: (item: ManifestItem) => void;
}

export function ItemCard({ item, onClick }: Props) {
  return (
    <button className="card" onClick={() => onClick(item)}>
      <div className="card-image-wrap">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="card-image"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              const parent = t.parentElement;
              if (parent && !parent.querySelector(".card-image-fallback")) {
                t.style.display = "none";
                const fb = document.createElement("img");
                fb.className = "card-image card-image-fallback";
                fb.alt = item.title;
                fb.loading = "lazy";
                fb.src = `/api/skill-thumb?title=${encodeURIComponent(item.title)}&tags=${encodeURIComponent((item.tags || []).slice(0, 4).join(","))}`;
                parent.appendChild(fb);
              }
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/skill-thumb?title=${encodeURIComponent(item.title)}&tags=${encodeURIComponent((item.tags || []).slice(0, 4).join(","))}`}
            alt={item.title}
            loading="lazy"
            className="card-image"
          />
        )}

        <div className="card-badge-row">
          {item.premium && <span className="badge badge-pro">Pro</span>}
          {item.featured && <span className="badge badge-featured">★</span>}
        </div>

        <div className="card-badge-row-right">
          <span className={`badge ${item.type === "component" ? "badge-component" : "badge-template"}`}>
            {item.type === "component" ? "Component" : "Template"}
          </span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title" title={item.title}>{item.title}</h3>
        {item.desc && <p className="card-desc">{item.desc}</p>}

        {item.tags.length > 0 && (
          <div className="card-tags">
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} className="badge badge-outline">{t}</span>
            ))}
            {item.tags.length > 3 && (
              <span className="card-tag-more">+{item.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="card-stats">
          <span className="card-stat">👁 {formatCount(item.views)}</span>
          {item.forks > 0 && (
            <span className="card-stat">⑂ {formatCount(item.forks)}</span>
          )}
          <span className="card-stat card-stat-right">{formatCount(item.code_chars)}c</span>
        </div>
      </div>
    </button>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
