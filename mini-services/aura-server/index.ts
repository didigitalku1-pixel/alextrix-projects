/**
 * Aura Library Server v2
 * - Multiple content types: templates, components, assets, skills
 * - Top nav with tabs (matching aura.build design)
 * - Detail pages (not modal) with hero, preview/code tabs
 * - LEARN pages (Indonesian translation)
 * - Progress dashboard (real-time artifact generation stats)
 * - Default LIGHT theme
 */

import { readFileSync, readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const PORT = 3000;
const LIBRARY_DIR = "/home/z/my-project/download/aura_library";
const MANIFEST_PATH = join(LIBRARY_DIR, "manifest.json");
const STATS_PATH = join(LIBRARY_DIR, "_meta", "stats.json");
const PROGRESS_FILE = join(LIBRARY_DIR, "_meta", "artifact_progress.json");
const SESSION_FILE = join(LIBRARY_DIR, "_meta", "session.json");
const LOG_FILE = join(LIBRARY_DIR, "_meta", "artifact_generator.log");

// === Cache ===
let manifestCache: any = null;
let statsCache: any = null;
let lastProgressRead = 0;
let progressCache: any = null;
let logCache: string = "";
let lastLogRead = 0;

async function loadManifest() {
  if (manifestCache) return manifestCache;
  const raw = await readFile(MANIFEST_PATH, "utf-8");
  manifestCache = JSON.parse(raw);
  return manifestCache;
}

async function loadStats() {
  if (statsCache) return statsCache;
  const raw = await readFile(STATS_PATH, "utf-8");
  statsCache = JSON.parse(raw);
  return statsCache;
}

async function loadProgress() {
  // Cache for 5 seconds
  const now = Date.now();
  if (progressCache && now - lastProgressRead < 5000) return progressCache;
  try {
    if (existsSync(PROGRESS_FILE)) {
      const raw = await readFile(PROGRESS_FILE, "utf-8");
      progressCache = raw.trim() ? JSON.parse(raw) : null;
    } else {
      progressCache = null;
    }
    lastProgressRead = now;
  } catch {
    progressCache = null;
  }
  return progressCache;
}

async function loadLog(): Promise<string> {
  const now = Date.now();
  if (logCache && now - lastLogRead < 5000) return logCache;
  try {
    if (existsSync(LOG_FILE)) {
      const raw = await readFile(LOG_FILE, "utf-8");
      // Get last 500 lines
      const lines = raw.split("\n");
      logCache = lines.slice(-500).join("\n");
    } else {
      logCache = "";
    }
    lastLogRead = now;
  } catch {
    logCache = "";
  }
  return logCache;
}

// === Query ===
async function queryItems(params: any) {
  const m = await loadManifest();
  let items = m.items;
  if (params.type && params.type !== "all") {
    items = items.filter((i: any) => i.type === params.type);
  }
  if (params.tag) {
    items = items.filter((i: any) =>
      (i.tags || []).some((t: string) => t.toLowerCase() === params.tag!.toLowerCase()),
    );
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    items = items.filter(
      (i: any) =>
        i.title.toLowerCase().includes(q) ||
        (i.desc || "").toLowerCase().includes(q) ||
        (i.tags || []).some((t: string) => t.toLowerCase().includes(q)),
    );
  }
  if (params.premium === "true") items = items.filter((i: any) => i.premium);
  if (params.featured === "true") items = items.filter((i: any) => i.featured);

  switch (params.sort) {
    case "forks":
      items = [...items].sort((a: any, b: any) => b.forks - a.forks);
      break;
    case "recent":
      items = [...items].sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      );
      break;
    case "az":
      items = [...items].sort((a: any, b: any) => a.title.localeCompare(b.title));
      break;
    default:
      items = [...items].sort((a: any, b: any) => b.views - a.views);
  }

  const total = items.length;
  const limit = Math.min(Math.max(parseInt(params.limit || "24", 10), 1), 100);
  const page = Math.max(parseInt(params.page || "1", 10), 1);
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return { items: paged, total, page, totalPages, limit };
}

