/**
 * Single source of truth for navigation tabs.
 * Used by SiteHeader component on ALL pages.
 */

export interface NavTab {
  id: string;
  label: string;
  href: string;
  /** Pathnames that should mark this tab as active (besides href itself) */
  activePaths?: string[];
}

export const NAV_TABS: NavTab[] = [
  {
    id: "templates",
    label: "Template",
    href: "/templates",
    activePaths: ["/templates"],
  },
  {
    id: "components",
    label: "Komponen",
    href: "/components",
    activePaths: ["/components"],
  },
  {
    id: "assets",
    label: "Aset",
    href: "/assets",
    activePaths: ["/assets"],
  },
  {
    id: "skills",
    label: "Skill",
    href: "/skills",
    activePaths: ["/skills"],
  },
  {
    id: "design-md",
    label: "DESIGN.MD",
    href: "/design-systems",
    activePaths: ["/design-systems"],
  },
  {
    id: "learn",
    label: "Pelajari",
    href: "/learn/introduction",
    activePaths: ["/learn"],
  },
];

/**
 * Footer link columns — shared between all pages.
 */
export const FOOTER_COLUMNS = [
  {
    title: "PRODUK",
    links: [
      { text: "Template", href: "/templates" },
      { text: "Komponen", href: "/components" },
      { text: "Aset", href: "/assets" },
      { text: "Skill", href: "/skills" },
      { text: "Design.md", href: "/design-systems" },
    ],
  },
  {
    title: "SUMBER DAYA",
    links: [
      { text: "Pelajari", href: "/learn/introduction" },
      { text: "Dokumentasi", href: "/learn/documentation" },
      { text: "FAQ", href: "/learn/faq" },
      { text: "Tutorial", href: "/learn/video-tutorials" },
    ],
  },
  {
    title: "PERUSAHAAN",
    links: [
      { text: "Tentang", href: "/learn/introduction" },
      { text: "Kontak", href: "mailto:hello@alextrix.dev" },
      { text: "Privasi", href: "/learn/custom-domain" },
      { text: "Syarat", href: "/learn/seo-settings" },
    ],
  },
] as const;

/**
 * Social links for footer.
 */
export const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com", icon: "𝕏" },
  { label: "GitHub", href: "https://github.com/didigitalku1-pixel/web-library", icon: "⌥" },
  { label: "Discord", href: "https://discord.com", icon: "◈" },
] as const;
