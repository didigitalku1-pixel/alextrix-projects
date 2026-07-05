"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR } from "../_content/types";

interface SidebarProps {
  activeSlug: string;
  /** Called when a sidebar link is clicked (for mobile close-on-click) */
  onNavigate?: () => void;
  /** Extra className for mobile drawer open state */
  mobileOpen?: boolean;
}

/**
 * Inline icon set (Lucide-style strokes, 14px viewBox).
 * Each icon is keyed by slug or videoHash so the sidebar shows a small
 * leading icon per item — matches aura.build's sidebar treatment.
 */
const ICONS: Record<string, JSX.Element> = {
  // Getting Started
  "introduction": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  ),
  "how-to-design": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
  ),
  "custom-domain": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  "seo-settings": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  "selling-templates": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
  ),
  "tips-for-prompting": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>
  ),
  "prompt-for-typography": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
  ),
  "prompt-for-styling": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"/><path d="M12 19v3"/></svg>
  ),
  "prompt-for-animation": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  "prompt-for-layout": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
  ),
  // Resources
  "video-tutorials": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
  ),
  "documentation": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
  ),
  "faq": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
  ),
};

/** Default icon for video entries (play circle) */
const VIDEO_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
);

/**
 * Learn sidebar — 3 groups (Getting Started, Videos, Resources).
 * Video entries anchor to /learn/video-tutorials#<hash>.
 *
 * Improvements over original:
 *  - Leading icon per item (matches aura.build)
 *  - Active state driven by current pathname, not just slug prop
 *  - Accepts onNavigate callback for mobile close-on-click
 */
export default function Sidebar({ activeSlug, onNavigate, mobileOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`learn-sidebar${mobileOpen ? " is-mobile-open" : ""}`}
      aria-label="Learn navigation"
      data-mobile-open={mobileOpen ? "true" : "false"}
    >
      {SIDEBAR.map((group) => (
        <div key={group.title} className="learn-sidebar-group">
          <div className="learn-sidebar-group-title">{group.title}</div>
          <ul className="learn-sidebar-list">
            {group.entries.map((entry) => {
              const isVideo = !!entry.videoHash;
              const href = isVideo
                ? `/learn/video-tutorials#${entry.videoHash}`
                : `/learn/${entry.slug}`;
              const isActive = !isVideo && entry.slug === activeSlug;
              const iconKey = isVideo ? entry.videoHash! : entry.slug!;
              const icon = ICONS[iconKey] ?? VIDEO_ICON;
              return (
                <li key={entry.label}>
                  <Link
                    href={href}
                    className={`learn-sidebar-link${isActive ? " active" : ""}`}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="learn-sidebar-link-icon" aria-hidden="true">
                      {icon}
                    </span>
                    <span className="learn-sidebar-link-label">{entry.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