async function getItem(type: string, id: string) {
  let subdir: string;
  if (type === "component") subdir = "components";
  else if (type === "template") subdir = "templates";
  else if (type === "asset") subdir = "assets";
  else if (type === "skill") subdir = "skills";
  else return null;

  const dir = join(LIBRARY_DIR, subdir);
  const files = await readdir(dir);
  let jsonFile: string | undefined;
  
  if (type === "skill") {
    // Skills use UUID-based filenames: {name}_{uuid_prefix}.json
    jsonFile = files.find(f => f.endsWith(".json") && f.includes(id));
  } else if (type === "asset") {
    // Assets use 8-digit ID prefix
    const prefix = `${String(id).padStart(8, "0")}_`;
    jsonFile = files.find((f) => f.startsWith(prefix) && f.endsWith(".json"));
  } else {
    // Components/Templates use 6-digit ID prefix
    const prefix = `${String(id).padStart(6, "0")}_`;
    jsonFile = files.find((f) => f.startsWith(prefix) && f.endsWith(".json"));
  }
  
  if (!jsonFile) return null;
  const raw = await readFile(join(dir, jsonFile), "utf-8");
  const data = JSON.parse(raw);
  return {
    ...data,
    type,
    file: jsonFile.replace(/\.json$/, ""),
    desc: data.description || "",
    has_code: !!data.code,
    code_chars: (data.code || "").length,
  };
}

async function getItemByFile(type: string, file: string) {
  let subdir: string;
  if (type === "component") subdir = "components";
  else if (type === "template") subdir = "templates";
  else if (type === "asset") subdir = "assets";
  else if (type === "skill") subdir = "skills";
  else return null;

  const fullPath = join(LIBRARY_DIR, subdir, `${file}.json`);
  try {
    const raw = await readFile(fullPath, "utf-8");
    const data = JSON.parse(raw);
    return {
      ...data,
      type,
      file,
      desc: data.description || "",
      has_code: !!data.code,
      code_chars: (data.code || "").length,
    };
  } catch {
    return null;
  }
}

async function getArtifact(type: string, file: string, artifact: string): Promise<string | null> {
  let subdir: string;
  if (type === "component") subdir = "components";
  else if (type === "template") subdir = "templates";
  else return null;

  const ext = artifact === "design_md" ? "design.md" : "prompt.md";
  const fullPath = join(LIBRARY_DIR, subdir, `${file}.${ext}`);
  try {
    return await readFile(fullPath, "utf-8");
  } catch {
    return null;
  }
}

async function getLearnPage(page: string): Promise<{ id: string; content: string; available: boolean }> {
  const idPath = join(LIBRARY_DIR, "learn", "id", `${page}.md`);
  const enPath = join(LIBRARY_DIR, "learn", "extracted", `${page}.md`);
  try {
    if (existsSync(idPath)) {
      const content = await readFile(idPath, "utf-8");
      if (content.length > 100) {
        return { id: page, content, available: true };
      }
    }
    if (existsSync(enPath)) {
      const content = await readFile(enPath, "utf-8");
      if (content.length > 100) {
        return { id: page, content: `> Catatan: Konten ini belum diterjemahkan ke Bahasa Indonesia.\n\n${content}`, available: true };
      }
    }
  } catch {}
  return { id: page, content: "Konten belum tersedia.", available: false };
}

// === HTML escape ===
function esc(s: any): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(s: any): string {
  return esc(s);
}

