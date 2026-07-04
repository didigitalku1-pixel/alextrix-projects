"use client";

import { useState, useEffect } from "react";

const LEARN_PAGES = [
  { id: "introduction", label: "Pengenalan", icon: "📖" },
  { id: "tips-for-prompting", label: "Tips Prompting", icon: "💡" },
  { id: "how-to-prompt", label: "Cara Prompt", icon: "✍️" },
  { id: "how-to-design", label: "Cara Edit Desain", icon: "🎨" },
  { id: "seo-settings", label: "Pengaturan SEO", icon: "🔍" },
  { id: "custom-domain", label: "Domain Kustom", icon: "🌐" },
  { id: "faq", label: "Pertanyaan Umum", icon: "❓" },
  { id: "video-tutorials", label: "Tutorial Video", icon: "🎬" },
  { id: "documentation", label: "Dokumentasi", icon: "📚" },
];

export default function LearnPage() {
  const [activePage, setActivePage] = useState("introduction");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/learn?page=${activePage}`)
      .then(r => r.json())
      .then(d => { setContent(d.content || "Konten belum tersedia."); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activePage]);

  const tabs = [
    { id: "templates", label: "Templates" },
    { id: "components", label: "Components" },
    { id: "assets", label: "Assets" },
    { id: "skills", label: "Skills" },
    { id: "design-md", label: "DESIGN.MD", href: "/design-systems" },
    { id: "learn", label: "Learn", active: true },
    { id: "progress", label: "Progress" },
  ];

  const currentPage = LEARN_PAGES.find(p => p.id === activePage);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            {tabs.map(t => (
              <a key={t.id} href={t.href || "/"} className={`header-tab ${t.active ? "active" : ""}`}>{t.label}</a>
            ))}
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="main" style={{ background: "hsl(var(--background))" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 0, minHeight: "calc(100vh - 80px)" }}>
          {/* Sidebar */}
          <aside style={{
            width: 260, flexShrink: 0, borderRight: "1px solid hsl(var(--border))",
            padding: "32px 0", position: "sticky", top: 80, height: "fit-content",
          }}>
            <div style={{ padding: "0 20px 20px", borderBottom: "1px solid hsl(var(--border))", marginBottom: 16 }}>
              <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>Dokumentasi</h2>
              <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Pelajari cara menggunakan Aura</p>
            </div>
            <nav>
              {LEARN_PAGES.map(page => (
                <button
                  key={page.id}
                  onClick={() => { setActivePage(page.id); setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "10px 20px", fontSize: 14, fontWeight: activePage === page.id ? 500 : 400,
                    color: activePage === page.id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    background: activePage === page.id ? "hsl(var(--secondary))" : "transparent",
                    border: "none", cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{page.icon}</span>
                  {page.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, padding: "48px 56px", maxWidth: 800 }}>
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
              <>
                {/* Breadcrumb */}
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Learn / {currentPage?.label}
                </div>
                {/* Title */}
                <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em", color: "hsl(var(--foreground))" }}>
                  {currentPage?.label}
                </h1>
                <div style={{ width: 48, height: 3, background: "hsl(var(--foreground))", marginBottom: 32, borderRadius: 2 }} />
                {/* Markdown content */}
                <div className="markdown" style={{ padding: 0, maxWidth: "none" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
                {/* Navigation footer */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 64, paddingTop: 24, borderTop: "1px solid hsl(var(--border))" }}>
                  {(() => {
                    const idx = LEARN_PAGES.findIndex(p => p.id === activePage);
                    const prev = idx > 0 ? LEARN_PAGES[idx - 1] : null;
                    const next = idx < LEARN_PAGES.length - 1 ? LEARN_PAGES[idx + 1] : null;
                    return (
                      <>
                        {prev ? (
                          <button onClick={() => setActivePage(prev.id)} style={{ display: "flex", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>← Sebelumnya</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: "hsl(var(--foreground))" }}>{prev.label}</span>
                          </button>
                        ) : <div />}
                        {next ? (
                          <button onClick={() => setActivePage(next.id)} style={{ display: "flex", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer", textAlign: "right" }}>
                            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Selanjutnya →</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: "hsl(var(--foreground))" }}>{next.label}</span>
                          </button>
                        ) : <div />}
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (text: string) => {
    let r = esc(text);
    r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
    r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
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
    else if (line.startsWith("- ") || line.startsWith("* ")) out.push(`<li>${inline(line.slice(2))}</li>`);
    else if (/^\d+\.\s/.test(line)) out.push(`<li>${inline(line.replace(/^\d+\.\s/, ""))}</li>`);
    else if (line.startsWith("> ")) out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else if (line.trim() === "") out.push(`<div style="height:16px"></div>`);
    else out.push(`<p>${inline(line)}</p>`);
  });
  if (inCode && codeLines.length) out.push(`<pre><code>${esc(codeLines.join("\n"))}</code></pre>`);
  return out.join("");
}
