"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Learn page structure — mirrors aura.build/learn/introduction exactly.
 *
 * 3 groups:
 *   GETTING STARTED — Introduction, How to Edit Designs, Custom Domain, SEO Settings,
 *                     Selling Templates, Tips for Prompting, Typography Prompting,
 *                     Styling Prompting, Animation Prompting, Layout Prompting
 *   VIDEOS          — 18 video tutorials (links to /learn/video-tutorials#<slug>)
 *   RESOURCES       — Video Tutorials, Documentation, FAQ
 *
 * Each video entry is a hash-link to /learn/video-tutorials#<slug> (mirrors aura.build).
 */

interface LearnPage {
  id: string;
  label: string;
  group: "GETTING STARTED" | "VIDEOS" | "RESOURCES";
  hash?: string; // For video entries — link to /learn/video-tutorials#<hash>
  isVideo?: boolean;
}

const LEARN_PAGES: LearnPage[] = [
  // === GETTING STARTED ===
  { id: "introduction", label: "Introduction", group: "GETTING STARTED" },
  { id: "how-to-design", label: "How to Edit Designs", group: "GETTING STARTED" },
  { id: "custom-domain", label: "Custom Domain", group: "GETTING STARTED" },
  { id: "seo-settings", label: "SEO Settings", group: "GETTING STARTED" },
  { id: "selling-templates", label: "Selling Templates", group: "GETTING STARTED" },
  { id: "tips-for-prompting", label: "Tips for Prompting", group: "GETTING STARTED" },
  { id: "typography-prompting", label: "Typography Prompting", group: "GETTING STARTED" },
  { id: "styling-prompting", label: "Styling Prompting", group: "GETTING STARTED" },
  { id: "animation-prompting", label: "Animation Prompting", group: "GETTING STARTED" },
  { id: "layout-prompting", label: "Layout Prompting", group: "GETTING STARTED" },

  // === VIDEOS (18 entries — hash-links to /learn/video-tutorials#<slug>) ===
  { id: "video-tutorials", label: "Interactive Rain Hero", group: "VIDEOS", hash: "interactive-rain-hero-opus-48", isVideo: true },
  { id: "video-tutorials", label: "Brutalist Landing Page", group: "VIDEOS", hash: "design-to-website-brutalist-landing-page", isVideo: true },
  { id: "video-tutorials", label: "$20K Website Prompt", group: "VIDEOS", hash: "one-prompt-20000-website-claude-fable-5", isVideo: true },
  { id: "video-tutorials", label: "$20K AI Workflow", group: "VIDEOS", hash: "recreate-20000-website-ai-workflow", isVideo: true },
  { id: "video-tutorials", label: "GPT Images + Grok", group: "VIDEOS", hash: "gpt-images-grok-imagine-landing-page-workflow", isVideo: true },
  { id: "video-tutorials", label: "Avoid AI Slop", group: "VIDEOS", hash: "avoid-ai-slop-vibe-coded-landing-pages", isVideo: true },
  { id: "video-tutorials", label: "Claude 4.8 vs GPT-5.5", group: "VIDEOS", hash: "claude-opus-48-vs-gpt-55-landing-pages", isVideo: true },
  { id: "video-tutorials", label: "AI Landing Pages with Media", group: "VIDEOS", hash: "gpt-image-2-gpt-55-landing-page", isVideo: true },
  { id: "video-tutorials", label: "GPT Image to Landing Page", group: "VIDEOS", hash: "gpt-image-2-gpt-55-landing-page", isVideo: true },
  { id: "video-tutorials", label: "DESIGN.md Workflow", group: "VIDEOS", hash: "design-md-ai-web-design-workflow", isVideo: true },
  { id: "video-tutorials", label: "GPT 5.5 + DESIGN.md", group: "VIDEOS", hash: "better-landing-pages-gpt-55-design-md", isVideo: true },
  { id: "video-tutorials", label: "Complex Animations", group: "VIDEOS", hash: "complex-animations-chatgpt-design-md", isVideo: true },
  { id: "video-tutorials", label: "DESIGN.md Better AI Design", group: "VIDEOS", hash: "design-md-file-ai-design-better", isVideo: true },
  { id: "video-tutorials", label: "Animated WebGL Pages", group: "VIDEOS", hash: "animated-webgl-gemini-design-md", isVideo: true },
  { id: "video-tutorials", label: "Gemini 3 Landing Pages", group: "VIDEOS", hash: "gemini-3-pro-level-landing-page", isVideo: true },
  { id: "video-tutorials", label: "Gemini 3 Animations", group: "VIDEOS", hash: "gemini-3-animations", isVideo: true },
  { id: "video-tutorials", label: "Gemini 3 Changes Everything", group: "VIDEOS", hash: "gemini-3-changes-everything", isVideo: true },
  { id: "video-tutorials", label: "Using GPT 5.1 for Creating UIs", group: "VIDEOS", hash: "gpt-51-creating-uis", isVideo: true },
  { id: "video-tutorials", label: "Aura Compose Workflow", group: "VIDEOS", hash: "aura-compose-workflow", isVideo: true },
  { id: "video-tutorials", label: "Turn AI Designs to Pro-level", group: "VIDEOS", hash: "turn-ai-designs-pro-level", isVideo: true },
  { id: "video-tutorials", label: "Master Customizations", group: "VIDEOS", hash: "master-customizations", isVideo: true },
  { id: "video-tutorials", label: "Image to HTML with AI", group: "VIDEOS", hash: "image-to-html-ai", isVideo: true },
  { id: "video-tutorials", label: "Improve your AI Designs", group: "VIDEOS", hash: "improve-ai-designs", isVideo: true },
  { id: "video-tutorials", label: "How to Prompt for UI", group: "VIDEOS", hash: "how-to-prompt-ui", isVideo: true },

  // === RESOURCES ===
  { id: "video-tutorials", label: "Video Tutorials", group: "RESOURCES" },
  { id: "documentation", label: "Documentation", group: "RESOURCES" },
  { id: "faq", label: "FAQ", group: "RESOURCES" },
];

// Pages that have markdown content (not video hash-links)
const CONTENT_PAGES = new Set(LEARN_PAGES.filter(p => !p.isVideo).map(p => p.id));

interface LearnViewProps {
  params?: Promise<{ slug: string }>;
}

export default function LearnView({ params }: LearnViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [slugFromParams, setSlugFromParams] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>("introduction");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resolve slug from params promise
  useEffect(() => {
    let mounted = true;
    if (params) {
      params.then(p => {
        if (mounted && p.slug && CONTENT_PAGES.has(p.slug)) {
          setSlugFromParams(p.slug);
        }
      });
    }
    return () => { mounted = false; };
  }, [params]);

  // Sync activePage from URL/slug
  useEffect(() => {
    const sp = searchParams.get("page");
    const candidate = slugFromParams || sp || "introduction";
    if (CONTENT_PAGES.has(candidate)) {
      setActivePage(candidate);
    } else if (candidate !== "introduction") {
      router.replace("/learn/introduction");
    }
  }, [slugFromParams, searchParams, router]);

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  // Load content
  useEffect(() => {
    setLoading(true);
    fetch(`/api/learn?page=${activePage}`)
      .then(r => r.json())
      .then(d => { setContent(d.content || "Content not available yet."); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activePage]);

  // Navigate — for video entries, go to /learn/video-tutorials#<hash>
  const goToPage = useCallback((page: LearnPage) => {
    if (page.isVideo) {
      // Video entries link to /learn/video-tutorials#<hash>
      router.push(`/learn/video-tutorials#${page.hash}`, { scroll: false });
      // Also set active page to video-tutorials for sidebar highlight
      setActivePage("video-tutorials");
    } else {
      setActivePage(page.id);
      router.push(`/learn/${page.id}`, { scroll: false });
    }
    setSidebarOpen(false);
  }, [router]);

  const tabs = [
    { id: "templates", label: "Templates", href: "/?tab=templates" },
    { id: "components", label: "Components", href: "/?tab=components" },
    { id: "assets", label: "Assets", href: "/?tab=assets" },
    { id: "skills", label: "Skills", href: "/?tab=skills" },
    { id: "design-md", label: "DESIGN.MD", href: "/design-systems" },
    { id: "learn", label: "Learn", active: true },
  ];

  // Group pages by group name (preserve order)
  const groupedPages = LEARN_PAGES.reduce((acc, page) => {
    if (!acc[page.group]) acc[page.group] = [];
    acc[page.group].push(page);
    return acc;
  }, {} as Record<string, LearnPage[]>);

  const currentPage = LEARN_PAGES.find(p => p.id === activePage && !p.isVideo);

  // Check if a video entry should be highlighted (matches hash in URL)
  const currentHash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            {tabs.map(t => (
              t.href ? (
                <a key={t.id} href={t.href} className={`header-tab`}>{t.label}</a>
              ) : (
                <a key={t.id} href="/learn/introduction" className={`header-tab ${t.active ? "active" : ""}`}>{t.label}</a>
              )
            ))}
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="main" style={{ background: "hsl(var(--background))" }}>
        <div className="learn-layout">
          {/* === Sidebar — mirrors aura.build exactly === */}
          <aside className="learn-sidebar">
            <div className="learn-sidebar-header">
              <h2>LEARN</h2>
            </div>
            <nav>
              {Object.entries(groupedPages).map(([groupName, pages]) => (
                <div key={groupName} className="learn-sidebar-group">
                  <div className="learn-sidebar-group-title">{groupName}</div>
                  {pages.map(page => {
                    const isActive = page.isVideo
                      ? (activePage === "video-tutorials" && currentHash === page.hash)
                      : (activePage === page.id);
                    return (
                      <a
                        key={`${page.id}-${page.hash || page.label}`}
                        href={page.isVideo ? `/learn/video-tutorials#${page.hash}` : `/learn/${page.id}`}
                        onClick={(e) => { e.preventDefault(); goToPage(page); }}
                        className={`learn-sidebar-link ${isActive ? "active" : ""}`}
                      >
                        {page.label}
                      </a>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          {/* === Content area === */}
          <div className="learn-content">
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
              <>
                {/* Breadcrumb */}
                <div className="learn-breadcrumb">
                  Learn / {currentPage?.label || "Introduction"}
                </div>
                {/* Title */}
                <h1 className="learn-h1">{currentPage?.label || "Introduction"}</h1>
                <div className="learn-underline" />
                {/* Markdown content */}
                <div className="markdown learn-markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
                {/* Prev/Next navigation */}
                <div className="learn-nav-footer">
                  {(() => {
                    const contentPages = LEARN_PAGES.filter(p => !p.isVideo);
                    const idx = contentPages.findIndex(p => p.id === activePage);
                    const prev = idx > 0 ? contentPages[idx - 1] : null;
                    const next = idx < contentPages.length - 1 ? contentPages[idx + 1] : null;
                    return (
                      <>
                        {prev ? (
                          <a
                            href={`/learn/${prev.id}`}
                            onClick={(e) => { e.preventDefault(); goToPage(prev); }}
                            className="learn-nav-link learn-nav-prev"
                          >
                            <span className="learn-nav-label">← Previous</span>
                            <span className="learn-nav-title">{prev.label}</span>
                          </a>
                        ) : <div />}
                        {next ? (
                          <a
                            href={`/learn/${next.id}`}
                            onClick={(e) => { e.preventDefault(); goToPage(next); }}
                            className="learn-nav-link learn-nav-next"
                          >
                            <span className="learn-nav-label">Next →</span>
                            <span className="learn-nav-title">{next.label}</span>
                          </a>
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
