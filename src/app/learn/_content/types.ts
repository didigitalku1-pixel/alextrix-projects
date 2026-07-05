import type { ReactNode } from "react";

/**
 * TOC item — used by ScrollSpy for the right-side "On this page" nav.
 */
export interface TocItem {
  id: string;
  label: string;
  level?: number; // 2 = H2, 3 = H3
}

/**
 * Content metadata for a learn page.
 * Each learn page registers its slug, sidebar label, group, body, and optional TOC.
 */
export interface LearnPageContent {
  slug: string;
  title: string;
  description: string;
  group: "getting-started" | "videos" | "resources";
  /** Optional hash anchor (only used by video entries that point to /learn/video-tutorials#<hash>) */
  videoHash?: string;
  /** Optional table-of-contents items (for the right-side TOC nav). */
  toc?: TocItem[];
  /** Render the page body */
  body: () => ReactNode;
}

/**
 * Sidebar entry — can be a real page or a video anchor inside video-tutorials.
 */
export interface SidebarEntry {
  label: string;
  slug?: string;
  videoHash?: string;
}

export interface SidebarGroup {
  title: string;
  entries: SidebarEntry[];
}

export const SIDEBAR: SidebarGroup[] = [
  {
    title: "Getting Started",
    entries: [
      { label: "Introduction", slug: "introduction" },
      { label: "How to Edit Designs", slug: "how-to-design" },
      { label: "Custom Domain", slug: "custom-domain" },
      { label: "SEO Settings", slug: "seo-settings" },
      { label: "Selling Templates", slug: "selling-templates" },
      { label: "Tips for Prompting", slug: "tips-for-prompting" },
      { label: "Typography Prompting", slug: "prompt-for-typography" },
      { label: "Styling Prompting", slug: "prompt-for-styling" },
      { label: "Animation Prompting", slug: "prompt-for-animation" },
      { label: "Layout Prompting", slug: "prompt-for-layout" },
    ],
  },
  {
    title: "Videos",
    entries: [
      { label: "Interactive Rain Hero", videoHash: "interactive-rain-hero" },
      { label: "Brutalist Landing Page", videoHash: "brutalist-landing-page" },
      { label: "$20K Website Prompt", videoHash: "20k-website-prompt" },
      { label: "$20K AI Workflow", videoHash: "20k-ai-workflow" },
      { label: "GPT Images + Grok", videoHash: "gpt-images-grok" },
      { label: "Avoid AI Slop", videoHash: "avoid-ai-slop" },
      { label: "Claude 4.8 vs GPT-5.5", videoHash: "claude-vs-gpt" },
      { label: "AI Landing Pages with Media", videoHash: "ai-landing-pages-media" },
      { label: "GPT Image to Landing Page", videoHash: "gpt-image-to-landing" },
      { label: "DESIGN.md Workflow", videoHash: "design-md-workflow" },
      { label: "GPT 5.5 + DESIGN.md", videoHash: "gpt-55-design-md" },
      { label: "Complex Animations", videoHash: "complex-animations" },
      { label: "DESIGN.md Better AI Design", videoHash: "design-md-better-design" },
      { label: "Animated WebGL Pages", videoHash: "animated-webgl-pages" },
      { label: "Gemini 3 Landing Pages", videoHash: "gemini-3-landing-pages" },
      { label: "Gemini 3 Animations", videoHash: "gemini-3-animations" },
      { label: "Gemini 3 Changes Everything", videoHash: "gemini-3-changes" },
      { label: "Using GPT 5.1 for Creating UIs", videoHash: "gpt-51-uis" },
      { label: "Aura Compose Workflow", videoHash: "aura-compose-workflow" },
      { label: "Turn AI Designs to Pro-level", videoHash: "pro-level-designs" },
      { label: "Master Customizations", videoHash: "master-customizations" },
      { label: "Image to HTML with AI", videoHash: "image-to-html" },
      { label: "Improve your AI Designs", videoHash: "improve-ai-designs" },
      { label: "How to Prompt for UI", videoHash: "how-to-prompt-ui" },
    ],
  },
  {
    title: "Resources",
    entries: [
      { label: "Video Tutorials", slug: "video-tutorials" },
      { label: "Documentation", slug: "documentation" },
      { label: "FAQ", slug: "faq" },
    ],
  },
];

export const VALID_LEARN_SLUGS = new Set(
  SIDEBAR.flatMap((g) => g.entries)
    .map((e) => e.slug)
    .filter((s): s is string => !!s)
);