// === Pages ===
function renderShell(title: string, body: string, activeTab: string = "", initialData?: any): string {
  const dataAttr = initialData ? ` data-initial='${escAttr(JSON.stringify(initialData))}'` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="app" data-active-tab="${esc(activeTab)}"${dataAttr}>${body}</div>
  <script src="/app.js" defer></script>
</body>
</html>`;
}

function renderTopNav(activeTab: string, stats: any): string {
  const tabs = [
    { id: "templates", label: "Templates", count: stats?.templates?.toLocaleString() },
    { id: "components", label: "Components", count: stats?.components?.toLocaleString() },
    { id: "assets", label: "Assets", count: stats?.assets?.toLocaleString() },
    { id: "skills", label: "Skills", count: stats?.skills?.toLocaleString() },
    { id: "design-md", label: "DESIGN.MD", count: undefined },
    { id: "learn", label: "Learn", count: undefined },
    { id: "progress", label: "Progress", count: undefined },
  ];
  return `<header class="header">
    <div class="header-inner">
      <div class="header-left">
        <a href="/" class="header-logo">
          <div class="header-logo-icon">A</div>
        </a>
      </div>
      <nav class="header-nav">
        ${tabs.map(t => `
          <a href="/page/${t.id === "design-md" ? "templates" : t.id}" class="header-tab ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}">
            ${t.label}${t.count ? `<span style="opacity:0.6;margin-left:4px;font-size:10px">${t.count}</span>` : ""}
          </a>
        `).join("")}
      </nav>
      <div class="header-right">
        <div class="header-search">
          <span class="header-search-icon">🔍</span>
          <input type="text" id="search-input" placeholder="Search..." class="header-search-input">
          <button class="header-search-clear" id="search-clear" style="display:none">✕</button>
        </div>
        <button class="header-icon-btn" id="theme-toggle" aria-label="Toggle theme">🌙</button>
      </div>
    </div>
  </header>`;
}

const PAGE_INFO: Record<string, { eyebrow: string; title: string; desc: string }> = {
  templates: {
    eyebrow: "Landing Page Templates",
    title: "HTML, CSS, and React landing page templates",
    desc: "Browse reusable Aura landing page templates for SaaS, portfolio, ecommerce, and AI websites. Remix designs visually, edit templates in Aura, and export HTML, CSS, or React.",
  },
  components: {
    eyebrow: "UI Components",
    title: "Reusable HTML, CSS, and React components",
    desc: "Browse reusable Aura UI components — hero sections, navigation, cards, forms, and more. Copy HTML or React code directly, or remix in Aura to customize.",
  },
  assets: {
    eyebrow: "Stock Assets",
    title: "High-quality stock images and visual assets",
    desc: "Browse thousands of curated stock photos, illustrations, and visual assets for your designs. Filter by color, resolution, and category.",
  },
  skills: {
    eyebrow: "AI Skills",
    title: "AI agent skills and prompt templates",
    desc: "Browse AI agent skills — pre-configured prompt templates for design, coding, content creation, and more. Copy and use with any AI model.",
  },
  "design-md": {
    eyebrow: "Design Systems",
    title: "Design system specifications and documentation",
    desc: "Browse design systems with complete DESIGN.md specifications, color tokens, typography, and component documentation.",
  },
};

function renderBrowsePage(type: string, stats: any): string {
  const info = PAGE_INFO[type] || PAGE_INFO.templates;
  const pulseItems = type === "templates" ? [
    { label: "Free", count: stats?.templates ? Math.floor(stats.templates * 0.95) : 0, color: "#10b981", key: "free" },
    { label: "Pro", count: 496, color: "#f59e0b", key: "pro" },
    { label: "Paid", count: 58, color: "#a855f7", key: "paid" },
  ] : type === "components" ? [
    { label: "Free", count: stats?.components || 0, color: "#10b981", key: "free" },
    { label: "Pro", count: 0, color: "#f59e0b", key: "pro" },
  ] : [
    { label: "All", count: (stats as any)?.[type] || 0, color: "#3b82f6", key: "all" },
  ];

  return renderShell(`${info.title} — Aura Library`, `
    ${renderTopNav(type, stats)}
    <main class="main">
      <div class="main-content">
        <div class="hero">
          <div class="hero-text">
            <p class="hero-eyebrow">${esc(info.eyebrow)}</p>
            <h1 class="hero-title">${esc(info.title)}</h1>
            <p class="hero-desc">${esc(info.desc)}</p>
          </div>
          <div class="pulse-box">
            <p class="pulse-title">${type === "templates" ? "Template Pulse" : type === "components" ? "Component Pulse" : type === "assets" ? "Asset Pulse" : "Skill Pulse"}</p>
            <div id="pulse-items">
              ${pulseItems.map(p => `
                <div class="pulse-item" data-pulse="${p.key}">
                  <span class="pulse-item-label">
                    <span class="pulse-item-dot" style="background:${p.color}"></span>
                    ${p.label}
                  </span>
                  <span class="pulse-item-count">${p.count.toLocaleString()}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
        <div class="filter-chips" id="filter-chips"></div>
        <div class="result-info" id="result-info" style="margin-bottom:16px;font-size:13px;color:hsl(var(--muted-foreground))">Loading...</div>
        <div class="grid" id="grid"></div>
        <div class="pagination" id="pagination" style="display:none"></div>
      </div>
    </main>
  `, type);
}

function renderDetailPage(item: any, stats: any): string {
  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1) + "s";
  // Don't embed full item data (code can be 17K+ chars, causes memory issues)
  // Client will fetch via API
  const lightItem = {
    type: item.type,
    id: item.id,
    file: item.file,
    title: item.title,
    desc: item.desc,
    tags: item.tags,
    image: item.image,
    views: item.views,
    forks: item.forks,
    code_chars: item.code_chars,
    has_code: item.has_code,
    premium: item.premium,
    featured: item.featured,
    username: item.username,
    created_at: item.created_at,
  };
  return renderShell(`${item.title} — Aura Library`, `
    ${renderTopNav(item.type === "asset" ? "assets" : item.type === "skill" ? "skills" : item.type + "s", stats)}
    <main class="main">
      <div class="detail-page">
        <a href="#${item.type === "asset" ? "assets" : item.type === "skill" ? "skills" : item.type + "s"}" class="detail-back">← Back to ${typeLabel}</a>
        <div class="detail-header">
          <div class="detail-breadcrumb">${esc(typeLabel)} ${item.tags && item.tags.length > 0 ? `• ${esc(item.tags[0])}` : ""}</div>
          <h1 class="detail-title">${esc(item.title)}</h1>
          ${item.desc ? `<p style="color:var(--fg-muted);font-size:14px;margin-bottom:12px">${esc(item.desc)}</p>` : ""}
          <div class="detail-meta">
            ${item.username ? `<span class="detail-meta-item">by ${esc(item.username.slice(0, 20))}</span>` : ""}
            <span class="detail-meta-item">👁 ${item.views?.toLocaleString() || 0}</span>
            ${item.forks > 0 ? `<span class="detail-meta-item">⑂ ${item.forks.toLocaleString()}</span>` : ""}
            <span class="detail-meta-item">📝 ${(item.code_chars || 0).toLocaleString()} chars</span>
            ${item.created_at ? `<span class="detail-meta-item">${new Date(item.created_at).toLocaleDateString()}</span>` : ""}
            ${item.premium ? `<span class="badge badge-pro">Pro</span>` : ""}
            ${item.featured ? `<span class="badge badge-featured">Featured</span>` : ""}
          </div>
        </div>
        <div class="detail-tabs">
          <button class="detail-tab active" data-tab="preview">👁 Preview</button>
          ${item.type === "template" ? `<button class="detail-tab" data-tab="design">📄 DESIGN.md</button>` : ""}
          ${item.type === "template" ? `<button class="detail-tab" data-tab="prompt">✨ Copy Prompt</button>` : ""}
          ${item.has_code ? `<button class="detail-tab" data-tab="code">&lt;/&gt; Code</button>` : ""}
          ${item.type === "skill" ? `<button class="detail-tab" data-tab="content">📄 Content</button>` : ""}
        </div>
        <div class="detail-tab-panel" id="tab-content">
          <div class="loading-spinner"><div class="spinner"></div></div>
        </div>
        ${item.tags && item.tags.length > 0 ? `
          <div style="margin-top:32px">
            <h3 style="font-size:14px;font-weight:600;margin-bottom:12px">Tags</h3>
            <div class="card-tags">
              ${item.tags.map((t: string) => `<span class="badge badge-outline">${esc(t)}</span>`).join("")}
            </div>
          </div>
        ` : ""}
      </div>
    </main>
  `, item.type, lightItem);
}

