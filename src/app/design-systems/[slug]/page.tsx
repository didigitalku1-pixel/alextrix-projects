"use client";

import { use, useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@/hooks/use-theme";

/**
 * Parse DESIGN.md frontmatter (YAML between --- markers) into structured data.
 * Returns { frontmatter, body } where frontmatter is a nested object.
 */
function parseDesignMd(content: string): {
  frontmatter: Record<string, any>;
  body: string;
} {
  if (!content) return { frontmatter: {}, body: "" };

  // Check for frontmatter delimiters
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!fmMatch) {
    return { frontmatter: {}, body: content };
  }

  const fmRaw = fmMatch[1];
  const body = fmMatch[2] || "";

  // Simple YAML parser for our flat/nested structure
  const frontmatter: Record<string, any> = {};
  const lines = fmRaw.split("\n");
  let currentKey = "";
  let currentObj: Record<string, any> | null = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // Top-level key (no leading space)
    if (!line.startsWith(" ") && line.includes(":")) {
      const idx = line.indexOf(":");
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();

      if (val === "" || val === undefined) {
        // Nested object starts
        currentKey = key;
        currentObj = {};
        frontmatter[key] = currentObj;
      } else {
        // Scalar value - strip quotes
        frontmatter[key] = val.replace(/^["']|["']$/g, "");
        currentKey = "";
        currentObj = null;
      }
    } else if (currentObj && line.startsWith("  ")) {
      // Nested key
      const trimmed = line.trim();
      if (trimmed.includes(":")) {
        const idx = trimmed.indexOf(":");
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        currentObj[key] = val;
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Wraps raw HTML in full document with Tailwind CDN + dark bg.
 * SECURITY: No allow-same-origin in sandbox — content is user-controlled.
 */
function withTailwindAndAutoResize(html: string): string {
  const hasTailwind = /cdn\.tailwindcss\.com/i.test(html);
  const tailwindScript = hasTailwind
    ? ""
    : `<script src="https://cdn.tailwindcss.com"></script>`;

  const headInjection = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    ${tailwindScript}
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body { height: 100%; overflow: auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000000; color: #ffffff; }
      .component-wrapper { width: 100%; height: 100%; padding: 0; box-sizing: border-box; overflow: auto; }
    </style>
  `;

  if (/<html[^>]*>/i.test(html) && /<\/html>/i.test(html)) {
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (match) => match + headInjection);
    } else {
      html = html.replace(
        /<html[^>]*>/i,
        (match) => match + "<head>" + headInjection + "</head>",
      );
    }
    return html;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>${headInjection}</head>
<body>
<div class="component-wrapper">
${html}
</div>
</body>
</html>`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DesignSystemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [item, setItem] = useState<any>(null);
  const [tab, setTab] = useState<"preview" | "design">("preview");
  const [loading, setLoading] = useState(true);
  const { isDark, toggle: toggleTheme } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
    setItem(null);
    fetch(`/api/design-systems/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => {
        setItem(d);
        // Default tab: preview if preview_html exists, else design
        setTab(d.preview_html ? "preview" : "design");
        setLoading(false);
      })
      .catch((e) => {
        console.error("DS detail fetch error:", e);
        setLoading(false);
      });
  }, [slug]);

  // Parse DESIGN.md content into frontmatter + body
  const { frontmatter, body } = useMemo(
    () => parseDesignMd(item?.content || ""),
    [item?.content],
  );

  // Extract markdown sections by ## Heading
  const sections = useMemo(() => {
    const result: Record<string, string> = {};
    if (!body) return result;
    // Split by ## headings
    const parts = body.split(/^## (.+)$/gm);
    // parts[0] = pre-content; parts[1] = first heading; parts[2] = first content; parts[3] = second heading; ...
    for (let i = 1; i < parts.length; i += 2) {
      const heading = parts[i].trim();
      const content = (parts[i + 1] || "").trim();
      result[heading.toLowerCase()] = `## ${heading}\n\n${content}`;
    }
    return result;
  }, [body]);

  // Auto-generate section from frontmatter (Option A)
  const generateSection = (key: string, label: string, data: Record<string, any>): string => {
    if (!data || Object.keys(data).length === 0) return "";
    const lines = [`## ${label}`, ""];
    // Build human-readable description
    const entries = Object.entries(data);
    if (key === "colors") {
      const colorList = entries.map(([k, v]) => `\`${String(v)}\` (${k})`).join(", ");
      lines.push(`The color system uses ${colorList.includes("#FFFFFF") ? "light mode" : "a custom palette"} with ${entries[0][1]} as the main accent and ${entries[1] ? entries[1][1] : "#FFFFFF"} as the neutral foundation.`);
      lines.push("");
      lines.push("| Role | Value |");
      lines.push("| --- | --- |");
      entries.forEach(([k, v]) => lines.push(`| ${k} | ${String(v)} |`));
    } else if (key === "typography") {
      const fam = entries[0] ? (entries[0][1] as any)?.fontFamily || entries[0][1] : "Inter";
      lines.push(`Typography uses ${fam} as the primary font family with ${entries.length} defined styles.`);
      lines.push("");
      lines.push("| Style | Family | Size | Weight |");
      lines.push("| --- | --- | --- | --- |");
      entries.forEach(([k, v]: [string, any]) => {
        const fam = (v?.fontFamily) || "—";
        const size = (v?.fontSize) || "—";
        const weight = (v?.fontWeight) || "—";
        lines.push(`| ${k} | ${fam} | ${size} | ${weight} |`);
      });
    } else if (key === "spacing") {
      lines.push(`Spacing scale defines ${entries.length} steps from ${entries[0][1]} to ${entries[entries.length - 1][1]}.`);
      lines.push("");
      lines.push("| Step | Value |");
      lines.push("| --- | --- |");
      entries.forEach(([k, v]) => lines.push(`| ${k} | ${String(v)} |`));
    } else if (key === "rounded") {
      lines.push(`Border radius scale defines ${entries.length} levels for various UI elements.`);
      lines.push("");
      lines.push("| Name | Radius |");
      lines.push("| --- | --- |");
      entries.forEach(([k, v]) => lines.push(`| ${k} | ${String(v)} |`));
    } else {
      lines.push(`Configuration for ${label}:`);
      lines.push("");
      entries.forEach(([k, v]) => lines.push(`- **${k}**: ${String(v)}`));
    }
    return lines.join("\n");
  };

  // Get section content by key (from body, fallback to generated from frontmatter)
  const getSection = (key: string, label: string, data: Record<string, any>): string => {
    const bodySection = sections[key.toLowerCase()];
    if (bodySection) return bodySection;
    return generateSection(key, label, data);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const copyToClipboard = async (text: string, label: string, toastMsg?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      showToast(toastMsg || `Copied ${label} to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error("Clipboard error:", e);
      showToast("Copy failed — please try again");
    }
  };

  const downloadFile = (content: string, filename: string, type: string, toastMsg?: string) => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast(toastMsg || `Downloaded ${filename}`);
    } catch (e) {
      console.error("Download error:", e);
      showToast("Download failed");
    }
  };

  if (loading) {
    return (
      <div className="app">
        <main className="main">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="app">
        <main className="main">
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <p className="empty-title">Design system not found</p>
            <a
              href="/design-systems"
              className="btn btn-outline"
              style={{ marginTop: 16 }}
            >
              ← Back to Design Systems
            </a>
          </div>
        </main>
      </div>
    );
  }

  const navTabs = [
    { id: "templates", label: "Templates", href: "/templates" },
    { id: "components", label: "Components", href: "/components" },
    { id: "assets", label: "Assets", href: "/assets" },
    { id: "skills", label: "Skills", href: "/skills" },
    { id: "design-md", label: "DESIGN.MD", active: true },
    { id: "learn", label: "Learn", href: "/learn/introduction" },
  ];

  const colors = frontmatter.colors || {};
  const typography = frontmatter.typography || {};
  const spacing = frontmatter.spacing || {};
  const rounded = frontmatter.rounded || {};

  return (
    <div className="app alextrix-app">
      {/* Main content — header is now global via layout.tsx */}
      <main className="main ds-main">
        <div className="ds-grid">
          {/* LEFT: Main column */}
          <div className="ds-main-col">
            {/* Hero */}
            <div className="ds-hero">
              <div className="ds-hero-top">
                <a href="/design-systems" className="ds-back-link">
                  ← Back to design systems
                </a>
              </div>
              <div className="ds-hero-content">
                <div className="ds-hero-left">
                  <h1 className="ds-title">{item.title}</h1>
                  {item.source_name && (
                    <div className="ds-filepath">
                      <span className="ds-filepath-icon">📄</span>
                      <code>{item.source_name}</code>
                    </div>
                  )}
                  {item.featured && (
                    <span className="ds-featured-badge">✦ Featured</span>
                  )}
                  {item.desc && (
                    <p className="ds-description">{item.desc}</p>
                  )}
                </div>
                <div className="ds-hero-actions">
                  <button
                    className="ds-btn-primary"
                    onClick={() => copyToClipboard(item.content || "", "prompt", "Ditambahkan ke prompt")}
                    disabled={!item.content}
                  >
                    {copied === "prompt" ? "✓ Ditambahkan!" : "⚡ Add to Prompt"}
                  </button>
                  <button
                    className="ds-btn-ghost"
                    onClick={() => downloadFile(item.content || "", `${item.slug || "design-system"}-design.md`, "text/markdown", `Downloaded ${item.slug || "design-system"}-design.md`)}
                    disabled={!item.content}
                  >
                    ⬇ DESIGN.md
                  </button>
                  <button
                    className="ds-btn-ghost"
                    onClick={() => downloadFile(withTailwindAndAutoResize(item.preview_html || ""), `${item.slug || "design-system"}.html`, "text/html", `Downloaded ${item.slug || "design-system"}.html`)}
                    disabled={!item.preview_html}
                  >
                    ⬇ HTML
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {item.preview_html && (
              <div className="ds-preview-card">
                <div className="ds-preview-chrome">
                  <div className="ds-traffic-lights">
                    <span className="traffic-light red" />
                    <span className="traffic-light yellow" />
                    <span className="traffic-light green" />
                  </div>
                  <span className="ds-preview-label">HTML Preview</span>
                  <span className="ds-preview-file">
                    {item.slug}.html
                  </span>
                </div>
                <div className="ds-preview-body">
                  <iframe
                    ref={iframeRef}
                    srcDoc={withTailwindAndAutoResize(item.preview_html)}
                    title="HTML Preview"
                    sandbox="allow-scripts allow-popups"
                    className="ds-preview-iframe"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* DESIGN.md Viewer Card */}
            {item.content && (
              <div className="ds-designmd-card">
                <div className="ds-designmd-header">
                  <div>
                    <span className="ds-section-label">DESIGN . MD</span>
                    <h2 className="ds-designmd-title">Prompt context source</h2>
                  </div>
                  <button
                    className="ds-copy-all-btn"
                    onClick={() => copyToClipboard(item.content, "all", "DESIGN.md disalin")}
                    title="Copy entire DESIGN.md"
                  >
                    {copied === "all" ? "✓ Copied!" : "⎘ Copy All"}
                  </button>
                </div>

                {/* Frontmatter table */}
                {Object.keys(frontmatter).length > 0 && (
                  <div className="ds-fm-table">
                    {frontmatter.version && (
                      <FmRow label="version" value={frontmatter.version} onCopy={() => copyToClipboard(`version: ${frontmatter.version}`, "version", "Copied version")} />
                    )}
                    {frontmatter.name && (
                      <FmRow label="name" value={frontmatter.name} onCopy={() => copyToClipboard(`name: ${frontmatter.name}`, "name", "Copied name")} />
                    )}
                    {frontmatter.description && (
                      <FmRow
                        label="description"
                        value={frontmatter.description}
                        onCopy={() => copyToClipboard(`description: ${frontmatter.description}`, "description", "Copied description")}
                      />
                    )}

                    {/* Colors */}
                    {Object.keys(colors).length > 0 && (
                      <FmGroup label="colors" onCopy={() => copyToClipboard(generateSection("colors", "Colors", colors), "colors", "Bagian Colors disalin")}>
                        {Object.entries(colors).map(([k, v]) => (
                          <FmRow
                            key={k}
                            label={k}
                            value={String(v)}
                            swatch={String(v).startsWith("#") ? String(v) : undefined}
                            onCopy={() => copyToClipboard(String(v), `color-${k}`, `Copied ${k}: ${String(v)}`)}
                          />
                        ))}
                      </FmGroup>
                    )}

                    {/* Typography */}
                    {Object.keys(typography).length > 0 && (
                      <FmGroup label="typography" onCopy={() => copyToClipboard(generateSection("typography", "Typography", typography), "typography", "Bagian Typography disalin")}>
                        {Object.entries(typography).map(([k, v]) => (
                          <FmRow
                            key={k}
                            label={k}
                            value={typeof v === "object" ? JSON.stringify(v) : String(v)}
                            onCopy={() => copyToClipboard(typeof v === "object" ? JSON.stringify(v) : String(v), `typo-${k}`, `Copied ${k}`)}
                          />
                        ))}
                      </FmGroup>
                    )}

                    {/* Spacing */}
                    {Object.keys(spacing).length > 0 && (
                      <FmGroup label="spacing" onCopy={() => copyToClipboard(generateSection("spacing", "Spacing", spacing), "spacing", "Bagian Spacing disalin")}>
                        {Object.entries(spacing).map(([k, v]) => (
                          <FmRow key={k} label={k} value={String(v)} onCopy={() => copyToClipboard(String(v), `spacing-${k}`, `Copied ${k}: ${String(v)}`)} />
                        ))}
                      </FmGroup>
                    )}

                    {/* Rounded */}
                    {Object.keys(rounded).length > 0 && (
                      <FmGroup label="rounded" onCopy={() => copyToClipboard(generateSection("rounded", "Rounded", rounded), "rounded", "Bagian Radius disalin")}>
                        {Object.entries(rounded).map(([k, v]) => (
                          <FmRow key={k} label={k} value={String(v)} onCopy={() => copyToClipboard(String(v), `radius-${k}`, `Copied ${k}: ${String(v)}`)} />
                        ))}
                      </FmGroup>
                    )}
                  </div>
                )}

                {/* Markdown body */}
                {body && (
                  <div className="ds-markdown-body">
                    <ReactMarkdown>{body}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Sidebar — No scroll, condensed cards */}
          <aside className="ds-sidebar">
            {/* Copy All Sections button (top of sidebar) */}
            {item.content && (
              <button
                className="ds-copy-all-sections-btn"
                onClick={() => copyToClipboard(item.content, "all-sections", "Semua bagian disalin")}
              >
                {copied === "all-sections" ? "✓ Copied All Sections!" : "⎘ Copy All Sections"}
              </button>
            )}

            {/* Visual Cards - Colors (with copy on hover) */}
            {Object.keys(colors).length > 0 && (
              <div
                className="ds-sb-card ds-sb-card-copyable"
                onClick={() => copyToClipboard(getSection("colors", "Colors", colors), "sb-colors", "Bagian Colors disalin")}
                title="Click to copy Colors section"
              >
                <div className="ds-sb-card-header">
                  <div className="ds-sb-label">COLORS</div>
                  <span className="ds-sb-copy-icon">{copied === "sb-colors" ? "✓" : "⎘"}</span>
                </div>
                <div className="ds-color-swatches ds-color-swatches-compact">
                  {Object.entries(colors)
                    .filter(([, v]) => String(v).startsWith("#"))
                    .slice(0, 6)
                    .map(([k, v]) => (
                      <div key={k} className="ds-swatch-mini">
                        <span
                          className="ds-swatch"
                          style={{ background: String(v) }}
                        />
                        <span className="ds-swatch-hex">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Typography (with copy on hover) */}
            {Object.keys(typography).length > 0 && (
              <div
                className="ds-sb-card ds-sb-card-copyable"
                onClick={() => copyToClipboard(getSection("typography", "Typography", typography), "sb-typography", "Bagian Typography disalin")}
                title="Click to copy Typography section"
              >
                <div className="ds-sb-card-header">
                  <div className="ds-sb-label">TYPOGRAPHY</div>
                  <span className="ds-sb-copy-icon">{copied === "sb-typography" ? "✓" : "⎘"}</span>
                </div>
                <div className="ds-typo-list ds-typo-list-compact">
                  {Object.entries(typography).slice(0, 3).map(([k, v]: [string, any]) => (
                    <div key={k} className="ds-typo-card ds-typo-card-compact">
                      <div
                        className="ds-typo-sample ds-typo-sample-sm"
                        style={{
                          fontFamily: v.fontFamily || "inherit",
                          fontSize: "20px",
                          fontWeight: v.fontWeight || 400,
                        }}
                      >
                        Ag
                      </div>
                      <div className="ds-typo-meta">
                        <div className="ds-typo-name">{k}</div>
                        <div className="ds-typo-font">{v.fontFamily} · {v.fontSize}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spacing (with copy on hover) */}
            {Object.keys(spacing).length > 0 && (
              <div
                className="ds-sb-card ds-sb-card-copyable"
                onClick={() => copyToClipboard(getSection("spacing", "Spacing", spacing), "sb-spacing", "Bagian Spacing disalin")}
                title="Click to copy Spacing section"
              >
                <div className="ds-sb-card-header">
                  <div className="ds-sb-label">SPACING</div>
                  <span className="ds-sb-copy-icon">{copied === "sb-spacing" ? "✓" : "⎘"}</span>
                </div>
                <div className="ds-spacing-list ds-spacing-list-compact">
                  {Object.entries(spacing).slice(0, 6).map(([k, v]) => {
                    const numMatch = String(v).match(/(\d+)/);
                    const num = numMatch ? parseInt(numMatch[1]) : 8;
                    return (
                      <div key={k} className="ds-spacing-row ds-spacing-row-compact">
                        <span
                          className="ds-spacing-bar"
                          style={{ width: `${Math.min(num * 2, 48)}px` }}
                        />
                        <span className="ds-spacing-label">{k}</span>
                        <span className="ds-spacing-val">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Radius (with copy on hover) */}
            {Object.keys(rounded).length > 0 && (
              <div
                className="ds-sb-card ds-sb-card-copyable"
                onClick={() => copyToClipboard(getSection("rounded", "Rounded", rounded), "sb-radius", "Bagian Radius disalin")}
                title="Click to copy Radius section"
              >
                <div className="ds-sb-card-header">
                  <div className="ds-sb-label">RADIUS</div>
                  <span className="ds-sb-copy-icon">{copied === "sb-radius" ? "✓" : "⎘"}</span>
                </div>
                <div className="ds-radius-list ds-radius-list-compact">
                  {Object.entries(rounded).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="ds-radius-row ds-radius-row-compact">
                      <span
                        className="ds-radius-preview"
                        style={{ borderRadius: String(v) }}
                      />
                      <span className="ds-radius-label">{k}</span>
                      <span className="ds-radius-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="ds-toast">{toast}</div>
      )}
    </div>
  );
}

/** Frontmatter row (key/value) — with hover copy */
function FmRow({
  label,
  value,
  swatch,
  onCopy,
}: {
  label: string;
  value: string;
  swatch?: string;
  onCopy?: () => void;
}) {
  return (
    <div
      className={`ds-fm-row${onCopy ? " ds-fm-row-copyable" : ""}`}
      onClick={onCopy}
      title={onCopy ? "Click to copy" : undefined}
    >
      <span className="ds-fm-key">{label}</span>
      <span className="ds-fm-val">
        {swatch && (
          <span
            className="ds-fm-swatch"
            style={{ background: swatch }}
          />
        )}
        <code>{value}</code>
        {onCopy && <span className="ds-fm-row-copy-icon">⎘</span>}
      </span>
    </div>
  );
}

/** Frontmatter group (e.g. colors, typography) — with hover copy */
function FmGroup({
  label,
  children,
  onCopy,
}: {
  label: string;
  children: React.ReactNode;
  onCopy?: () => void;
}) {
  return (
    <div className="ds-fm-group">
      <div className="ds-fm-group-label">
        {label}
        {onCopy && (
          <button className="ds-fm-group-copy" onClick={(e) => { e.stopPropagation(); onCopy(); }} title={`Copy ${label} section`}>
            ⎘
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
// DsFooter function removed — now using global SiteFooter from layout.tsx
