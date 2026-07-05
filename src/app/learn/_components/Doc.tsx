import type { ReactNode } from "react";
import { VideoWithPoster } from "./VideoWithPoster";

/* ============================================================================
   Documentation primitives — used to compose learn pages with a native,
   professional layout (Vercel/Stripe/Linear docs style).
   ========================================================================== */

/** H1 — page title. 48px / weight 400 / tracking -0.05em. */
export function DocH1({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1 id={id} className={`docs-h1 ${className}`} scroll-margin-top="96">
      {children}
    </h1>
  );
}

/** Lead paragraph — sits under H1. 24px / weight 300 / color #525252. */
export function DocLead({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`docs-lead ${className}`}>{children}</p>;
}

/** H2 — section heading. 24px / weight 500 / tracking -0.05em. */
export function DocH2({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={`docs-h2 ${className}`}>
      {children}
      <a href={id ? `#${id}` : undefined} className="docs-anchor" aria-label="Link to section">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </a>
    </h2>
  );
}

/** H3 — subsection heading. 18px / weight 500. */
export function DocH3({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h3 id={id} className={`docs-h3 ${className}`}>
      {children}
    </h3>
  );
}

/** H4 — sub-subsection heading. 15px / weight 600. */
export function DocH4({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h4 id={id} className={`docs-h4 ${className}`}>
      {children}
    </h4>
  );
}

/** Eyebrow — small uppercase label above feature description. */
export function DocEyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`docs-eyebrow ${className}`}>{children}</p>;
}

/** Body paragraph — 16px / weight 400 / color #404040 / max-width 70ch. */
export function DocP({ children, className = "", muted = false }: { children: ReactNode; className?: string; muted?: boolean }) {
  return <p className={`docs-p${muted ? " docs-p-muted" : ""} ${className}`}>{children}</p>;
}

/** Italic note — small muted text under a list or block. */
export function DocNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`docs-note ${className}`}>{children}</p>;
}

/** Unordered list. */
export function DocUL({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <ul className={`docs-ul ${className}`}>{children}</ul>;
}

/** Ordered list with numbered steps. */
export function DocOL({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <ol className={`docs-ol ${className}`}>{children}</ol>;
}

/** List item — supports eyebrow + body pattern (e.g. feature bullets). */
export function DocLI({
  children,
  title,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <li className={`docs-li ${className}`}>
      {title && <span className="docs-li-title">{title}</span>}
      <span className="docs-li-body">{children}</span>
    </li>
  );
}

/** Feature block — eyebrow + paragraph, used for "Key Features" style sections. */
export function DocFeatureBlock({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`docs-feature-block ${className}`}>
      <p className="docs-feature-title">{title}</p>
      <p className="docs-feature-body">{children}</p>
    </div>
  );
}

/** Step — single numbered step inside DocOL. */
export function DocStep({
  num,
  title,
  children,
}: {
  num: number;
  title?: string;
  children: ReactNode;
}) {
  return (
    <li className="docs-step">
      <span className="docs-step-num">{num}</span>
      <div className="docs-step-body">
        {title && <p className="docs-step-title">{title}</p>}
        <div className="docs-step-content">{children}</div>
      </div>
    </li>
  );
}

/** Pro Tip callout — left border accent + label. */
export function DocProTip({ children, label = "Pro Tip", className = "" }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <aside className={`docs-protip ${className}`}>
      <span className="docs-protip-label">{label}</span>
      <div className="docs-protip-body">{children}</div>
    </aside>
  );
}

/** Code block — monospace, dark bg. */
export function DocCodeBlock({ children, language, className = "" }: { children: ReactNode; language?: string; className?: string }) {
  return (
    <pre className={`docs-codeblock ${className}`}>
      {language && <span className="docs-codeblock-lang">{language}</span>}
      <code>{children}</code>
    </pre>
  );
}