function renderLearnPage(stats: any, activePage: string = ""): string {
  const learnPages = [
    { id: "introduction", label: "Introduction" },
    { id: "tips-for-prompting", label: "Tips for Prompting" },
    { id: "how-to-prompt", label: "How to Prompt" },
    { id: "how-to-design", label: "How to Edit" },
    { id: "seo-settings", label: "SEO Settings" },
    { id: "faq", label: "FAQ" },
    { id: "custom-domain", label: "Custom Domain" },
    { id: "video-tutorials", label: "Video Tutorials" },
    { id: "documentation", label: "Documentation" },
  ];
  return renderShell("Learn — Aura Library", `
    ${renderTopNav("learn", stats)}
    <div style="display:flex;max-width:1280px;margin:0 auto;padding:24px">
      <aside class="learn-sidebar">
        <h3 style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--fg-muted);margin-bottom:8px;padding:0 12px">Learn</h3>
        ${learnPages.map(p => `<a href="#learn/${p.id}" data-learn-page="${p.id}" class="${p.id === activePage ? "active" : ""}">${p.label}</a>`).join("")}
      </aside>
      <main style="flex:1;min-width:0;padding-left:32px">
        <div id="learn-content">
          <div class="loading-spinner"><div class="spinner"></div></div>
        </div>
      </main>
    </div>
  `, "learn");
}

