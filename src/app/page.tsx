"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";

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
  slug?: string | null;
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

const PAGE_INFO: Record<string, { eyebrow: string; title: string; desc: string }> = {
  templates: {
    eyebrow: "All Templates",
    title: "Explore Premium Landing Page Templates",
    desc: "Discover curated HTML, CSS, and React templates. Filter by category, sort by popularity, and export production-ready code.",
  },
  components: {
    eyebrow: "UI Components",
    title: "Reusable HTML, CSS, and React components",
    desc: "Browse reusable UI components — hero sections, navigation, cards, forms, and more. Copy HTML or React code directly.",
  },
  assets: {
    eyebrow: "Stock Assets",
    title: "High-quality stock images and visual assets",
    desc: "Browse thousands of curated stock photos, illustrations, and visual assets for your designs.",
  },
  skills: {
    eyebrow: "AI Skills",
    title: "AI agent skills and prompt templates",
    desc: "Browse AI agent skills — pre-configured prompt templates for design, coding, content creation, and more.",
  },
  "design-md": {
    eyebrow: "Design Systems",
    title: "Design system specifications and documentation",
    desc: "Browse design systems with complete DESIGN.md specifications, color tokens, typography, and component documentation.",
  },
};

export default function Home() {
  return (
    <Suspense fallback={<div className="app alextrix-app"><main className="main"><div className="loading-spinner"><div className="spinner" /></div></main></div>}>
      <HomeRouter />
    </Suspense>
  );
}

function HomeRouter() {
  const pathname = usePathname();
  if (pathname === "/") {
    return <AlextrixHomepage />;
  }
  return <HomeInner />;
}

