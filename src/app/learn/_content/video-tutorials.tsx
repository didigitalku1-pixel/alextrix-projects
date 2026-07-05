import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocP, DocLink,
} from "../_components/Doc";

/* ============================================================================
   Video Tutorials — rebuilt as native React video gallery.
   Content preserved EXACTLY as scraped from aura.build/learn/video-tutorials.
   16 lessons with full descriptions + 8 additional sidebar entries as
   "Coming soon" placeholder cards.

   Sidebar videoHash → anchor ID mapping:
   - interactive-rain-hero      → interactive-rain-hero-opus-48
   - brutalist-landing-page     → design-to-website-brutalist-landing-page
   - 20k-website-prompt         → one-prompt-20000-website-claude-fable-5
   - 20k-ai-workflow            → recreate-20000-website-ai-workflow
   - gpt-images-grok            → gpt-images-grok-imagine-landing-page-workflow
   - avoid-ai-slop              → avoid-ai-slop-vibe-coded-landing-pages
   - claude-vs-gpt              → claude-opus-48-vs-gpt-55-landing-pages
   - ai-landing-pages-media     → ai-landing-pages-images-videos
   - gpt-image-to-landing       → gpt-image-2-gpt-55-landing-page
   - design-md-workflow         → (no content — placeholder)
   - gpt-55-design-md           → better-landing-pages-gpt-55-design-md
   - complex-animations         → complex-animations-chatgpt-design-md
   - design-md-better-design    → design-md-file-ai-design-better
   - animated-webgl-pages       → animated-webgl-gemini-design-md
   - gemini-3-landing-pages     → gemini-3-pro-level-landing-page
   - gemini-3-animations        → (no content — placeholder)
   - gemini-3-changes           → gemini-3-changes-web-design
   - gpt-51-uis                 → (no content — placeholder)
   - aura-compose-workflow      → (no content — placeholder)
   - pro-level-designs          → (no content — placeholder)
   - master-customizations      → (no content — placeholder)
   - image-to-html              → (no content — placeholder)
   - improve-ai-designs         → (no content — placeholder)
   - how-to-prompt-ui           → (no content — placeholder)
   ========================================================================== */

interface Lesson {
  num: string;
  title: string;
  category: string;
  videoId: string;
  desc1: string;
  desc2: string;
  /** Sidebar hash anchor — must match SIDEBAR videoHash */
  hash: string;
}