function renderProgressPage(stats: any, progress: any, log: string): string {
  const done = progress?.done ? Object.keys(progress.done).length : 0;
  const cached = progress?.stats?.cached || 0;
  const fresh = progress?.stats?.fresh || 0;
  const errors = progress?.stats?.errors || 0;
  const totalTemplates = stats?.templates || 21435;
  const pct = totalTemplates > 0 ? (done / totalTemplates * 100) : 0;
  
  // Parse last 50 log lines
  const logLines = log.split("\n").filter(l => l.trim()).slice(-50);
  const logHtml = logLines.map(l => {
    const cls = l.includes("ERROR") ? "error" : l.includes("✓") ? "success" : "";
    return `<div class="progress-log-line ${cls}">${esc(l)}</div>`;
  }).join("");

  return renderShell("Progress — Aura Library", `
    ${renderTopNav("progress", stats)}
    <main class="main">
      <div class="progress-page">
        <div class="progress-hero">
          <h1>Generation Progress</h1>
          <p>Real-time tracking of DESIGN.md and Copy Prompt generation for ${totalTemplates.toLocaleString()} templates via Aura's Edge Function.</p>
        </div>
        
        <div class="progress-stats">
          <div class="progress-stat-card">
            <div class="progress-stat-label">Templates Done</div>
            <div class="progress-stat-value">${done.toLocaleString()}</div>
            <div class="progress-stat-sub">of ${totalTemplates.toLocaleString()} (${pct.toFixed(1)}%)</div>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-label">Cached</div>
            <div class="progress-stat-value" style="color:var(--emerald)">${cached.toLocaleString()}</div>
            <div class="progress-stat-sub">Reused from cache</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-label">Fresh Generated</div>
            <div class="progress-stat-value" style="color:var(--blue)">${fresh.toLocaleString()}</div>
            <div class="progress-stat-sub">New from Edge Function</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-label">Errors (403 Premium)</div>
            <div class="progress-stat-value" style="color:var(--red)">${errors.toLocaleString()}</div>
            <div class="progress-stat-sub">Skipped (premium content)</div>
          </div>
        </div>

        <div class="progress-section">
          <h3>Artifact Files on Disk</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
            <div>
              <div style="font-size:24px;font-weight:700" id="design-md-count">...</div>
              <div style="font-size:12px;color:var(--fg-muted)">DESIGN.md files</div>
            </div>
            <div>
              <div style="font-size:24px;font-weight:700" id="prompt-md-count">...</div>
              <div style="font-size:12px;color:var(--fg-muted)">Prompt files</div>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <h3>Recent Activity (live log, last 50 lines)</h3>
          <div class="progress-log">${logHtml || "<div style='color:var(--fg-muted)'>No log entries yet</div>"}</div>
        </div>

        <div class="progress-section">
          <h3>About this dashboard</h3>
          <p style="font-size:13px;color:var(--fg-muted);line-height:1.6">
            This page shows real-time progress of the artifact generation job running in background.
            The script calls Aura's <code style="background:var(--bg-muted);padding:2px 6px;border-radius:3px;font-size:11px">generate-template-artifact</code>
            Edge Function for each of the ${totalTemplates.toLocaleString()} templates, generating DESIGN.md specs and AI recreation prompts.
            Components are not supported by Aura's Edge Function (only <code style="background:var(--bg-muted);padding:2px 6px;border-radius:3px;font-size:11px">shared_code</code> sourceType works).
            Premium templates return 403 Forbidden and are skipped.
          </p>
          <p style="font-size:13px;color:var(--fg-muted);margin-top:8px">
            <strong>Note:</strong> This page auto-refreshes every 10 seconds.
          </p>
        </div>
      </div>
    </main>
  `, "progress");
}

// === Static assets dir ===
const STATIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "static");

