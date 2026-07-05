"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ScrollSpy — highlights the active item in a Table of Contents based on
 * which section is currently in view. Uses IntersectionObserver.
 *
 * Props:
 *  - items: [{ id, label }]
 *  - className: optional
 */
export interface TocItem {
  id: string;
  label: string;
  level?: number; // 2 = H2, 3 = H3
}

export function ScrollSpy({
  items,
  className = "",
}: {
  items: TocItem[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!items.length) return;

    // Use IntersectionObserver to track which heading is in view
    const callback: IntersectionObserverCallback = (entries) => {
      // Find the entry that is most in view (highest intersectionRatio among visible)
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      // Trigger when heading enters the top 30% of viewport
      rootMargin: "-80px 0px -60% 0px",
      threshold: [0, 0.5, 1.0],
    });

    // Observe all heading elements with matching IDs
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  if (!items.length) return null;

  return (
    <nav className={`docs-toc ${className}`} aria-label="On this page">
      <h2 className="docs-toc-title">On this page</h2>
      <ul className="docs-toc-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`docs-toc-item${item.level === 3 ? " docs-toc-item-nested" : ""}`}
          >
            <a
              href={`#${item.id}`}
              className={`docs-toc-link${
                activeId === item.id ? " docs-toc-link-active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  // Update hash without jumping
                  history.replaceState(null, "", `#${item.id}`);
                }
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
