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
    label: "Templates",
    href: "/templates",
    activePaths: ["/templates"],
  },
  {
    id: "components",
    label: "Components",
    href: "/components",
    activePaths: ["/components"],
  },
  {
    id: "assets",
    label: "Assets",
    href: "/assets",
    activePaths: ["/assets"],
  },
  {
    id: "skills",
    label: "Skills",
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
    label: "Learn",
    href: "/learn/introduction",
    activePaths: ["/learn"],
  },
];

/**
 * Footer link columns — shared between all pages.
 */
export const FOOTER_COLUMNS = [
  {
    title: "PRODUCT",
    links: [
      { text: "Templates", href: "/templates" },
      { text: "Components", href: "/components" },
      { text: "Assets", href: "/assets" },
      { text: "Skills", href: "/skills" },
      { text: "Design.md", href: "/design-systems" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { text: "Learn", href: "/learn/introduction" },
      { text: "Docs", href: "/learn/documentation" },
      { text: "FAQ", href: "/learn/faq" },
      { text: "Tutorials", href: "/learn/video-tutorials" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { text: "About", href: "/learn/introduction" },
      { text: "Contact", href: "mailto:hello@alextrix.dev" },
      { text: "Privacy", href: "/learn/custom-domain" },
      { text: "Terms", href: "/learn/seo-settings" },
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