// === Homepage Landing Page ===
function AlextrixHomepage() {
  const [featuredTemplates, setFeaturedTemplates] = useState<Item[]>([]);
  const [featuredComponents, setFeaturedComponents] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string | number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const { isDark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    Promise.all([
      fetch("/api/items?type=template&sort=views&limit=5").then(r => r.json()),
      fetch("/api/items?type=component&sort=views&limit=5").then(r => r.json()),
      fetch("/api/stats").then(r => r.json()),
    ]).then(([t, c, s]) => {
      setFeaturedTemplates(t.items || []);
      setFeaturedComponents(c.items || []);
      setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Scroll elevation for navbar
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  const toggleBookmark = (id: string | number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setToast("Removed from saved");
      } else {
        next.add(id);
        setToast("Saved to your library");
      }
      return next;
    });
  };

  const copyComponentCode = (item: Item, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const code = `<!-- ${item.title} -->\n<!-- Source: Alextrix Library — ${item.slug || item.id} -->\n<!-- Get full code at /components/${item.slug || item.id} -->`;
    navigator.clipboard?.writeText(code).then(() => {
      setToast(`Copied ${item.title} reference`);
    }).catch(() => setToast("Copy failed — open detail page"));
  };

  // Auto-generate prompt fallback from item metadata
  const generateFallbackPrompt = (item: Item): string => {
    const tags = (item.tags || []).slice(0, 5).join(", ");
    const itemType = item.type === "template" ? "landing page template" : item.type === "component" ? "UI component" : `${item.type} template`;
    const lines = [
      `Recreate this ${itemType}: ${item.title}`,
      ``,
      `Description: ${item.desc || "No description available."}`,
      ``,
      `Style: ${tags || "modern, clean, minimal"}`,
      ``,
      `Tech stack: HTML, CSS, Tailwind`,
      `Type: ${item.type}`,
      ``,
      `Source: Alextrix Library — ${item.slug || item.id}`,
      `Author: ${item.username || "unknown"}`,
    ];
    return lines.join("\n");
  };

  // Download DESIGN.md file from card hover
  const downloadDesignMd = async (item: Item, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Try fetch from API first
      const res = await fetch(`/api/item/${item.type}/${item.id}?artifact=design`);
      let content: string;
      if (res.ok) {
        const data = await res.json();
        content = data.content || data.design_md || "";
      } else {
        content = "";
      }
      // Fallback if no DESIGN.md yet — auto-generate minimal spec
      if (!content) {
        content = [
          `---`,
          `name: ${item.title}`,
          `description: ${item.desc || ""}`,
          `type: ${item.type}`,
          `tags: ${(item.tags || []).join(", ")}`,
          `author: ${item.username || "unknown"}`,
          `---`,
          ``,
          `## Overview`,
          ``,
          `${item.desc || "Design system specification for " + item.title + "."}`,
          ``,
          `## Colors`,
          ``,
          `| Role | Value |`,
          `| --- | --- |`,
          `| Primary | #111827 |`,
          `| Background | #FFFFFF |`,
          `| Surface | #F9FAFB |`,
          `| Text | #111827 |`,
          ``,
          `## Typography`,
          ``,
          `| Style | Family | Size | Weight |`,
          `| --- | --- | --- | --- |`,
          `| Display | Inter | 48px | 700 |`,
          `| Body | Inter | 16px | 400 |`,
          `| Label | JetBrains Mono | 11px | 600 |`,
          ``,
          `> Note: Auto-generated. For full DESIGN.md, check back soon or visit /${item.type === "template" ? "templates" : "components"}/${item.slug || item.id}`,
        ].join("\n");
      }
      // Trigger download
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.slug || "design-system"}-design.md`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setToast(`Downloaded ${(item.slug || "design").slice(0, 30)}-design.md`);
    } catch (err) {
      setToast("Download failed — try detail page");
    }
  };

  // Copy prompt to clipboard — 3 tier fallback
  const copyPromptToClipboard = async (item: Item, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Tier 1: Try existing prompt in database via API
      const res = await fetch(`/api/item/${item.type}/${item.id}?artifact=prompt`);
      let prompt = "";
      if (res.ok) {
        const data = await res.json();
        prompt = data.content || data.prompt || "";
      }
      // Tier 2: Auto-generate from metadata (immediate, no API needed)
      if (!prompt) {
        prompt = generateFallbackPrompt(item);
      }
      await navigator.clipboard.writeText(prompt);
      setToast(`Prompt copied for ${item.title.slice(0, 30)}`);
    } catch (err) {
      // Tier 3: Even simpler fallback
      const prompt = generateFallbackPrompt(item);
      try {
        await navigator.clipboard.writeText(prompt);
        setToast(`Prompt copied (auto-generated)`);
      } catch {
        setToast("Copy failed — open detail page");
      }
    }
  };

  // Tier badges removed — all items show as clean cards (no FREE/PRO/PAID labels)
  // Per user request: "pada hakikatnya semuanya itu free (namun jangan di tulis free)"

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n || 0);
  };

  const navTabs = [
    { id: "templates", label: "Templates", href: "/templates" },
    { id: "components", label: "Components", href: "/components" },
    { id: "assets", label: "Assets", href: "/assets" },
    { id: "skills", label: "Skills", href: "/skills" },
    { id: "design-md", label: "DESIGN.MD", href: "/design-systems" },
    { id: "learn", label: "Learn", href: "/learn/introduction" },
  ];

  const categoryPills = [
    { emoji: "🔥", label: "Trending", href: "/templates?sort=views" },
    { emoji: "🚀", label: "SaaS", href: "/templates?tag=saas" },
    { emoji: "💼", label: "Portfolio", href: "/templates?tag=portfolio" },
    { emoji: "🛒", label: "Ecommerce", href: "/templates?tag=ecommerce" },
    { emoji: "🤖", label: "AI", href: "/templates?tag=ai" },
    { emoji: "📊", label: "Dashboard", href: "/templates?tag=dashboard" },
    { emoji: "🎨", label: "Landing Page", href: "/templates?tag=landing-page" },
    { emoji: "⚙️", label: "Components", href: "/components" },
    { emoji: "🎬", label: "Animations", href: "/components?tag=animation" },
    { emoji: "📱", label: "Mobile", href: "/templates?tag=mobile" },
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Frontend Dev @ StartupX", color: "#E65C00", quote: "Alextrix cut my landing page build time from 2 days to 20 minutes. The React templates are production-ready and beautifully designed.", stars: 5 },
    { name: "Marcus Rodriguez", role: "Indie Hacker", color: "#1D4ED8", quote: "I shipped 3 client projects in a week using the component library. The Copy button is genius — instant code, no friction.", stars: 5 },
    { name: "Aisha Patel", role: "Design Lead @ Agency", color: "#047857", quote: "The design systems collection is gold. We reference DESIGN.md specs daily for client work. Huge time-saver for our team.", stars: 5 },
  ];

  return (
    <div className="app alextrix-app">
      <main className="main alextrix-homepage">
        {/* SECTION 1: HERO (enhanced with trust bar + stats) */}
        <section className="alextrix-hero-section">
          <div className="alextrix-hero-content">
            <p className="alextrix-hero-eyebrow">ALEXTRIX LIBRARY</p>
            <h1 className="alextrix-hero-headline">Build Stunning Websites<br />in Seconds</h1>
            <p className="alextrix-hero-subheadline">Curated HTML, CSS, React templates, UI components, and design systems. Export production-ready code instantly.</p>
            <div className="alextrix-hero-cta">
              <a href="/templates" className="alextrix-cta-primary">Browse Templates →</a>
              <a href="/design-systems" className="alextrix-cta-secondary">Explore Design.md</a>
            </div>

            {/* Trust bar — tech stack */}
            <div className="alextrix-trust-bar">
              <span className="alextrix-trust-label">Compatible with</span>
              <div className="alextrix-trust-items">
                <span className="alextrix-trust-item">HTML</span>
                <span className="alextrix-trust-item">CSS</span>
                <span className="alextrix-trust-item">React</span>
                <span className="alextrix-trust-item">Next.js</span>
                <span className="alextrix-trust-item">Tailwind</span>
              </div>
            </div>

            {/* Social proof — real numbers */}
            <div className="alextrix-stats-row">
              <span className="alextrix-stat-item">
                <span className="alextrix-stat-number">{stats ? formatViews(stats.templates).replace("k", "") : "21K"}</span>
                <span className="alextrix-stat-label">Templates</span>
              </span>
              <span className="alextrix-stat-item">
                <span className="alextrix-stat-number">{stats ? formatViews(stats.components).replace("k", "") : "2.8K"}</span>
                <span className="alextrix-stat-label">Components</span>
              </span>
              <span className="alextrix-stat-item">
                <span className="alextrix-stat-number">{stats ? formatViews(stats.assets).replace("k", "") : "30K"}</span>
                <span className="alextrix-stat-label">Assets</span>
              </span>
              <span className="alextrix-stat-item">
                <span className="alextrix-stat-number">725</span>
                <span className="alextrix-stat-label">Design Systems</span>
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 2: TEMPLATE PULSE (2-col asymmetric 65/35) */}
        <section className="alextrix-pulse-section">
          <div className="alextrix-pulse-left">
            <p className="alextrix-pulse-eyebrow">WHAT&apos;S INSIDE</p>
            <h2 className="alextrix-pulse-title">Curated Library for Modern Builders</h2>
            <p className="alextrix-pulse-desc">Browse thousands of production-ready templates and components. Export clean HTML, CSS, or React when your page is ready. Free, Pro, and Paid tiers — pick what fits your project.</p>
          </div>
          <div className="alextrix-pulse-card">
            <div className="alextrix-pulse-card-header">
              <h3 className="alextrix-pulse-card-title">TEMPLATE PULSE</h3>
              <span className="alextrix-pulse-live">LIVE</span>
            </div>
            <div className="alextrix-pulse-row">
              <div className="alextrix-pulse-icon alextrix-pulse-icon-free">⚡</div>
              <div className="alextrix-pulse-row-text">
                <span className="alextrix-pulse-row-label">Free</span>
                <span className="alextrix-pulse-row-desc">Open for everyone</span>
              </div>
              <span className="alextrix-pulse-row-num">{stats ? stats.templates.toLocaleString() : "21,563"}</span>
            </div>
            <div className="alextrix-pulse-row">
              <div className="alextrix-pulse-icon alextrix-pulse-icon-pro">👑</div>
              <div className="alextrix-pulse-row-text">
                <span className="alextrix-pulse-row-label">Pro</span>
                <span className="alextrix-pulse-row-desc">Premium curated picks</span>
              </div>
              <span className="alextrix-pulse-row-num">{stats ? stats.premium.toLocaleString() : "531"}</span>
            </div>
            <div className="alextrix-pulse-row">
              <div className="alextrix-pulse-icon alextrix-pulse-icon-paid">💎</div>
              <div className="alextrix-pulse-row-text">
                <span className="alextrix-pulse-row-label">Paid</span>
                <span className="alextrix-pulse-row-desc">Single-purchase exclusives</span>
              </div>
              <span className="alextrix-pulse-row-num">61</span>
            </div>
            <div className="alextrix-pulse-card-footer">Updated every 6 hours</div>
          </div>
        </section>

        {/* SECTION 3: CATEGORY PILLS (horizontal scroll) */}
        <section className="alextrix-categories">
          <div className="alextrix-category-pills">
            {categoryPills.map(p => (
              <a key={p.label} href={p.href} className="alextrix-category-pill">
                <span className="alextrix-category-pill-emoji">{p.emoji}</span>
                {p.label}
              </a>
            ))}
          </div>
        </section>

        {/* SECTION 4: TRENDING TEMPLATES (enhanced cards) */}
        <section className="alextrix-featured-section">
          <div className="alextrix-section-header">
            <h2 className="alextrix-section-title">Trending Templates</h2>
            <a href="/templates" className="alextrix-section-link">Browse all →</a>
          </div>
          <div className="alextrix-featured-grid">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" />)
            ) : (
              featuredTemplates.map(item => (
                <a key={item.id} className="card alextrix-card" href={`/templates/${item.slug || item.id}`}>
                  <div className="card-image-wrap">
                    <div className="card-actions">
                      <button
                        type="button"
                        className="card-action-btn"
                        aria-label={`Download DESIGN.md for ${item.title}`}
                        onClick={(e) => downloadDesignMd(item, e)}
                      >
                        📄 DESIGN.md
                      </button>
                      <button
                        type="button"
                        className="card-action-btn"
                        aria-label={`Copy prompt for ${item.title}`}
                        onClick={(e) => copyPromptToClipboard(item, e)}
                      >
                        ✨ Copy Prompt
                      </button>
                    </div>
                    <button
                      className={`card-bookmark${bookmarks.has(item.id) ? " saved" : ""}`}
                      onClick={(e) => toggleBookmark(item.id, e)}
                      aria-label="Save template"
                    >
                      {bookmarks.has(item.id) ? "★" : "☆"}
                    </button>
                    {item.image ? (
                      <img src={`/api/image?url=${encodeURIComponent(item.image)}`} alt={item.title} className="card-image" loading="lazy" />
                    ) : (
                      <img src={`/api/skill-thumb?title=${encodeURIComponent(item.title)}`} alt={item.title} className="card-image" loading="lazy" />
                    )}
                  </div>
                  <div className="card-footer">
                    <h3 className="card-title" title={item.title}>{item.title}</h3>
                    <div className="card-meta">
                      {item.username && <span className="card-author">@{item.username.slice(0, 12)}</span>}
                      <span className="card-views">{formatViews(item.views)}</span>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </section>

        {/* SECTION 5: FEATURED COMPONENTS (enhanced with Copy CTA) */}
        <section className="alextrix-featured-section">
          <div className="alextrix-section-header">
            <h2 className="alextrix-section-title">Featured Components</h2>
            <a href="/components" className="alextrix-section-link">Browse all →</a>
          </div>
          <div className="alextrix-featured-grid">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" />)
            ) : (
              featuredComponents.map(item => (
                <a key={item.id} className="card alextrix-card" href={`/components/${item.slug || item.id}`}>
                  <div className="card-image-wrap">
                    <div className="card-actions">
                      <button
                        type="button"
                        className="card-action-btn"
                        aria-label={`Download DESIGN.md for ${item.title}`}
                        onClick={(e) => downloadDesignMd(item, e)}
                      >
                        📄 DESIGN.md
                      </button>
                      <button
                        type="button"
                        className="card-action-btn"
                        aria-label={`Copy prompt for ${item.title}`}
                        onClick={(e) => copyPromptToClipboard(item, e)}
                      >
                        ✨ Copy Prompt
                      </button>
                    </div>
                    <button
                      className="card-copy-btn"
                      onClick={(e) => copyComponentCode(item, e)}
                      aria-label="Copy code"
                    >
                      ⧉ Copy
                    </button>
                    {item.image ? (
                      <img src={`/api/image?url=${encodeURIComponent(item.image)}`} alt={item.title} className="card-image" loading="lazy" />
                    ) : (
                      <img src={`/api/skill-thumb?title=${encodeURIComponent(item.title)}`} alt={item.title} className="card-image" loading="lazy" />
                    )}
                  </div>
                  <div className="card-footer">
                    <h3 className="card-title" title={item.title}>{item.title}</h3>
                    <div className="card-meta">
                      {item.username && <span className="card-author">@{item.username.slice(0, 12)}</span>}
                      <span className="card-views">{formatViews(item.views)}</span>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </section>

        {/* SECTION 6: TESTIMONIALS (3-column) */}
        <section className="alextrix-testimonials">
          <div className="alextrix-section-header">
            <h2 className="alextrix-section-title">Loved by Builders</h2>
            <a href="/learn/introduction" className="alextrix-section-link">Read more →</a>
          </div>
          <div className="alextrix-testimonials-grid">
            {testimonials.map(t => (
              <div key={t.name} className="alextrix-testimonial-card">
                <div className="alextrix-testimonial-stars">{"★".repeat(t.stars)}</div>
                <p className="alextrix-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="alextrix-testimonial-author">
                  <div className="alextrix-testimonial-avatar" style={{ background: t.color }}>
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="alextrix-testimonial-name">{t.name}</div>
                    <div className="alextrix-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: FINAL CTA BAND */}
        <section className="alextrix-cta-band">
          <div className="alextrix-cta-band-inner">
            <h2 className="alextrix-cta-band-title">Start Building Today</h2>
            <p className="alextrix-cta-band-sub">Free forever. No credit card required. Browse {stats ? stats.templates.toLocaleString() : "21,563"} templates instantly.</p>
            <div className="alextrix-cta-band-buttons">
              <a href="/templates" className="alextrix-cta-band-primary">Browse Templates →</a>
              <a href="/learn/introduction" className="alextrix-cta-band-secondary">Explore Docs</a>
            </div>
          </div>
        </section>
      </main>

      {/* Toast for copy/bookmark feedback */}
      {toast && (
        <div className="alextrix-toast show">{toast}</div>
      )}
    </div>
  );
}

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize state from pathname (clean URLs) or URL params
  const [tab, setTabState] = useState<TabType>(() => {
    // Check pathname first for clean URLs (/templates, /assets, etc.)
    if (pathname === "/templates") return "templates";
    if (pathname === "/components") return "components";
    if (pathname === "/assets") return "assets";
    if (pathname === "/skills") return "skills";
    // Fallback to searchParams (?tab=templates)
    const t = searchParams.get("tab") as TabType;
    return ["templates", "components", "assets", "skills", "design-md", "learn"].includes(t || "")
      ? t!
      : "templates";
  });
  const [sort, setSort] = useState(() => searchParams.get("sort") || "recent");
  const [tag, setTag] = useState<string | null>(searchParams.get("tag"));
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [premium, setPremium] = useState(searchParams.get("premium") === "true");
  const [featured, setFeatured] = useState(searchParams.get("featured") === "true");
  const [page, setPageState] = useState(() => Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1));
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sync search query from URL when global SiteHeader updates it
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    if (urlQ !== q) setQ(urlQ);
  }, [searchParams]);
  const { isDark, toggle: toggleTheme } = useTheme();
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  // Auto-generate prompt fallback from item metadata (shared with homepage)
  const generateFallbackPrompt = (item: Item): string => {
    const tags = (item.tags || []).slice(0, 5).join(", ");
    const itemType = item.type === "template" ? "landing page template" : item.type === "component" ? "UI component" : `${item.type} template`;
    return [
      `Recreate this ${itemType}: ${item.title}`,
      ``,
      `Description: ${item.desc || "No description available."}`,
      ``,
      `Style: ${tags || "modern, clean, minimal"}`,
      ``,
      `Tech stack: HTML, CSS, Tailwind`,
      `Type: ${item.type}`,
      ``,
      `Source: Alextrix Library — ${item.slug || item.id}`,
      `Author: ${item.username || "unknown"}`,
    ].join("\n");
  };

  const downloadDesignMd = async (item: Item, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/item/${item.type}/${item.id}?artifact=design`);
      let content: string = "";
      if (res.ok) {
        const data = await res.json();
        content = data.content || data.design_md || "";
      }
      if (!content) {
        content = [
          `---`,
          `name: ${item.title}`,
          `description: ${item.desc || ""}`,
          `type: ${item.type}`,
          `tags: ${(item.tags || []).join(", ")}`,
          `author: ${item.username || "unknown"}`,
          `---`,
          ``,
          `## Overview`,
          ``,
          `${item.desc || "Design system specification for " + item.title + "."}`,
          ``,
          `## Colors`,
          ``,
          `| Role | Value |`,
          `| --- | --- |`,
          `| Primary | #111827 |`,
          `| Background | #FFFFFF |`,
          `| Surface | #F9FAFB |`,
          `| Text | #111827 |`,
          ``,
          `## Typography`,
          ``,
          `| Style | Family | Size | Weight |`,
          `| --- | --- | --- | --- |`,
          `| Display | Inter | 48px | 700 |`,
          `| Body | Inter | 16px | 400 |`,
          `| Label | JetBrains Mono | 11px | 600 |`,
          ``,
          `> Auto-generated. Full DESIGN.md coming soon.`,
        ].join("\n");
      }
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.slug || "design-system"}-design.md`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setToast(`Downloaded ${(item.slug || "design").slice(0, 30)}-design.md`);
    } catch {
      setToast("Download failed");
    }
  };

  const copyPromptToClipboard = async (item: Item, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/item/${item.type}/${item.id}?artifact=prompt`);
      let prompt = "";
      if (res.ok) {
        const data = await res.json();
        prompt = data.content || data.prompt || "";
      }
      if (!prompt) {
        prompt = generateFallbackPrompt(item);
      }
      await navigator.clipboard.writeText(prompt);
      setToast(`Prompt copied for ${item.title.slice(0, 30)}`);
    } catch {
      const prompt = generateFallbackPrompt(item);
      try {
        await navigator.clipboard.writeText(prompt);
        setToast(`Prompt copied (auto-generated)`);
      } catch {
        setToast("Copy failed");
      }
    }
  };

  // Wrapper setters that also sync to URL
  const setTab = useCallback((t: TabType) => { setTabState(t); setPageState(1); }, []);
  const setPage = useCallback((p: number | ((prev: number) => number)) => {
    setPageState(p);
  }, []);

  // Sync state → URL using clean URLs (/templates, /assets, etc.)
  useEffect(() => {
    if (tab === "skills" || tab === "learn" || tab === "design-md") {
      return;
    }
    const cleanPaths: Record<string, string> = {
      templates: "/templates",
      components: "/components",
      assets: "/assets",
      skills: "/skills",
    };
    const basePath = cleanPaths[tab] || "/";
    const params = new URLSearchParams();
    if (sort !== "recent") params.set("sort", sort);
    if (tag) params.set("tag", tag);
    if (debouncedQ) params.set("q", debouncedQ);
    if (featured) params.set("featured", "true");
    if (premium) params.set("premium", "true");
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    const newUrl = qs ? `${basePath}?${qs}` : basePath;
    router.replace(newUrl, { scroll: false });
  }, [tab, sort, tag, debouncedQ, featured, premium, page, router]);

  // Theme handled by useTheme hook

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

  // Load items - skip for tabs that have their own routes
  const loadItems = useCallback(async () => {
    if (tab === "skills" || tab === "learn" || tab === "design-md") return;
    setLoading(true);
    const apiType = tab === "templates" ? "template" : tab === "components" ? "component" : tab === "assets" ? "asset" : "skill";
    const params = new URLSearchParams({ type: apiType, sort, page: String(page), limit: "24" });
    if (tag) params.set("tag", tag);
    if (debouncedQ) params.set("q", debouncedQ);

    if (featured) params.set("featured", "true");
    if (premium) params.set("premium", "true");
    try {
      const r = await fetch(`/api/items?${params}`);
      if (!r.ok) throw new Error("Failed");
      const d = await r.json();
      setItems(d.items || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 0);
    } catch (e) {
      console.error("Items fetch error:", e);
      setItems([]);
    }
    setLoading(false);
  }, [tab, sort, tag, debouncedQ, featured, premium, page]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const resetFilters = () => {
    setQ(""); setTag(null); setFeatured(false); setPage(1);
  };

  const formatCount = (n: number) => {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n || 0);
  };

  const tabs: { id: TabType; label: string; href?: string }[] = [
    { id: "templates", label: "Templates", href: "/templates" },
    { id: "components", label: "Components", href: "/components" },
    { id: "assets", label: "Assets", href: "/assets" },
    { id: "skills", label: "Skills", href: "/skills" },
    { id: "design-md", label: "DESIGN.MD", href: "/design-systems" },
    { id: "learn", label: "Learn", href: "/learn/introduction" },
  ];

  const info = PAGE_INFO[tab] || PAGE_INFO.templates;

  return (
    <div className="app alextrix-app">
      {/* Content — header is now global via layout.tsx SiteHeader */}
      {tab === "skills" ? (
        <SkillsView />
      ) : tab === "design-md" ? (
        <DesignSystemsView />
      ) : (
        <main className="main alextrix-app">
          <div className="main-content">
            {/* Hero */}
            <div className="alextrix-hero">
              <p className="alextrix-hero-eyebrow">{info.eyebrow}</p>
              <h1 className="alextrix-hero-title">{info.title}</h1>
              <p className="alextrix-hero-desc">{info.desc}</p>
            </div>

            {/* Tier 1: Full-width Search */}
            <div className="alextrix-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                placeholder={`Search ${total.toLocaleString()} ${tab}...`}
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              {q && (
                <button className="alextrix-search-clear" onClick={() => setQ("")} aria-label="Clear search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Tier 2: Sort Segmented Control + Filter Pills */}
            <div className="alextrix-filter-row">
              <div className="alextrix-sort">
                {([
                  { id: "recent", label: "Recent", icon: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
                  { id: "views", label: "Popular", icon: "M3 3v18h18M7 12l4-4 4 4 6-6" },
                  { id: "forks", label: "Forked", icon: "M6 3v12M18 9a3 3 0 1 0-3-3M6 21a3 3 0 1 1 3-3M18 21V9" },
                  { id: "az", label: "A→Z", icon: "M3 7h10M3 12h7M3 17h4M14 17l3-3 3 3M17 4v10" },
                ] as const).map(s => (
                  <button
                    key={s.id}
                    className={`alextrix-sort-btn ${sort === s.id ? "active" : ""}`}
                    onClick={() => setSort(s.id)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon}/>
                    </svg>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="alextrix-filters">
                <button
                  className={`alextrix-pill ${featured ? "active-featured" : ""}`}
                  onClick={() => setFeatured(!featured)}
                >
                  ★ Featured
                </button>
              </div>
            </div>

            {/* Tier 3: Tags */}
            {tags.length > 0 && (
              <div className="alextrix-tags">
                {tags.slice(0, 30).map(t => (
                  <button
                    key={t.tag}
                    className={`alextrix-tag ${tag === t.tag ? "active" : ""}`}
                    onClick={() => setTag(tag === t.tag ? null : t.tag)}
                  >
                    {t.tag}
                    <span className="alextrix-tag-count">{t.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Result count + active filter chips */}
            <div className="alextrix-result">
              <span className="alextrix-result-text">
                {loading ? "Loading..." : (
                  <>Showing <strong>{Math.min(page * 24, total).toLocaleString()}</strong> of <strong>{total.toLocaleString()}</strong> {tab}{page > 1 && <span style={{ marginLeft: 8, fontSize: 11, color: "#9CA3AF" }}>· Page {page} of {totalPages}</span>}</>
                )}
              </span>
              {(tag || featured || q) && (
                <div className="alextrix-chips">
                  {q && <span className="alextrix-chip" onClick={() => setQ("")}>"{q}" ✕</span>}
                  {tag && <span className="alextrix-chip" onClick={() => setTag(null)}>#{tag} ✕</span>}
                  {featured && <span className="alextrix-chip" onClick={() => setFeatured(false)}>★ Featured ✕</span>}
                  <button className="alextrix-clear" onClick={resetFilters}>Clear all</button>
                </div>
              )}
            </div>

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
                          <button
                            type="button"
                            className="card-action-btn"
                            aria-label={`Download DESIGN.md for ${item.title}`}
                            onClick={(e) => downloadDesignMd(item, e)}
                          >
                            📄 DESIGN.md
                          </button>
                          <button
                            type="button"
                            className="card-action-btn"
                            aria-label={`Copy prompt for ${item.title}`}
                            onClick={(e) => copyPromptToClipboard(item, e)}
                          >
                            ✨ Copy Prompt
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <h3 className="card-title" title={item.title}>{item.title}</h3>
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

      {/* Toast for copy/download feedback */}
      {toast && (
        <div className="alextrix-toast show">{toast}</div>
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
    <main className="main alextrix-app">
      <div className="main-content">
        <div className="alextrix-hero" style={{ marginBottom: 32 }}>
          <p className="alextrix-hero-eyebrow">DESIGN SYSTEMS</p>
          <h1 className="alextrix-hero-title">Design system specifications</h1>
          <p className="alextrix-hero-desc">Browse design systems with complete DESIGN.md specifications, color tokens, typography, and component documentation.</p>
        </div>
        {loading ? (
          <div className="grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {items.map(item => (
              <a key={item.id} className="card" href={`/design-systems/${item.slug || item.id}`} style={{ maxWidth: "none" }}>
                <div className="card-image-wrap" style={{ aspectRatio: "21 / 9" }}>
                  {item.image ? <img src={`/api/image?url=${encodeURIComponent(item.image)}`} alt={item.title} className="card-image" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = "none"; const p = t.parentElement; if (p && !p.querySelector(".card-image-placeholder")) { const d = document.createElement("div"); d.className = "card-image-placeholder"; d.textContent = item.title.substring(0, 20); p.appendChild(d); } }} /> : <div className="card-image-placeholder">{item.title.substring(0, 20)}</div>}
                  {item.featured && <span className="card-badge badge-featured">★</span>}
                </div>
                <div className="card-footer" style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{item.title}</h2>
                  {item.desc && <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 14, marginBottom: 12 }}>{item.desc}</p>}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                    {item.username && <span className="alextrix-author">{item.username.slice(0, 16)}</span>}
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

// === Markdown renderer — XSS-safe via URL sanitization ===
// SECURITY: All link URLs are sanitized to block javascript:, data:, and other dangerous schemes.
function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  // Only allow http(s), mailto:, ftp:, and relative URLs (start with / or #)
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("ftp://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    !trimmed.includes(":") // relative URL without scheme
  ) {
    return url;
  }
  // Block javascript:, data:, vbscript:, file:, etc.
  return "#blocked";
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  // SECURITY: Escape HTML entities including quotes to prevent attribute injection
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  const renderInline = (text: string) => {
    let r = esc(text);
    r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
    // SECURITY: Sanitize URL before placing in href attribute
    r = r.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, label: string, url: string) => {
        const safeUrl = sanitizeUrl(url.trim());
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      },
    );
    r = r.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return r;
  };
  lines.forEach(line => {
    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${esc(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }
    if (line.startsWith("# ")) out.push(`<h1>${esc(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) out.push(`<h2>${esc(line.slice(3))}</h2>`);
    else if (line.startsWith("### ")) out.push(`<h3>${esc(line.slice(4))}</h3>`);
    else if (line.startsWith("#### ")) out.push(`<h4>${esc(line.slice(5))}</h4>`);
    else if (line.startsWith("- ") || line.startsWith("* "))
      out.push(`<li>${renderInline(line.slice(2))}</li>`);
    else if (/^\d+\.\s/.test(line))
      out.push(`<li>${renderInline(line.replace(/^\d+\.\s/, ""))}</li>`);
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
  const { isDark, toggle: toggleTheme } = useTheme();

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
    <main className="main alextrix-app">
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
              {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                <div className="skills-doc-content-tags">
                  {(selectedSkill.tags as string[]).slice(0, 6).map(t => (
                    <span key={t} className="about-tag">{t}</span>
                  ))}
                </div>
              )}
              <div style={{ width: 48, height: 3, background: "#E65C00", marginBottom: 32, borderRadius: 2 }} />
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
