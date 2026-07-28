"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "aura-theme";
type Theme = "light" | "dark";

/**
 * Centralized theme hook.
 *
 * Replaces duplicated dark-mode logic across multiple components
 * (page.tsx, design-systems/page.tsx, design-systems/[slug]/page.tsx,
 * slug-detail.tsx — all previously had their own copy of this logic).
 *
 * Uses localStorage so user preference persists across pages.
 */
export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "dark" || saved === "light") {
        setThemeState(saved);
      }
    } catch {
      // localStorage not available (SSR or disabled) — use default
    }
  }, []);

  // Apply theme to documentElement when it changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore — localStorage not available
    }
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return {
    theme,
    setTheme,
    toggle,
    isDark: theme === "dark",
    mounted,
  };
}
