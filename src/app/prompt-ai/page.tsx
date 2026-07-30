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
  const [selectedPromptText, setSelectedPromptText] = useState<string | null>(null);
  const [loadingPromptText, setLoadingPromptText] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fetch list (lightweight — no prompt_text)
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

  // Fetch full prompt text when modal opens
  const openModal = useCallback(async (item: PromptItem) => {
    setSelectedPrompt(item);
    setSelectedPromptText(null);
    setLoadingPromptText(true);
    
    try {
      const res = await fetch(`/api/prompt-ai/${item.id}`);
      const d = await res.json();
      setSelectedPromptText(d.prompt_text || null);
    } catch {
      setSelectedPromptText(null);
    }
    setLoadingPromptText(false);
  }, []);

  const copyPrompt = useCallback((text: string, title: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setToast(`Prompt "${title}" disalin!`);
    }).catch(() => setToast("Salin gagal"));
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  const types = [
    { id: "all", label: "Semua" },
    { id: "hero", label: "Hero" },
    { id: "landing", label: "Landing Page" },
  ];

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
          {/* Filter + Search */}
          <div className="alextrix-section-header">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 999,
                    border: filter === t.id ? "1px solid #E65C00" : "1px solid #E8E2D5",
                    background: filter === t.id ? "#E65C00" : "#FFFFFF",
                    color: filter === t.id ? "#FFFFFF" : "#4B5563",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              type="text" placeholder="Cari prompt..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid #E8E2D5", fontSize: 13, width: 200, outline: "none" }}
            />
          </div>

          {/* Grid */}
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
                  onClick={() => openModal(item)}
                >
                  <div className="card-image-wrap" style={{ aspectRatio: "16/10", background: "#0A0A0A", overflow: "hidden", position: "relative" }}>
                    {!imageErrors.has(item.id) && item.preview_url ? (
                      <img
                        src={item.preview_url}
                        alt={item.title}
                        className="card-image"
                        loading="lazy"
                        width={300}
                        height={188}
                        onError={() => handleImageError(item.id)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#E65C00", fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                          {item.type?.toUpperCase() || "HERO"}
                        </span>
                      </div>
                    )}
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
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Modal — Horizontal 2-column layout */}
      {selectedPrompt && (
        <div
          onClick={() => { setSelectedPrompt(null); setSelectedPromptText(null); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FFFFFF", borderRadius: 16, maxWidth: 900, width: "100%",
              maxHeight: "85vh", overflow: "hidden",
              display: "flex", flexDirection: "row",
            }}
          >
            {/* LEFT: Preview image (40%) */}
            <div style={{ width: "40%", flexShrink: 0, background: "#0A0A0A", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selectedPrompt.preview_url && !imageErrors.has(selectedPrompt.id) ? (
                <img
                  src={selectedPrompt.preview_url}
                  alt={selectedPrompt.title}
                  onError={() => handleImageError(selectedPrompt.id)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 20 }}>
                  <span style={{ color: "#E65C00", fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
                    {selectedPrompt.title}
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT: Content (60%) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Title bar */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8E2D5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>{selectedPrompt.title}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                    {selectedPrompt.type} · {selectedPrompt.category}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedPrompt(null); setSelectedPromptText(null); }}
                  style={{
                    background: "transparent", color: "#9CA3AF", border: "none",
                    fontSize: 22, cursor: "pointer", padding: "0 4px", lineHeight: 1,
                  }}
                >×</button>
              </div>

              {/* Prompt text */}
              <div style={{ padding: "16px 20px", overflow: "auto", flex: 1 }}>
                {loadingPromptText ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                    <div className="spinner" style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #E8E2D5", borderTopColor: "#E65C00", animation: "spin 0.8s linear infinite" }} />
                  </div>
                ) : selectedPromptText ? (
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", color: "#111827", margin: 0 }}>
                    {selectedPromptText}
                  </pre>
                ) : (
                  <p style={{ color: "#9CA3AF", textAlign: "center", padding: 40, fontSize: 13 }}>
                    Prompt text belum tersedia.
                  </p>
                )}
              </div>

              {/* Copy button */}
              {selectedPromptText && (
                <div style={{ padding: 12, borderTop: "1px solid #E8E2D5", textAlign: "center" }}>
                  <button
                    onClick={() => copyPrompt(selectedPromptText, selectedPrompt.title)}
                    style={{
                      background: "#E65C00", color: "#FFFFFF", border: "none",
                      borderRadius: 10, padding: "10px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    ⧉ Copy Prompt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="alextrix-toast show">{toast}</div>
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          :global(.modal-horizontal) { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