// === Server ===
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams.entries());

    try {
      // API routes
      if (path === "/api/items") {
        const result = await queryItems(params);
        return new Response(JSON.stringify(result), {
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/stats") {
        const stats = await loadStats();
        return new Response(JSON.stringify(stats), {
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/tags") {
        const stats = await loadStats();
        const tags = (stats.top_tags || []).map(([tag, count]: [string, number]) => ({ tag, count }));
        return new Response(JSON.stringify({ tags }), {
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/progress") {
        const [progress, log, stats] = await Promise.all([loadProgress(), loadLog(), loadStats()]);
        // Count files on disk
        const templatesDir = join(LIBRARY_DIR, "templates");
        const allFiles = await readdir(templatesDir);
        const designMdCount = allFiles.filter(f => f.endsWith(".design.md")).length;
        const promptMdCount = allFiles.filter(f => f.endsWith(".prompt.md")).length;
        return new Response(JSON.stringify({
          progress,
          log: log.split("\n").filter(l => l.trim()).slice(-30),
          stats,
          design_md_count: designMdCount,
          prompt_md_count: promptMdCount,
        }), { headers: { "content-type": "application/json" } });
      }
      if (path === "/api/learn" && params.page) {
        const learn = await getLearnPage(params.page);
        return new Response(JSON.stringify(learn), {
          headers: { "content-type": "application/json" },
        });
      }

      const itemMatch = path.match(/^\/api\/item\/(component|template|asset|skill)\/([^/]+)$/);
      if (itemMatch) {
        const [, type, id] = itemMatch;
        const item = await getItem(type, decodeURIComponent(id));
        if (!item) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "content-type": "application/json" } });
        return new Response(JSON.stringify(item), { headers: { "content-type": "application/json" } });
      }

      if (path === "/api/item-file") {
        const type = params.type;
        const file = params.file;
        const artifact = params.artifact;
        if (!type || !file || !artifact) return new Response(JSON.stringify({ error: "Missing params" }), { status: 400 });
        if (artifact === "code") {
          const item = await getItemByFile(type, file);
          if (!item) return new Response("Not found", { status: 404 });
          return new Response(item.code || item.content || "", { headers: { "content-type": "text/html; charset=utf-8" } });
        }
        if (artifact === "content" && type === "skill") {
          const item = await getItemByFile(type, file);
          if (!item) return new Response("Not found", { status: 404 });
          return new Response(item.content || "", { headers: { "content-type": "text/plain; charset=utf-8" } });
        }
        const content = await getArtifact(type, file, artifact);
        if (content === null) return new Response(JSON.stringify({ error: "Not generated yet", available: false }), { status: 404, headers: { "content-type": "application/json" } });
        return new Response(content, { headers: { "content-type": "text/plain; charset=utf-8" } });
      }

      // HTML pages
      if (path === "/" || path === "/index.html") {
        const stats = await loadStats();
        return new Response(renderBrowsePage("templates", stats), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      // Hash-based routing — for SPA-like behavior
      if (path === "/page/templates") {
        const stats = await loadStats();
        return new Response(renderBrowsePage("templates", stats), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (path === "/page/components") {
        const stats = await loadStats();
        return new Response(renderBrowsePage("components", stats), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (path === "/page/assets") {
        const stats = await loadStats();
        return new Response(renderBrowsePage("assets", stats), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (path === "/page/skills") {
        const stats = await loadStats();
        return new Response(renderBrowsePage("skills", stats), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (path === "/page/learn") {
        const stats = await loadStats();
        return new Response(renderLearnPage(stats), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (path === "/page/progress") {
        const [stats, progress, log] = await Promise.all([loadStats(), loadProgress(), loadLog()]);
        return new Response(renderProgressPage(stats, progress, log), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      const detailMatch = path.match(/^\/page\/detail\/(component|template|asset|skill)\/([^/]+)$/);
      if (detailMatch) {
        const [, type, id] = detailMatch;
        const item = await getItem(type, decodeURIComponent(id));
        if (!item) return new Response("Not found", { status: 404 });
        const stats = await loadStats();
        return new Response(renderDetailPage(item, stats), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      // Static files
      if (path === "/style.css") {
        const css = await readFile(join(STATIC_DIR, "style.css"), "utf-8");
        return new Response(css, { headers: { "content-type": "text/css; charset=utf-8" } });
      }
      if (path === "/app.js") {
        const js = await readFile(join(STATIC_DIR, "app.js"), "utf-8");
        return new Response(js, { headers: { "content-type": "application/javascript; charset=utf-8" } });
      }

      return new Response("Not found", { status: 404 });
    } catch (e: any) {
      console.error("Error:", e);
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  },
});

console.log(`🎨 Aura Library v2 running on http://localhost:${PORT}`);
console.log(`📚 Library: ${LIBRARY_DIR}`);