const lessons: Lesson[] = [
  {
    num: "01",
    title: "Fable 5 Is Gone... So I Built This Interactive Rain Hero with Opus 4.8",
    category: "Interactive hero motion",
    videoId: "p1e-gofinDc",
    hash: "interactive-rain-hero",
    desc1: "A focused motion-design lesson for turning a basic Aura landing page into a more cinematic hero section. The walkthrough starts with a simple AI-generated page, then narrows the job to the hero so the animation, dashboard visual, and atmosphere can be refined without rebuilding everything else.",
    desc2: "The useful takeaway is that the model matters less than the creative direction. Opus 4.8 is used to add interactive rain, water bounce, smooth distortion, and CTA/footer atmosphere, but the quality comes from naming the motion clearly and iterating on the weak AI details.",
  },
  {
    num: "02",
    title: "Design to Website in Aura: Build a Brutalist Landing Page",
    category: "Design reference workflow",
    videoId: "jID-rK3D-Yc",
    hash: "brutalist-landing-page",
    desc1: "A design-to-website workflow for building a brutalist landing page in Aura from an existing visual reference. The lesson walks through different ways to start, then uses an image attachment, Prompt Builder instructions, animation skills, and Aura Asset Image to create the first draft.",
    desc2: "The workflow is intentionally iterative rather than one-shot. After the first draft, the page is refined through copy edits, animation fixes, manual adjustments, missing sections, image updates, and navigation links so the result becomes a working landing page instead of a static export.",
  },
  {
    num: "03",
    title: "I Built a $20,000 Website With ONE Prompt and Claude Fable 5",
    category: "Cinematic prompting",
    videoId: "CYzs7NlevHI",
    hash: "20k-website-prompt",
    desc1: "A cinematic website prompting lesson built around the idea that expensive-feeling pages are made from recognizable ingredients. The video breaks down smooth weighted scrolling, scroll-triggered GSAP-style animation, and real Three.js-style 3D in the browser.",
    desc2: "The lesson compares basic prompts against detailed prompts, then applies four complete directions across different landing-page concepts. The point is not that one prompt magically solves design; it is that precise vocabulary helps the AI understand the experience you want.",
  },
  {
    num: "04",
    title: "I Recreated a $20K Website Using AI (Full Workflow)",
    category: "Premium website recreation",
    videoId: "YFd3Vdyb7Mo",
    hash: "20k-ai-workflow",
    desc1: "A full AI-assisted web-design workflow for studying a high-end website and turning the inspiration into an original Aura page. The lesson starts by importing a URL into DESIGN.md, extracting structure and visual direction, then choosing the right model for the job.",
    desc2: "From there, the workflow rebuilds the hero from a screenshot-derived prompt, fixes global style issues, adds an interactive background, recreates premium sections, and polishes the final result. The emphasis is learning from the reference without blindly copying it.",
  },
  {
    num: "05",
    title: "GPT Images 2.0 + Grok Imagine Changed My Landing Page Workflow",
    category: "Image-to-video workflow",
    videoId: "BC5gl7ErntY",
    hash: "gpt-images-grok",
    desc1: "A media workflow for making AI landing pages feel more alive. The lesson starts from a visual reference, recreates the page structure, generates better images inside the page, and then turns one of those images into a short motion clip with Grok Imagine.",
    desc2: "The key idea is to treat images and video as part of the same landing-page system. GPT Images 2.0 improves the section media, while Grok Imagine tests motion ideas that can make hero sections and page visuals feel more cinematic.",
  },
  {
    num: "06",
    title: "How to Avoid AI Slop in Vibe-Coded Landing Pages",
    category: "AI design quality",
    videoId: "M4DNgmI7MIM",
    hash: "avoid-ai-slop",
    desc1: "A practical design-quality workflow for avoiding generic AI-generated landing pages. The lesson breaks down the visual tells that make pages feel like AI slop, including lazy selected states, oversized eyebrow labels, random status pills, glow lights, weak pricing sections, default Tailwind palettes, and templated hero layouts.",
    desc2: "The fix is a repeatable loop: stop prompting from zero, use screenshots and reference URLs, add AGENTS.md and DESIGN.md guidance, generate contextual media, apply skills, critique specific UI mistakes, and turn the strongest result into reusable design rules.",
  },
  {
    num: "07",
    title: "Claude Opus 4.8 vs GPT-5.5: Which AI Builds Better Landing Pages?",
    category: "AI model comparison",
    videoId: "nT4USUu_PGM",
    hash: "claude-vs-gpt",
    desc1: "A model comparison for AI landing-page design that starts from the same GPT Image 2.0 visual references. The lesson exports an Aura HTML build and supporting images into a local project, then uses Claude Code and Claude Opus 4.8 to recreate and refine the page section by section.",
    desc2: "The useful distinction is not only which model can produce a page. The video compares workflow speed, file control, layout accuracy, image replacement, spacing, depth, button treatment, typography, and the final premium polish that decides whether an AI landing page feels finished.",
  },
  {
    num: "08",
    title: "How to Build AI Landing Pages With Images and Videos",
    category: "AI landing-page media",
    videoId: "T1WTGQesbrE",
    hash: "ai-landing-pages-media",
    desc1: "A media-first Aura workflow for moving beyond generic AI landing pages. The lesson starts with a DESIGN.md design system, plans the sections and interactions, generates multiple directions, and uses screenshot references to make each visual feel specific to the product.",
    desc2: "From there, the workflow batch-generates contextual section images, turns selected images into short videos, and polishes playback behavior so the final page feels designed rather than assembled from stock-style placeholders.",
  },
  {
    num: "09",
    title: "I Asked GPT Image 2.0 to Imagine a Landing Page, Then GPT-5.5 Built It",
    category: "Image-first workflow",
    videoId: "8eSkewmgi84",
    hash: "gpt-image-to-landing",
    desc1: "A full image-first landing-page workflow that starts by asking GPT Image 2.0 to imagine a premium AI interior design website section by section. Instead of asking code generation to invent the entire page from a blank prompt, the lesson creates visual references for the hero, philosophy, services, and gallery first.",
    desc2: "From there, the walkthrough uses GPT-5.5 to recreate and refine each section in HTML. The useful lesson is the loop: generate a strong visual direction, translate it into code, then use human judgment to improve spacing, typography, image treatment, cards, interactions, pricing, and the final polish.",
  },
  {
    num: "10",
    title: "Building Animated WebGL Landing Pages with Gemini 3.1 Pro + design.md",
    category: "WebGL landing pages",
    videoId: "tiwh7Ef9dsU",
    hash: "animated-webgl-pages",
    desc1: "A full walkthrough for turning visual references into an animated WebGL landing page workflow inside Aura. The lesson starts with inspiration gathering and image variation, then moves into Gemini prompts, DESIGN.md, WebGL motion, Matter.js physics, and final page assembly.",
    desc2: "Use it when you want a landing page to feel designed and interactive instead of static. The focus is prompt structure, reference handling, remixing without copying, and tightening the strongest generated direction.",
  },
  {
    num: "11",
    title: "How I Recreate Complex Animations with ChatGPT + Design.md",
    category: "Animation workflow",
    videoId: "lT7_fTkB-do",
    hash: "complex-animations",
    desc1: "A practical process for recreating complex web motion from a video reference. The workflow shows how to observe timing, direction, easing, glow, depth, rotation, and physics, then translate those details into prompts that Aura can use.",
    desc2: "The lesson is especially useful for animated hero backgrounds, looped visual effects, and UI motion that is difficult to describe from a still screenshot alone.",
  },
  {
    num: "12",
    title: "Why This DESIGN.md File Made My AI Design Look So Much Better",
    category: "DESIGN.md refinement",
    videoId: "jLiox47HkMI",
    hash: "design-md-better-design",
    desc1: "A workflow for improving AI-generated UI by giving Aura a DESIGN.md file before refining a landing page. The lesson compares a plain detailed prompt, a simple skeuomorphic style instruction, and a stronger DESIGN.md reference so the difference in visual identity is easy to see.",
    desc2: "After the first pass, the video focuses on the real refinement loop: improving navigation, replacing generic sections, adapting Aura components with ChatGPT, and carrying the same visual DNA through pricing, FAQ, CTA, footer, and motion polish.",
  },
  {
    num: "13",
    title: "Gemini 3 is now a pro-level landing page creator",
    category: "Pro landing pages",
    videoId: "HO2a_BTx12k",
    hash: "gemini-3-landing-pages",
    desc1: "A longer blueprint for using Gemini 3 and Aura to build polished, animated landing pages from a blank canvas. It covers market positioning, inspiration research, custom 3D assets, icon systems, typography, animation prompts, bento sections, editing, and responsive refinement.",
    desc2: "Watch this when you want the full production workflow: from collecting references and writing the first hero prompt to polishing mobile views and turning the outcome into social assets or template-quality pages.",
  },
  {
    num: "14",
    title: "Building Better Landing Pages with GPT 5.5 + design.md",
    category: "Landing-page quality",
    videoId: "Jw7B8EtYMX8",
    hash: "gpt-55-design-md",
    desc1: "A section-by-section landing page workflow that starts with a screenshot, creates a new visual direction with ChatGPT Images, then rebuilds the page in Aura with GPT-5.5. The emphasis is controlled iteration instead of asking AI for a whole page at once.",
    desc2: "It shows how to use Generate and Edit modes, maintain visual consistency across sections, refine the full page, and extract a reusable DESIGN.md file when the direction works.",
  },
  {
    num: "15",
    title: "DESIGN.md Changed My AI Web Design Workflow",
    category: "Workflow systems",
    videoId: "wRTu2dWpG4A",
    hash: "design-md-workflow",
    desc1: "A deep dive into using DESIGN.md as the source of visual DNA for AI-generated sites. The lesson explains how typography, color, spacing, radius, layout rhythm, and overall direction can be captured once and reused across prompts.",
    desc2: "It also covers importing live site references, generating a base design with GPT-5.5, transforming a clone into an original Aura page, replacing assets, improving sections with references, and using skills and components to keep the page coherent.",
  },
  {
    num: "16",
    title: "Gemini 3 changes everything for web design",
    category: "AI web design",
    videoId: "b-kTkak2FKs",
    hash: "gemini-3-changes",
    desc1: "A broad Gemini 3 workflow for moving beyond generic AI web design. The lesson combines inspiration gathering, reference-driven prompting, image-to-HTML, precise editing, style mixing, animation snippets, advanced backgrounds, and final polish.",
    desc2: "Use this as the end-to-end tour for remixing templates into production-ready pages: it covers what to prompt, how to steer the model with visual references, where to edit manually, and how to add the finishing effects AI often misses.",
  },
];

