// Aura Library v2 — Client JS
// Hash-based routing: #templates, #components, #assets, #skills, #learn, #progress, #detail/{type}/{id}, #learn/{page}

const state = {
  type: "templates",
  sort: "views",
  tag: null,
  q: "",
  premium: false,
  featured: false,
  page: 1,
  limit: 24,
  dark: false,
  totalPages: 0,
  total: 0,
};

let searchDebounce = null;

// === Theme ===
function initTheme() {
  const saved = localStorage.getItem("aura-theme");
  state.dark = saved === "dark";
  applyTheme();
}
function applyTheme() {
  document.documentElement.classList.toggle("dark", state.dark);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = state.dark ? "☀️" : "🌙";
}
function toggleTheme() {
  state.dark = !state.dark;
  localStorage.setItem("aura-theme", state.dark ? "dark" : "light");
  applyTheme();
}

// === Routing ===
function getRoute() {
  const hash = window.location.hash.slice(1);
  if (!hash) return { page: "templates" };
  const parts = hash.split("/");
  if (parts[0] === "detail" && parts[1] && parts[2]) {
    return { page: "detail", type: parts[1], id: parseInt(parts[2], 10) };
  }
  if (parts[0] === "learn" && parts[1]) {
    return { page: "learn", subpage: parts[1] };
  }
  return { page: parts[0] || "templates" };
}

async function navigate() {
  const route = getRoute();
  if (route.page === "detail") {
    await loadDetailPage(route.type, route.id);
  } else if (route.page === "learn") {
    await loadLearnContent(route.subpage);
  } else if (route.page === "progress") {
    // Page already rendered server-side, just init refresh
    initProgressRefresh();
  } else {
    // Browse pages: templates, components, assets, skills
    state.type = route.page === "design-md" ? "templates" : route.page;
    await loadBrowsePage();
  }
}

// === Browse page ===
async function loadBrowsePage() {
  // Update active tab
  document.querySelectorAll(".topnav-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === state.type);
  });
  
  loadTags();
  loadItems();
  syncSidebar();
}

async function loadStats() {
  try {
    const r = await fetch("/api/stats");
    return await r.json();
  } catch { return null; }
}

async function loadTags() {
  try {
    const r = await fetch("/api/tags");
    const d = await r.json();
    const wrap = document.getElementById("tags-wrap");
    if (!wrap) return;
    wrap.innerHTML = d.tags
      .map(t => `<button class="sidebar-tag" data-tag="${escAttr(t.tag)}"><span>${esc(t.tag)}</span><span class="sidebar-tag-count">${t.count}</span></button>`)
      .join("");
    wrap.querySelectorAll(".sidebar-tag").forEach(btn => {
      btn.addEventListener("click", () => {
        const t = btn.dataset.tag;
        state.tag = state.tag === t ? null : t;
        state.page = 1;
        syncSidebar();
        loadItems();
      });
    });
    syncSidebar();
  } catch (e) { console.error(e); }
}

