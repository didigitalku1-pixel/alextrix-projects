"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

/**
 * Learn page — renders scraped HTML from aura.build in an iframe.
 *
 * The HTML files in /public/learn-data/ are scraped directly from
 * https://www.aura.build/learn/<page> and include Tailwind CDN.
 * This guarantees 100% visual identity with aura.build.
 *
 * Sidebar links are hardcoded to match aura.build's exact structure:
 *   GETTING STARTED (10 pages)
 *   VIDEOS (24 video entries — link to /learn/video-tutorials#<hash>)
 *   RESOURCES (3 pages)
 */

const LEARN_SLUGS = new Set([
  "introduction",
  "how-to-design",
  "custom-domain",
  "seo-settings",
  "selling-templates",
  "tips-for-prompting",
  "prompt-for-typography",
  "prompt-for-styling",
  "prompt-for-animation",
  "prompt-for-layout",
  "video-tutorials",
  "documentation",
  "faq",
]);

interface SidebarEntry {
  label: string;
  slug?: string;
  hash?: string;
  isVideo?: boolean;
}

interface SidebarGroup {
  title: string;
  entries: SidebarEntry[];
}

const SIDEBAR: SidebarGroup[] = [
  {
    title: "GETTING STARTED",
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
    title: "VIDEOS",
    entries: [
      { label: "Interactive Rain Hero", isVideo: true, hash: "interactive-rain-hero-opus-48" },
      { label: "Brutalist Landing Page", isVideo: true, hash: "design-to-website-brutalist-landing-page" },
      { label: "$20K Website Prompt", isVideo: true, hash: "one-prompt-20000-website-claude-fable-5" },
      { label: "$20K AI Workflow", isVideo: true, hash: "recreate-20000-website-ai-workflow" },
      { label: "GPT Images + Grok", isVideo: true, hash: "gpt-images-grok-imagine-landing-page-workflow" },
      { label: "Avoid AI Slop", isVideo: true, hash: "avoid-ai-slop-vibe-coded-landing-pages" },
      { label: "Claude 4.8 vs GPT-5.5", isVideo: true, hash: "claude-opus-48-vs-gpt-55-landing-pages" },
      { label: "AI Landing Pages with Media", isVideo: true, hash: "ai-landing-pages-images-videos" },
      { label: "GPT Image to Landing Page", isVideo: true, hash: "gpt-image-2-gpt-55-landing-page" },
      { label: "DESIGN.md Workflow", isVideo: true, hash: "design-md-ai-web-design-workflow" },
      { label: "GPT 5.5 + DESIGN.md", isVideo: true, hash: "better-landing-pages-gpt-55-design-md" },
      { label: "Complex Animations", isVideo: true, hash: "complex-animations-chatgpt-design-md" },
      { label: "DESIGN.md Better AI Design", isVideo: true, hash: "design-md-file-ai-design-better" },
      { label: "Animated WebGL Pages", isVideo: true, hash: "animated-webgl-gemini-design-md" },
      { label: "Gemini 3 Landing Pages", isVideo: true, hash: "gemini-3-pro-level-landing-page" },
      { label: "Gemini 3 Animations", isVideo: true, hash: "gemini-3-animations" },
      { label: "Gemini 3 Changes Everything", isVideo: true, hash: "gemini-3-changes-web-design" },
      { label: "Using GPT 5.1 for Creating UIs", isVideo: true, hash: "gpt-51-creating-uis" },
      { label: "Aura Compose Workflow", isVideo: true, hash: "aura-compose-workflow" },
      { label: "Turn AI Designs to Pro-level", isVideo: true, hash: "turn-ai-designs-pro-level" },
      { label: "Master Customizations", isVideo: true, hash: "master-customizations" },
      { label: "Image to HTML with AI", isVideo: true, hash: "image-to-html-ai" },
      { label: "Improve your AI Designs", isVideo: true, hash: "improve-ai-designs" },
      { label: "How to Prompt for UI", isVideo: true, hash: "how-to-prompt-ui" },
    ],
  },
  {
    title: "RESOURCES",
    entries: [
      { label: "Video Tutorials", slug: "video-tutorials" },
      { label: "Documentation", slug: "documentation" },
      { label: "FAQ", slug: "faq" },
    ],
  },
];

export default function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [dark, setDark] = useState(false);

  // Validate slug — redirect invalid slugs to introduction
  useEffect(() => {
    if (!LEARN_SLUGS.has(slug)) {
      window.location.href = "/learn/introduction";
    }
  }, [slug]);

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("aura-theme", dark ? "dark" : "light");
  }, [dark]);

  const iframeSrc = `/learn-data/${slug}.html`;

  return (
    <div className="app" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <a href="/" className="header-logo"><div className="header-logo-icon">A</div></a>
          <nav className="header-nav">
            <a href="/" className="header-tab">CREATE</a>
            <a href="/?tab=templates" className="header-tab">TEMPLATES</a>
            <a href="/?tab=components" className="header-tab">COMPONENTS</a>
            <a href="/?tab=assets" className="header-tab">ASSETS</a>
            <a href="/?tab=skills" className="header-tab">SKILLS</a>
            <a href="/design-systems" className="header-tab">DESIGN.MD</a>
            <a href="/learn/introduction" className="header-tab active">LEARN</a>
            <a href="/" className="header-tab">PRICING</a>
          </nav>
          <div className="header-right">
            <button className="header-icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      {/* Full-page iframe — 100% identical to aura.build */}
      <iframe
        src={iframeSrc}
        title="Learn"
        className="learn-iframe"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        loading="eager"
      />
    </div>
  );
}
