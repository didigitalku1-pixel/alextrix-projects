"use client";

import { useState, useEffect, useCallback } from "react";

interface PromptItem {
  id: string;
  title: string;
  type: string;
  category: string;
  prompt_text: string | null;
  is_free: boolean;
  sort_order: number;
  preview_url: string | null;
  preview_type: string | null;
}

export default function PromptAIPage() {
  const [items, setItems] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/prompt-ai?type=${filter}&q=${encodeURIComponent(search)}`)
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  const copyPrompt = useCallback((item: PromptItem) => {
    if (!item.prompt_text) {
      setToast("Prompt text belum tersedia");
      return;
    }
    navigator.clipboard?.writeText(item.prompt_text).then(() => {
      setToast(`Prompt "${item.title}" disalin!`);
    }).catch(() => setToast("Salin gagal"));
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  const types = ["all", "hero", "landing"];

  return (
    <div className="app alextrix-app">
      <main className="main alextrix-homepage">
        <section className="alextrix-hero-section" style={{ paddingBottom: 32 }}>
          <div className="alextrix-hero-content">
            <p className="alextrix-hero-eyebrow">PROMPT.AI</p>
            <h1 className="alextrix-hero-headline" style={{ fontSize: 36 }}>AI Website Prompts</h1>
            <p className="alextrix-hero-subheadline">Koleksi 128 prompt AI untuk membuat website menakjubkan. Salin, tempel ke AI tools (Lovable, Bolt, Cursor, Claude), dan launch.</p>
          </div>
        </section>

        <section className="alextrix-featured-section">
          <div className="alextrix-section-header">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: "8px 16px", borderRadius: 999,
                    border: filter === t ? "1px solid #E65C00" : "1px solid #E8E2D5",
                    background: filter === t ? "#E65C00" : "#FFFFFF",
                    color: filter === t ? "#FFFFFF" : "#4B5563",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {t === "all" ? "Semua" : t === "hero" ? "Hero" : "Landing Page"}
                </button>
              ))}
            </div>
            <input
              type="text" placeholder="Cari prompt..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid #E8E2D5", fontSize: 13, width: 200, outline: "none" }}
            />
          </div>

          <div className="alextrix-featured-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)
            ) : items.length === 0 ? (
              <p style={{ color: "#9CA3AF", padding: 40, textAlign: "center" }}>Tidak ada prompt ditemukan.</p>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="card alextrix-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedPrompt(item)}
                >
                  <div className="card-image-wrap" style={{ aspectRatio: "16/10", background: "#0A0A0A", overflow: "hidden", position: "relative" }}>
                    {/* Preview image/video */}
                    {!imageErrors.has(item.id) && item.preview_url ? (
                      <img
                        src={item.preview_url}
                        alt={item.title}
                        className="card-image"
                        loading="lazy"
                        onError={() => handleImageError(item.id)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      // Fallback: dark bg with type label
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#E65C00", fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                          {item.type?.toUpperCase() || "HERO"}
                        </span>
                      </div>
                    )}
                    {/* Type badge */}
                    <span style={{
                      position: "absolute", top: 8, left: 8,
                      background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)",
                      color: "#FFFFFF", fontSize: 10, fontWeight: 600, padding: "3px 8px",
                      borderRadius: 6, fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {item.type?.toUpperCase() || "HERO"}
                    </span>
                  </div>
                  <div className="card-footer">
                    <h3 className="card-title" title={item.title}>{item.title}</h3>
                    <div className="card-meta">
                      <span className="card-author">{item.type}</span>
                      <span className="card-views">{item.prompt_text ? `${item.prompt_text.length.toLocaleString()} chars` : "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Modal */}
      {selectedPrompt && (
        <div
          onClick={() => setSelectedPrompt(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FFFFFF", borderRadius: 16, maxWidth: 760, width: "100%",
              maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
            }}
          >
            {/* Header with preview image */}
            <div style={{ position: "relative" }}>
              {selectedPrompt.preview_url && !imageErrors.has(selectedPrompt.id) ? (
                <img
                  src={selectedPrompt.preview_url}
                  alt={selectedPrompt.title}
                  onError={() => handleImageError(selectedPrompt.id)}
                  style={{ width: "100%", height: 200, objectFit: "cover", background: "#0A0A0A" }}
                />
              ) : (
                <div style={{ width: "100%", height: 120, background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#E65C00", fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    {selectedPrompt.title}
                  </span>
                </div>
              )}
              <button
                onClick={() => setSelectedPrompt(null)}
                style={{
                  position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)",
                  color: "#FFFFFF", border: "none", borderRadius: 8, width: 32, height: 32,
                  fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >×</button>
            </div>

            {/* Title bar */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E8E2D5" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selectedPrompt.title}</h2>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                {selectedPrompt.type} · {selectedPrompt.prompt_text?.length.toLocaleString() || 0} chars
              </p>
            </div>

            {/* Prompt text */}
            <div style={{ padding: 24, overflow: "auto", flex: 1 }}>
              {selectedPrompt.prompt_text ? (
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", color: "#111827", margin: 0 }}>
                  {selectedPrompt.prompt_text}
                </pre>
              ) : (
                <p style={{ color: "#9CA3AF", textAlign: "center", padding: 40 }}>
                  Prompt text belum tersedia.
                </p>
              )}
            </div>

            {/* Copy button */}
            {selectedPrompt.prompt_text && (
              <div style={{ padding: 16, borderTop: "1px solid #E8E2D5", textAlign: "center" }}>
                <button
                  onClick={() => copyPrompt(selectedPrompt)}
                  style={{
                    background: "#E65C00", color: "#FFFFFF", border: "none",
                    borderRadius: 10, padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  ⧉ Copy Prompt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="alextrix-toast show">{toast}</div>
      )}
    </div>
  );
}