async function loadItems() {
  const grid = document.getElementById("grid");
  const info = document.getElementById("result-info");
  const pagination = document.getElementById("pagination");
  if (!grid || !info) return;

  grid.innerHTML = Array.from({ length: state.limit }).map(() => '<div class="skeleton"></div>').join("");
  info.textContent = "Loading...";

  // Map plural route to singular type for API
  const apiType = { templates: "template", components: "component", assets: "asset", skills: "skill" }[state.type] || state.type;

  const params = new URLSearchParams();
  params.set("type", apiType);
  params.set("sort", state.sort);
  if (state.tag) params.set("tag", state.tag);
  if (state.q) params.set("q", state.q);
  if (state.premium) params.set("premium", "true");
  if (state.featured) params.set("featured", "true");
  params.set("page", String(state.page));
  params.set("limit", String(state.limit));

  try {
    const r = await fetch(`/api/items?${params}`);
    const d = await r.json();
    state.total = d.total;
    state.totalPages = d.totalPages;

    info.innerHTML = `<strong>${d.total.toLocaleString()}</strong> items` +
      (state.page > 1 ? ` <span style="margin-left:8px;font-size:12px">· Page ${state.page} of ${d.totalPages}</span>` : "");

    if (d.items.length === 0) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
        <div class="empty-icon">📭</div>
        <p class="empty-title">No items found</p>
        <p class="empty-desc">Try adjusting your filters or search query.</p>
        <button class="btn btn-outline" style="margin-top:16px" id="reset-btn">Reset filters</button>
      </div>`;
      const resetBtn = document.getElementById("reset-btn");
      if (resetBtn) resetBtn.addEventListener("click", resetFilters);
      if (pagination) pagination.style.display = "none";
      return;
    }

    grid.innerHTML = d.items.map(renderCard).join("");
    grid.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const type = card.dataset.type;
        const id = card.dataset.id;
        const file = card.dataset.file;
        // For skills, use file name (UUID-based) instead of numeric ID
        const idParam = type === "skill" ? file : id;
        window.location.href = `/page/detail/${type}/${encodeURIComponent(idParam)}`;
      });
    });

    if (d.totalPages > 1 && pagination) {
      pagination.style.display = "flex";
      pagination.innerHTML = `
        <button class="btn btn-outline btn-sm" id="prev-btn" ${state.page <= 1 ? "disabled" : ""}>Previous</button>
        <span style="font-size:13px;color:var(--fg-muted)">${state.page} / ${d.totalPages}</span>
        <button class="btn btn-outline btn-sm" id="next-btn" ${state.page >= d.totalPages ? "disabled" : ""}>Next</button>`;
      document.getElementById("prev-btn")?.addEventListener("click", () => {
        if (state.page > 1) { state.page--; loadItems(); document.querySelector(".main")?.scrollTo({ top: 0, behavior: "smooth" }); }
      });
      document.getElementById("next-btn")?.addEventListener("click", () => {
        if (state.page < d.totalPages) { state.page++; loadItems(); document.querySelector(".main")?.scrollTo({ top: 0, behavior: "smooth" }); }
      });
    } else if (pagination) {
      pagination.style.display = "none";
    }
  } catch (e) {
    console.error(e);
    info.textContent = "Failed to load items.";
    grid.innerHTML = "";
  }
}

function renderCard(item) {
  const typeBadge = {
    template: `<span class="badge badge-template" style="display:none">Template</span>`,
    component: `<span class="badge badge-component" style="display:none">Component</span>`,
    asset: `<span class="badge badge-asset" style="display:none">Asset</span>`,
    skill: `<span class="badge badge-skill" style="display:none">Skill</span>`,
  }[item.type] || "";
  const image = item.image
    ? `<img src="${escAttr(item.image)}" alt="${escAttr(item.title)}" loading="lazy" class="card-image" onerror="this.style.display='none';var p=this.parentElement;if(p&&!p.querySelector('.card-image-placeholder')){var d=document.createElement('div');d.className='card-image-placeholder';d.textContent='No preview';p.appendChild(d)}">`
    : `<div class="card-image-placeholder">No preview</div>`;
  
  const showActions = item.type === "template" || item.type === "component";
  
  return `<div class="card" data-type="${item.type}" data-id="${item.id}" data-file="${escAttr(item.file)}">
    <div class="card-image-wrap">
      ${image}
      <div class="card-overlay"></div>
      ${item.premium ? `<span class="card-badge badge-pro">PRO</span>` : ""}
      ${showActions ? `<div class="card-actions">
        <button class="card-action-btn" onclick="event.stopPropagation();window.location.href='/page/detail/${item.type}/${item.type === 'skill' ? escAttr(item.file) : item.id}'">📄 DESIGN.md</button>
        <button class="card-action-btn" onclick="event.stopPropagation();window.location.href='/page/detail/${item.type}/${item.type === 'skill' ? escAttr(item.file) : item.id}'">✨ Copy</button>
      </div>` : ""}
      ${typeBadge}
    </div>
    <div class="card-footer">
      <h3 class="card-title" title="${escAttr(item.title)}">${esc(item.title)}</h3>
      <div class="card-stats">
        <span class="card-stat">👁 ${formatCount(item.views)}</span>
        ${item.forks > 0 ? `<span class="card-stat">⑂ ${formatCount(item.forks)}</span>` : ""}
      </div>
    </div>
  </div>`;
}

function formatCount(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n || 0);
}

function resetFilters() {
  state.q = "";
  state.tag = null;
  state.premium = false;
  state.featured = false;
  state.page = 1;
  const si = document.getElementById("search-input");
  if (si) si.value = "";
  const sc = document.getElementById("search-clear");
  if (sc) sc.style.display = "none";
  syncSidebar();
  loadItems();
}

// === Detail page ===
let currentItem = null;
let currentTab = "preview";

async function loadDetailPage(type, id) {
  // The detail page is server-rendered, just init interactions
  const app = document.getElementById("app");
  if (!app) return;
  
  // Get initial data from data attribute
  const initial = app.dataset.initial ? JSON.parse(app.dataset.initial) : null;
  if (!initial) {
    // Need to fetch
    const r = await fetch(`/api/item/${type}/${id}`);
    currentItem = await r.json();
  } else {
    currentItem = initial;
  }
  
  currentTab = "preview";
  
  // Setup tab handlers
  document.querySelectorAll(".detail-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      currentTab = tab.dataset.tab;
      document.querySelectorAll(".detail-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      loadDetailTab();
    });
  });
  
  loadDetailTab();
}

async function loadDetailTab() {
  if (!currentItem) return;
  const panel = document.getElementById("tab-content");
  if (!panel) return;
  panel.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;

  try {
    if (currentTab === "preview") {
      if (currentItem.has_code) {
        const r = await fetch(`/api/item-file?type=${currentItem.type}&file=${encodeURIComponent(currentItem.file)}&artifact=code`);
        const code = await r.text();
        panel.innerHTML = `<iframe srcDoc="${escAttr(code)}" title="Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" class="preview-pane"></iframe>`;
      } else if (currentItem.image) {
        panel.innerHTML = `<div style="text-align:center;padding:24px"><img src="${escAttr(currentItem.image)}" alt="${escAttr(currentItem.title)}" style="max-width:100%;border-radius:8px"></div>`;
      } else {
        panel.innerHTML = `<div class="artifact-empty"><div class="artifact-empty-content"><h3>No preview available</h3></div></div>`;
      }
    } else if (currentTab === "code") {
      const r = await fetch(`/api/item-file?type=${currentItem.type}&file=${encodeURIComponent(currentItem.file)}&artifact=code`);
      const code = await r.text();
      panel.innerHTML = `<div class="code-pane-wrap"><button class="copy-btn" id="copy-code">Copy HTML</button><pre class="code-pane"><code>${esc(code)}</code></pre></div>`;
      document.getElementById("copy-code")?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code);
          const btn = document.getElementById("copy-code");
          if (btn) { btn.textContent = "✓ Copied!"; setTimeout(() => btn.textContent = "Copy HTML", 2000); }
        } catch (e) { console.error(e); }
      });
    } else if (currentTab === "content" && currentItem.type === "skill") {
      const r = await fetch(`/api/item-file?type=skill&file=${encodeURIComponent(currentItem.file)}&artifact=content`);
      const content = await r.text();
      panel.innerHTML = `<div class="code-pane-wrap"><button class="copy-btn" id="copy-content">Copy Content</button><pre class="code-pane"><code>${esc(content)}</code></pre></div>`;
      document.getElementById("copy-content")?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(content);
          const btn = document.getElementById("copy-content");
          if (btn) { btn.textContent = "✓ Copied!"; setTimeout(() => btn.textContent = "Copy Content", 2000); }
        } catch (e) { console.error(e); }
      });
    } else if (currentTab === "design" || currentTab === "prompt") {
      const artifact = currentTab === "design" ? "design_md" : "recreation_prompt";
      const label = currentTab === "design" ? "DESIGN.md" : "Prompt";
      const r = await fetch(`/api/item-file?type=${currentItem.type}&file=${encodeURIComponent(currentItem.file)}&artifact=${artifact}`);
      if (r.status === 404) {
        panel.innerHTML = `<div class="artifact-empty"><div class="artifact-empty-content">
          <div style="font-size:40px">⚠️</div>
          <h3>Artifact not generated yet</h3>
          <p>This <code>${artifact}</code> needs to be generated via Aura's Edge Function. Once generated, it will appear here automatically.</p>
          <p style="font-size:12px;margin-top:12px">File expected at: <code>${currentItem.type === "component" ? "components" : "templates"}/${currentItem.file}.${artifact === "design_md" ? "design.md" : "prompt.md"}</code></p>
          <p style="margin-top:16px"><a href="#progress" class="btn btn-outline btn-sm">View Generation Progress →</a></p>
        </div></div>`;
        return;
      }
      const content = await r.text();
      if (currentTab === "design") {
        panel.innerHTML = `<div class="code-pane-wrap" style="background:var(--bg)"><button class="copy-btn" id="copy-md">Copy ${label}</button><div class="markdown" style="background:var(--bg)">${renderMarkdown(content)}</div></div>`;
      } else {
        panel.innerHTML = `<div class="code-pane-wrap"><button class="copy-btn" id="copy-md">Copy ${label}</button><pre class="code-pane"><code>${esc(content)}</code></pre></div>`;
      }
      document.getElementById("copy-md")?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(content);
          const btn = document.getElementById("copy-md");
          if (btn) { btn.textContent = "✓ Copied!"; setTimeout(() => btn.textContent = `Copy ${label}`, 2000); }
        } catch (e) { console.error(e); }
      });
    }
  } catch (e) {
    console.error(e);
    panel.innerHTML = `<div class="artifact-empty"><div class="artifact-empty-content"><p>Failed to load.</p></div></div>`;
  }
}

// === Learn page ===
async function loadLearnContent(subpage) {
  // Update active sidebar link
  document.querySelectorAll(".learn-sidebar a").forEach(a => {
    a.classList.toggle("active", a.dataset.learnPage === subpage);
  });
  const content = document.getElementById("learn-content");
  if (!content) return;
  content.innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;
  try {
    const r = await fetch(`/api/learn?page=${encodeURIComponent(subpage)}`);
    const d = await r.json();
    if (d.available && d.content) {
      content.innerHTML = `<div class="markdown">${renderMarkdown(d.content)}</div>`;
    } else {
      content.innerHTML = `<div class="artifact-empty"><div class="artifact-empty-content">
        <div style="font-size:40px">📄</div>
        <h3>Content not yet translated</h3>
        <p>Translation in progress. Please check back later.</p>
      </div></div>`;
    }
  } catch (e) {
    console.error(e);
    content.innerHTML = `<div class="artifact-empty"><div class="artifact-empty-content"><p>Failed to load.</p></div></div>`;
  }
}

// === Progress page ===
let progressInterval = null;
function initProgressRefresh() {
  // Already rendered server-side, just refresh counts every 10s
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(refreshProgressCounts, 10000);
  refreshProgressCounts();
}
async function refreshProgressCounts() {
  try {
    const r = await fetch("/api/progress");
    const d = await r.json();
    const dmEl = document.getElementById("design-md-count");
    const pmEl = document.getElementById("prompt-md-count");
    if (dmEl) dmEl.textContent = (d.design_md_count || 0).toLocaleString();
    if (pmEl) pmEl.textContent = (d.prompt_md_count || 0).toLocaleString();
  } catch (e) { /* ignore */ }
}

// === Sidebar sync ===
function syncSidebar() {
  document.querySelectorAll("#sort-buttons .sidebar-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.sort === state.sort);
  });
  const premiumBtn = document.getElementById("premium-toggle");
  const featuredBtn = document.getElementById("featured-toggle");
  if (premiumBtn) premiumBtn.classList.toggle("active", state.premium);
  if (featuredBtn) featuredBtn.classList.toggle("active", state.featured);
  const clearTagBtn = document.getElementById("clear-tag");
  if (clearTagBtn) clearTagBtn.style.display = state.tag ? "block" : "none";
  document.querySelectorAll(".sidebar-tag").forEach(b => {
    b.classList.toggle("active", b.dataset.tag === state.tag);
  });
}

// === Markdown renderer (lightweight) ===
function renderMarkdown(content) {
  const lines = content.split("\n");
  const out = [];
  let inCode = false;
  let codeLines = [];
  lines.forEach((line, i) => {
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
    if (inCode) { codeLines.push(line); return; }
    if (line.startsWith("# ")) out.push(`<h1>${esc(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) out.push(`<h2>${esc(line.slice(3))}</h2>`);
    else if (line.startsWith("### ")) out.push(`<h3>${esc(line.slice(4))}</h3>`);
    else if (line.startsWith("#### ")) out.push(`<h4>${esc(line.slice(5))}</h4>`);
    else if (line.startsWith("- ") || line.startsWith("* ")) out.push(`<li>${renderInline(line.slice(2))}</li>`);
    else if (/^\d+\.\s/.test(line)) out.push(`<li>${renderInline(line.replace(/^\d+\.\s/, ""))}</li>`);
    else if (line.startsWith("> ")) out.push(`<blockquote>${renderInline(line.slice(2))}</blockquote>`);
    else if (line.trim() === "") out.push(`<div style="height:12px"></div>`);
    else out.push(`<p>${renderInline(line)}</p>`);
  });
  if (inCode && codeLines.length) out.push(`<pre><code>${esc(codeLines.join("\n"))}</code></pre>`);
  return out.join("");
}