/** Inline link inside article body. */
export function DocLink({
  href,
  children,
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`docs-link ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {external && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="docs-link-icon">
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      )}
    </a>
  );
}

/** Featured video block — large 16:9 with click-to-play poster (avoids YouTube bot detection). */
export function DocVideo({
  src,
  title,
  poster,
  className = "",
}: {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
}) {
  // Extract YouTube video ID for thumbnail
  const ytMatch = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  const ytId = ytMatch?.[1];
  // Build a clean URL without autoplay (autoplay triggers YouTube bot detection)
  const cleanSrc = src
    .replace("autoplay=1", "autoplay=0")
    .replace(/&autoplay=0&/g, "&")
    .replace(/[?&]autoplay=0/g, "");
  const thumb = poster ?? (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : undefined);

  return (
    <figure className={`docs-video ${className}`}>
      <div className="docs-video-frame">
        <VideoWithPoster src={cleanSrc} thumb={thumb} title={title} />
      </div>
      {title && <figcaption className="docs-video-caption">{title}</figcaption>}
    </figure>
  );
}

/** Client-side video with poster — shows thumbnail + play button, loads iframe on click. */
// (Moved to VideoWithPoster.tsx to keep Doc.tsx as server components)

/** Embedded iframe (for Figma widgets, demo sites, etc.). */
export function DocEmbed({
  src,
  title,
  aspect = "16/9",
  className = "",
}: {
  src: string;
  title?: string;
  aspect?: string;
  className?: string;
}) {
  // For external embeds (Figma, etc.) keep iframe.
  // For internal aura.build paths (start with /s/), show a styled placeholder
  // with link instead of broken iframe.
  const isInternal = src.startsWith("/s/") || src.startsWith("/embed/");

  if (isInternal) {
    return (
      <figure className={`docs-embed docs-embed-placeholder ${className}`} style={{ aspectRatio: aspect }}>
        <div className="docs-embed-placeholder-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <p className="docs-embed-placeholder-title">{title ?? "Interactive demo"}</p>
          <p className="docs-embed-placeholder-desc">This interactive template is available on aura.build.</p>
          <a
            href={`https://www.aura.build${src}`}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-embed-placeholder-link"
          >
            Open demo on aura.build →
          </a>
        </div>
      </figure>
    );
  }

  return (
    <figure className={`docs-embed ${className}`} style={{ aspectRatio: aspect }}>
      <iframe src={src} title={title ?? "Embedded content"} loading="lazy" allowFullScreen />
    </figure>
  );
}

/** Two-column card grid — for "Getting Started" next-steps. */
export function DocCardGrid({ children, cols = 2, className = "" }: { children: ReactNode; cols?: 2 | 3; className?: string }) {
  return (
    <div className={`docs-card-grid docs-card-grid-${cols} ${className}`}>{children}</div>
  );
}

/** Card link — for next-steps. */
export function DocCardLink({
  href,
  title,
  children,
  external = false,
  className = "",
}: {
  href: string;
  title: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`docs-card ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="docs-card-title">{title}</span>
      <span className="docs-card-body">{children}</span>
      <span className="docs-card-arrow" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </a>
  );
}

/** Button-style link — primary or secondary. */
export function DocButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`docs-btn docs-btn-${variant} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/** Inline pill — for "tag" style labels. */
export function DocPill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`docs-pill ${className}`}>{children}</span>;
}

/** Divider — subtle horizontal rule between sections. */
export function DocDivider({ className = "" }: { className?: string }) {
  return <hr className={`docs-divider ${className}`} />;
}

/** Page transition grid (fade, slide, scale, etc.) — small label cards. */
export function DocTransitionGrid({
  items,
  className = "",
}: {
  items: { name: string; description: string }[];
  className?: string;
}) {
  return (
    <div className={`docs-transition-grid ${className}`}>
      {items.map((it) => (
        <div key={it.name} className="docs-transition-item">
          <span className="docs-transition-name">{it.name}</span>
          <span className="docs-transition-desc">{it.description}</span>
        </div>
      ))}
    </div>
  );
}