/** Placeholder entries for sidebar items without scraped content */
const placeholderEntries = [
  { num: "17", title: "Gemini 3 Animations", hash: "gemini-3-animations", category: "Animation techniques" },
  { num: "18", title: "Using GPT 5.1 for Creating UIs", hash: "gpt-51-uis", category: "UI generation" },
  { num: "19", title: "Aura Compose Workflow", hash: "aura-compose-workflow", category: "Compose workflow" },
  { num: "20", title: "Turn AI Designs to Pro-level", hash: "pro-level-designs", category: "Design quality" },
  { num: "21", title: "Master Customizations", hash: "master-customizations", category: "Customization" },
  { num: "22", title: "Image to HTML with AI", hash: "image-to-html", category: "Image conversion" },
  { num: "23", title: "Improve your AI Designs", hash: "improve-ai-designs", category: "Design refinement" },
  { num: "24", title: "How to Prompt for UI", hash: "how-to-prompt-ui", category: "Prompting" },
];

export const videoTutorialsContent: LearnPageContent = {
  slug: "video-tutorials",
  title: "Video Tutorials",
  description: "Video walkthroughs of AI-assisted design workflows.",
  group: "resources",
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Video Tutorials</DocH1>
        <DocLead>
          Watch long-form Aura workflows without the usual player chrome. The page keeps the current lesson playing as you scroll, pauses the rest, and lets you enable sound only when you want it.
        </DocLead>
      </header>

      <DocP>
        24 video lessons covering interactive hero motion, design references, cinematic prompting, AI model comparisons, image-first workflows, WebGL, animations, DESIGN.md workflows, and pro-level landing page creation. Click any lesson to watch on YouTube.
      </DocP>

      {/* === Full lessons (01-16) === */}
      <DocH2 id="lessons">Lessons</DocH2>

      <div className="docs-lessons-list">
        {lessons.map((lesson) => (
          <article key={lesson.num} className="docs-lesson" id={lesson.hash}>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
              className="docs-lesson-thumb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch lesson ${lesson.num}: ${lesson.title}`}
            >
              <img
                src={`https://i.ytimg.com/vi/${lesson.videoId}/maxresdefault.jpg`}
                alt={lesson.title}
                loading="lazy"
              />
              <span className="docs-lesson-play" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="docs-lesson-num">Lesson {lesson.num}</span>
            </a>
            <div className="docs-lesson-body">
              <span className="docs-lesson-eyebrow">Lesson {lesson.num} · {lesson.category}</span>
              <h3 className="docs-lesson-title">{lesson.title}</h3>
              <p className="docs-lesson-desc">{lesson.desc1}</p>
              <p className="docs-lesson-desc">{lesson.desc2}</p>
              <a
                href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
                className="docs-lesson-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on YouTube →
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* === Placeholder entries (17-24) — sidebar items without scraped content === */}
      <DocH2 id="more-lessons">More Lessons</DocH2>
      <DocP muted>
        These additional lessons are listed in the sidebar navigation. Content will be added as it becomes available.
      </DocP>

      <div className="docs-lesson-placeholder-grid">
        {placeholderEntries.map((p) => (
          <div key={p.hash} className="docs-lesson-placeholder" id={p.hash}>
            <span className="docs-lesson-placeholder-num">Lesson {p.num}</span>
            <span className="docs-lesson-placeholder-title">{p.title}</span>
            <span className="docs-lesson-placeholder-cat">{p.category}</span>
            <span className="docs-lesson-placeholder-badge">Coming soon</span>
          </div>
        ))}
      </div>
    </article>
  ),
};