function renderInline(text) {
  let result = esc(text);
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Make bare URLs clickable
  result = result.replace(/(^|[^"=])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  return result;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escAttr(s) { return esc(s); }

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  
  // Theme toggle
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  
  // Top nav tabs - full page navigation
  document.querySelectorAll(".topnav-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const t = tab.dataset.tab;
      if (t === "design-md") {
        window.location.href = "/page/templates";
      } else if (t === "learn") {
        window.location.href = "/page/learn";
      } else if (t === "progress") {
        window.location.href = "/page/progress";
      } else {
        window.location.href = `/page/${t}`;
      }
    });
  });
  
  // Learn sidebar links - use hash for subpage (no full reload)
  document.querySelectorAll(".learn-sidebar a").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const p = a.dataset.learnPage;
      if (p) {
        // Update active state
        document.querySelectorAll(".learn-sidebar a").forEach(x => x.classList.remove("active"));
        a.classList.add("active");
        loadLearnContent(p);
      }
    });
  });
  
  // Search
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.q = e.target.value;
      if (searchClear) searchClear.style.display = state.q ? "block" : "none";
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        state.page = 1;
        const route = getRoute();
        if (["templates", "components", "assets", "skills"].includes(route.page)) {
          loadItems();
        }
      }, 350);
    });
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      state.q = "";
      searchClear.style.display = "none";
      state.page = 1;
      const route = getRoute();
      if (["templates", "components", "assets", "skills"].includes(route.page)) {
        loadItems();
      }
    });
  }
  
  // Sidebar sort buttons
  document.querySelectorAll("#sort-buttons .sidebar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.sort = btn.dataset.sort;
      state.page = 1;
      syncSidebar();
      loadItems();
    });
  });
  
  // Premium/Featured toggles
  document.getElementById("premium-toggle")?.addEventListener("click", () => {
    state.premium = !state.premium;
    state.page = 1;
    syncSidebar();
    loadItems();
  });
  document.getElementById("featured-toggle")?.addEventListener("click", () => {
    state.featured = !state.featured;
    state.page = 1;
    syncSidebar();
    loadItems();
  });
  document.getElementById("clear-tag")?.addEventListener("click", () => {
    state.tag = null;
    state.page = 1;
    syncSidebar();
    loadItems();
  });
  
  // Detect page type from server-rendered content
  const app = document.getElementById("app");
  const activeTab = app?.dataset.activeTab;
  const initialData = app?.dataset.initial;
  
  if (document.querySelector(".detail-page")) {
    // Detail page - init from embedded data
    if (initialData) {
      try {
        currentItem = JSON.parse(initialData);
      } catch {}
    }
    if (currentItem) {
      currentTab = "preview";
      document.querySelectorAll(".detail-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          currentTab = tab.dataset.tab;
          document.querySelectorAll(".detail-tab").forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          loadDetailTab();
        });
      });
      loadDetailTab();
    }
  } else if (document.querySelector(".progress-page")) {
    // Progress page
    initProgressRefresh();
  } else if (document.querySelector(".learn-sidebar")) {
    // Learn page - check hash for subpage
    const route = getRoute();
    if (route.page === "learn" && route.subpage) {
      loadLearnContent(route.subpage);
    } else {
      loadLearnContent("introduction");
    }
  } else if (document.querySelector(".hero") || document.querySelector(".grid")) {
    // Browse page - detect type from active tab
    if (activeTab) {
      state.type = activeTab;
    }
    loadTags();
    loadItems();
    syncSidebar();
  }
});

// No hashchange handler needed - all navigation is via full URL changes
