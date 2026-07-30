/**
 * Shared formatting utilities.
 * Single source of truth — replaces 6+ duplicate implementations across codebase.
 */

/**
 * Format a view/fork/like count with k/M suffixes.
 * @example formatCount(1234) → "1.2k"
 * @example formatCount(1500000) → "1.5M"
 * @example formatCount(0) → "0"
 * @example formatCount(undefined) → "0"
 */
export function formatCount(n: number | undefined | null): string {
  const num = typeof n === "number" && !isNaN(n) ? n : 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
}

/**
 * Format a number with locale-aware grouping (e.g. 21,563).
 */
export function formatNumber(n: number | undefined | null): string {
  const num = typeof n === "number" && !isNaN(n) ? n : 0;
  return num.toLocaleString("en-US");
}

/**
 * Format an ISO date string to a human-readable date.
 * @example formatDate("2026-07-30T10:00:00Z") → "July 30, 2026"
 */
export function formatDate(iso: string | null | undefined, opts?: { short?: boolean }): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: opts?.short ? "short" : "long",
    day: "numeric",
  });
}
