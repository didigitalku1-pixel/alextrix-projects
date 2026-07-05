import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocLI,
  DocFeatureBlock, DocStep, DocProTip, DocLink, DocNote,
} from "../_components/Doc";

/* ============================================================================
   Documentation — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/documentation.
   ========================================================================== */

const tocItems = [
  { id: "overview", label: "Overview", level: 2 },
  { id: "getting-started", label: "Getting Started", level: 2 },
  { id: "prompting-guides", label: "Prompting Guides", level: 2 },
  { id: "video-resources", label: "Video Resources", level: 2 },
  { id: "ai-workflows", label: "AI Workflows", level: 2 },
  { id: "troubleshooting", label: "Troubleshooting", level: 2 },
  { id: "faq-quick-answers", label: "FAQ Quick Answers", level: 2 },
];

const gettingStartedLinks = [
  { href: "/learn/introduction", title: "Introduction", desc: "Learn about Aura's core concepts, features, and how it can transform your design workflow." },
  { href: "/learn/installation", title: "Installation", desc: "Step-by-step installation guide for all platforms with system requirements and setup tips." },
  { href: "/learn/quick-start", title: "Quick Start", desc: "Create your first design in under 5 minutes with our guided quick start tutorial." },
];

const promptingGuides = [
  { href: "/learn/tips-for-prompting", title: "General Tips", desc: "Essential prompting techniques and best practices for all design tasks." },
  { href: "/learn/prompt-for-typography", title: "Typography", desc: "Create beautiful typography with specific prompting techniques for fonts and text layouts." },
  { href: "/learn/prompt-for-styling", title: "Styling", desc: "Master color schemes, spacing, and visual hierarchy through effective prompting." },
  { href: "/learn/prompt-for-animation", title: "Animation", desc: "Bring your designs to life with smooth animations and micro-interactions." },
  { href: "/learn/prompt-for-layout", title: "Layout", desc: "Create responsive, well-structured layouts with grid systems and flexbox." },
];

const videoResources = [
  { href: "/learn/video-tutorials", title: "Video Tutorials", desc: "Comprehensive video library covering all aspects of Aura, from basics to advanced techniques." },
  { href: "/learn/prompt-for-ui", title: "UI Prompting Video", desc: "Watch how to create beautiful UI components using effective prompting techniques." },
];

