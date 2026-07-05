"use client";

import Link from "next/link";
import { SIDEBAR } from "../_content/types";

interface SidebarProps {
  activeSlug: string;
  /** Called when a sidebar link is clicked (for mobile close-on-click) */
  onNavigate?: () => void;
}

/**
 * Learn sidebar — 3 groups (Getting Started, Videos, Resources).
 * Video entries anchor to /learn/video-tutorials#<hash>.
 *
 * No "LEARN" header — aura.build starts directly with the group titles,
 * which gives the sidebar more vertical room for the 37 entries.
 */
export default function Sidebar({ activeSlug, onNavigate }: SidebarProps) {
  return (
    <aside className="learn-sidebar" aria-label="Learn navigation">
      {SIDEBAR.map((group) => (
        <div key={group.title} className="learn-sidebar-group">
          <div className="learn-sidebar-group-title">{group.title}</div>
          <ul className="learn-sidebar-list">
            {group.entries.map((entry) => {
              const isVideo = !!entry.videoHash;
              const href = isVideo
                ? `/learn/video-tutorials#${entry.videoHash}`
                : `/learn/${entry.slug}`;
              const isActive =
                !isVideo && entry.slug === activeSlug;
              return (
                <li key={entry.label}>
                  <Link
                    href={href}
                    className={`learn-sidebar-link${isActive ? " active" : ""}`}
                    onClick={onNavigate}
                  >
                    {entry.label}
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
