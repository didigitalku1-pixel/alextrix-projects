"use client";

import { useTheme } from "@/hooks/use-theme";

/**
 * Reusable theme toggle button with SVG icons.
 * Consistent across all browsers/platforms (no emoji rendering issues).
 */
export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      className="header-icon-btn"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
    >
      {isDark ? (
        // Sun icon (shown in dark mode — click to switch to light)
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // Moon icon (shown in light mode — click to switch to dark)
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