export const documentationContent: LearnPageContent = {
  slug: "documentation",
  title: "Documentation",
  description: "Complete reference for the Aura Library.",
  group: "resources",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Documentation</DocH1>
        <DocLead>
          Welcome to the comprehensive Aura documentation. This guide will help you master Aura's AI-powered design tools, from basic setup to advanced features. Whether you're a beginner or an experienced designer, you'll find everything you need to create stunning designs efficiently.
        </DocLead>
      </header>

      {/* ===== Overview ===== */}
      <DocH2 id="overview">Overview</DocH2>
      <DocP>
        Aura is an AI-powered design assistant that revolutionizes how you create digital experiences. It combines the power of artificial intelligence with intuitive design tools to help you:
      </DocP>
      <DocUL>
        <DocLI>Generate professional designs from simple text prompts</DocLI>
        <DocLI>Convert images to functional HTML/CSS code</DocLI>
        <DocLI>Seamlessly integrate with Figma workflows</DocLI>
        <DocLI>Create responsive layouts with AI assistance</DocLI>
        <DocLI>Optimize designs for performance and accessibility</DocLI>
      </DocUL>

      <DocH3>What makes Aura different?</DocH3>
      <DocP>
        Unlike traditional design tools, Aura understands context and intent. It doesn't just execute commands—it collaborates with you to bring your vision to life, suggesting improvements and handling technical details so you can focus on creativity.
      </DocP>

      {/* ===== Getting Started ===== */}
      <DocH2 id="getting-started">Getting Started</DocH2>
      <DocP>
        Get up and running with Aura in minutes. Follow our step-by-step guides to set up your workspace and start creating your first AI-generated designs.
      </DocP>
      <div className="docs-card-grid docs-card-grid-2">
        {gettingStartedLinks.map((l) => (
          <a key={l.href} href={l.href} className="docs-card">
            <span className="docs-card-title">{l.title}</span>
            <span className="docs-card-body">{l.desc}</span>
            <span className="docs-card-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      {/* ===== Prompting Guides ===== */}
      <DocH2 id="prompting-guides">Prompting Guides</DocH2>
      <DocP>
        Learn the art of effective prompting to get the best results from Aura's AI. These guides cover specific techniques for different design elements and use cases.
      </DocP>
      <div className="docs-card-grid docs-card-grid-2">
        {promptingGuides.map((l) => (
          <a key={l.href} href={l.href} className="docs-card">
            <span className="docs-card-title">{l.title}</span>
            <span className="docs-card-body">{l.desc}</span>
            <span className="docs-card-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      {/* ===== Video Resources ===== */}
      <DocH2 id="video-resources">Video Resources</DocH2>
      <DocP>
        Watch comprehensive video tutorials that demonstrate Aura's features in action. Perfect for visual learners who prefer step-by-step demonstrations.
      </DocP>
      <div className="docs-card-grid docs-card-grid-2">
        {videoResources.map((l) => (
          <a key={l.href} href={l.href} className="docs-card">
            <span className="docs-card-title">{l.title}</span>
            <span className="docs-card-body">{l.desc}</span>
            <span className="docs-card-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      {/* ===== AI Workflows ===== */}
      <DocH2 id="ai-workflows">AI Workflows (Gemini 3 + Aura)</DocH2>
      <DocP>Borrow the battle-tested workflow from "Gemini 3 Changes Everything":</DocP>

      <DocH3>1) Build an inspiration library</DocH3>
      <DocP>
        Collect high-quality references (Mobbin, Dribbble, Unicorn Studio) and note the layout, typography, and motion you want. Screenshots give Gemini 3 concrete context to adapt—not copy.
      </DocP>

      <DocH3>2) Image-to-HTML with intent</DocH3>
      <DocP>
        Feed a screenshot plus a precise brief: target brand, icon library (Solar Duotone), layout tweaks, and what must change (text, names, assets). Gemini 3 lands ~90% on the first pass.
      </DocP>

      <DocH3>3) Edit, refine, and elevate</DocH3>
      <DocP>
        In Design Mode, adjust only what needs change: swap icons, tune spacing, add border gradients, drop shadows, or keyframe/scroll animations without regenerating whole pages.
      </DocP>

      <DocH3>4) Export anywhere</DocH3>
      <DocP>
        Export HTML (pure Tailwind/JS), send to Figma for layered editing, or convert to React. Publish to Aura subdomains or host on Netlify/Vercel.
      </DocP>

      {/* ===== Troubleshooting ===== */}
      <DocH2 id="troubleshooting">Troubleshooting</DocH2>
      <DocP>Common issues and their solutions to help you get back to designing quickly.</DocP>

      <DocH3>Design generation is slow or times out</DocH3>
      <DocP>This usually happens when:</DocP>
      <DocUL>
        <DocLI>Your prompt is too complex or contains conflicting instructions</DocLI>
        <DocLI>Server load is high during peak hours</DocLI>
        <DocLI>Your internet connection is unstable</DocLI>
      </DocUL>
      <DocP muted>Solutions:</DocP>
      <DocUL>
        <DocLI>Simplify your prompt and try again</DocLI>
        <DocLI>Break complex designs into smaller parts</DocLI>
        <DocLI>Try again during off-peak hours</DocLI>
        <DocLI>Check your internet connection</DocLI>
      </DocUL>

      <DocH3>Figma integration not working</DocH3>
      <DocP>Check these common issues:</DocP>
      <DocUL>
        <DocLI>Ensure you have the latest Figma plugin installed</DocLI>
        <DocLI>Verify your Figma permissions allow plugin access</DocLI>
        <DocLI>Check if your design contains unsupported elements</DocLI>
      </DocUL>
      <DocP muted>Solutions:</DocP>
      <DocUL>
        <DocLI>Update the Figma plugin to the latest version</DocLI>
        <DocLI>Restart Figma and try again</DocLI>
        <DocLI>Contact support if the issue persists</DocLI>
      </DocUL>

      <DocH3>Image-to-HTML conversion produces poor results</DocH3>
      <DocP>This can happen when:</DocP>
      <DocUL>
        <DocLI>The source image has poor quality or unclear elements</DocLI>
        <DocLI>Complex layouts with overlapping elements</DocLI>
        <DocLI>Unusual fonts or styling that's hard to detect</DocLI>
      </DocUL>
      <DocP muted>Solutions:</DocP>
      <DocUL>
        <DocLI>Use high-quality, clear images for conversion</DocLI>
        <DocLI>Simplify complex layouts before conversion</DocLI>
        <DocLI>Manually adjust the generated code as needed</DocLI>
        <DocLI>Use the refinement tools to improve results</DocLI>
      </DocUL>

      {/* ===== FAQ Quick Answers ===== */}
      <DocH2 id="faq-quick-answers">FAQ Quick Answers</DocH2>
      <DocP>Quick reference for the most common questions. For full answers, visit the <DocLink href="/learn/faq">FAQ page</DocLink>.</DocP>

      <DocH3>Plans &amp; limits</DocH3>
      <DocUL>
        <DocLI>Pro, Max, or Ultra trial: 20 prompts over 3 days.</DocLI>
        <DocLI>Pro: 120 monthly after trial.</DocLI>
        <DocLI>Max: 240 monthly (incl. 40 bonus).</DocLI>
        <DocLI>Ultra: 560 monthly (incl. 60 bonus).</DocLI>
        <DocLI>Elite: 1,080 monthly (incl. 80 bonus).</DocLI>
        <DocLI>Upgrade/downgrade anytime; no rollover.</DocLI>
      </DocUL>

      <DocH3>Using templates</DocH3>
      <DocUL>
        <DocLI>Remix free/Pro templates directly.</DocLI>
        <DocLI>Paid templates require the author's purchase link.</DocLI>
        <DocLI>You can customize colors, fonts, layout, and code.</DocLI>
        <DocLI>Export to HTML or Figma after remixing.</DocLI>
      </DocUL>

      <DocH3>Features &amp; workflow</DocH3>
      <DocUL>
        <DocLI>Use @ to add templates/components (up to ~100k chars).</DocLI>
        <DocLI>Build multi-page sites with page links and transitions.</DocLI>
        <DocLI>Outputs real HTML/Tailwind/JS (no proprietary runtime).</DocLI>
        <DocLI>Export full sites, publish to subdomains, or continue in code.</DocLI>
      </DocUL>

      <DocH3>Hosting &amp; forms</DocH3>
      <DocUL>
        <DocLI>Host exported HTML on Netlify or Vercel; add your domain.</DocLI>
        <DocLI>Forms are empty by default—connect Netlify Forms, Formspree, Getform, or Google Forms.</DocLI>
        <DocLI>For domains: deploy, then follow the host's DNS steps.</DocLI>
      </DocUL>
    </article>
  ),
};
