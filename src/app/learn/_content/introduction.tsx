import type { ReactNode } from "react";
import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocEyebrow, DocP, DocNote,
  DocUL, DocOL, DocLI, DocStep, DocFeatureBlock, DocProTip,
  DocCodeBlock, DocLink, DocVideo, DocEmbed, DocCardGrid, DocCardLink,
  DocButtonLink, DocDivider, DocTransitionGrid,
} from "../_components/Doc";

/* ============================================================================
   Introduction — rebuilt as native React with proper documentation layout.
   Content is preserved EXACTLY as scraped from aura.build/learn/introduction.
   Only the HTML structure is rebuilt for a professional, industry-standard
   docs layout (3-column: sidebar | article | TOC).
   ========================================================================== */

const videoCarouselItems = [
  { href: "/learn/video-tutorials#interactive-rain-hero-opus-48", eyebrow: "Interactive hero motion", title: "Fable 5 Is Gone... So I Built This Interactive Rain Hero with Opus 4.8" },
  { href: "/learn/video-tutorials#design-to-website-brutalist-landing-page", eyebrow: "Design reference workflow", title: "Design to Website in Aura: Build a Brutalist Landing Page" },
  { href: "/learn/video-tutorials#one-prompt-20000-website-claude-fable-5", eyebrow: "Cinematic prompting", title: "I Built a $20,000 Website With ONE Prompt and Claude Fable 5" },
  { href: "/learn/video-tutorials#recreate-20000-website-ai-workflow", eyebrow: "Premium website recreation", title: "I Recreated a $20K Website Using AI (Full Workflow)" },
  { href: "/learn/video-tutorials#gpt-images-grok-imagine-landing-page-workflow", eyebrow: "Image-to-video workflow", title: "GPT Images 2.0 + Grok Imagine Changed My Landing Page Workflow" },
  { href: "/learn/video-tutorials#claude-opus-48-vs-gpt-55-landing-pages", eyebrow: "AI model comparison", title: "Claude Opus 4.8 vs GPT-5.5: Which AI Builds Better Landing Pages?" },
  { href: "/learn/video-tutorials#gpt-image-2-gpt-55-landing-page", eyebrow: "Image-first workflow", title: "I Asked GPT Image 2.0 to Imagine a Landing Page, Then GPT-5.5 Built It" },
  { href: "/learn/video-tutorials#animated-webgl-gemini-design-md", eyebrow: "WebGL landing pages", title: "Building Animated WebGL Landing Pages with Gemini 3.1 Pro + design.md" },
  { href: "/learn/video-tutorials#complex-animations-chatgpt-design-md", eyebrow: "Animation workflow", title: "How I Recreate Complex Animations with ChatGPT + Design.md" },
  { href: "/learn/video-tutorials#design-md-file-ai-design-better", eyebrow: "DESIGN.md refinement", title: "Why This DESIGN.md File Made My AI Design Look So Much Better" },
  { href: "/learn/video-tutorials#gemini-3-pro-level-landing-page", eyebrow: "Pro landing pages", title: "Gemini 3 is now a pro-level landing page creator" },
  { href: "/learn/video-tutorials#better-landing-pages-gpt-55-design-md", eyebrow: "Landing-page quality", title: "Building Better Landing Pages with GPT 5.5 + design.md" },
  { href: "/learn/video-tutorials#design-md-ai-web-design-workflow", eyebrow: "Workflow systems", title: "DESIGN.md Changed My AI Web Design Workflow" },
];

const transitions = [
  { name: "Fade", description: "Gentle crossfade" },
  { name: "Slide", description: "Horizontal motion" },
  { name: "Scale", description: "Zoom in/out" },
  { name: "Blur", description: "Defocus effect" },
  { name: "Push", description: "Slide & displace" },
  { name: "Wipe", description: "Reveal animation" },
  { name: "Instant", description: "No transition" },
];

const tocItems = [
  { id: "overview", label: "Overview", level: 2 },
  { id: "template-made-in-aura", label: "Template made in Aura", level: 2 },
  { id: "key-features", label: "Key Features", level: 2 },
  { id: "code-references", label: "Code References with @", level: 2 },
  { id: "image-generation-assets", label: "Image Generation & Assets", level: 2 },
  { id: "advanced-design-mode-editor", label: "Advanced Design Mode Editor", level: 2 },
  { id: "multi-page-sites-publishing", label: "Multi-Page Sites & Publishing", level: 2 },
  { id: "figma-integration", label: "Figma Integration", level: 2 },
  { id: "exported-from-aura", label: "Exported From Aura", level: 2 },
  { id: "why-aura", label: "Why Aura?", level: 2 },
  { id: "effective-prompting", label: "Effective Prompting", level: 2 },
  { id: "template-auragen", label: "Template made in Aura", level: 2 },
  { id: "getting-started", label: "Getting Started", level: 2 },
];

const HTML = ""; // unused — kept for backward compat, body() overrides

export const introductionContent: LearnPageContent = {
  slug: "introduction",
  title: "Introduction",
  description: "Welcome to Aura — what it is, who it's for, and how to get started.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      {/* ===== Hero ===== */}
      <header className="docs-header">
        <DocH1>Introduction</DocH1>
        <DocLead>
          Welcome to Aura, the AI-powered design assistant that helps you create beautiful designs with ease. This documentation will help you get started with Aura and make the most of its features.
        </DocLead>
      </header>

      {/* ===== Featured video ===== */}
      <DocVideo
        src="https://www.youtube.com/embed/M4DNgmI7MIM?autoplay=1&controls=0&enablejsapi=1&fs=1&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0"
        title="How to Avoid AI Slop in Vibe-Coded Landing Pages"
      />

      {/* ===== Video carousel ===== */}
      <section className="docs-video-carousel">
        <div className="docs-video-carousel-header">
          <DocEyebrow>Video tutorials</DocEyebrow>
          <DocLink href="/learn/video-tutorials">View all videos →</DocLink>
        </div>
        <div className="docs-video-carousel-track">
          {videoCarouselItems.map((v) => (
            <a key={v.href} href={v.href} className="docs-video-card">
              <span className="docs-video-card-eyebrow">{v.eyebrow}</span>
              <span className="docs-video-card-title">{v.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ===== Overview ===== */}
      <DocH2 id="overview">Overview</DocH2>
      <DocP>
        Aura combines the power of AI with intuitive design tools to help you create stunning, responsive websites faster than ever. Build complete multi-page sites with advanced editing capabilities, reference templates with @, and publish with friendly subdomains. Whether you're a professional designer or just getting started, Aura has features that will help you work more efficiently.
      </DocP>
      <DocEyebrow>Getting the most from Aura</DocEyebrow>
      <DocP muted>
        Reference templates and components with @ to add up to 100,000 characters of context (~2,000 lines of code). Access 20,000+ curated assets including images, backgrounds, and stock photos. Use code snippets for border gradients, animations, and effects. Work with prompt-targeted edits to change only specific parts without regenerating entire pages.
      </DocP>

      <DocH3 id="who-is-aura-for">Who is Aura for?</DocH3>
      <DocUL>
        <DocLI>UI/UX designers looking to speed up their workflow</DocLI>
        <DocLI>Developers who need to translate designs to code</DocLI>
        <DocLI>Non-designers who need professional-quality visuals based on templates and prompts</DocLI>
      </DocUL>

      <DocH3 id="what-youll-need">What you'll need</DocH3>
      <DocUL>
        <DocLI>An Aura account (free or premium)</DocLI>
        <DocLI>Modern web browser (Chrome, Firefox, Safari, Edge)</DocLI>
        <DocLI>Basic understanding of design principles (helpful but not required)</DocLI>
        <DocLI>Figma account (for integration features but not required)</DocLI>
      </DocUL>

      {/* ===== Template made in Aura (portfolio showcase) ===== */}
      <DocH2 id="template-made-in-aura">Template made in Aura</DocH2>
      <DocEmbed src="/s/portfolio-showcase?embed=true" title="Aura Demo" aspect="16/9" />

      {/* ===== Key Features ===== */}
      <DocH2 id="key-features">Key Features</DocH2>
      <DocFeatureBlock title="Advanced AI Models">
        Access to premium AI models including Claude Sonnet 4.5, GPT-5 and Gemini 2.5 Pro for superior design generation with thinking texts for clearer code reasoning, 4× larger output tokens for full landing pages in one shot, and instant image-to-HTML conversion.
      </DocFeatureBlock>
      <DocFeatureBlock title="Multi-Page Sites & Publishing">
        Create multiple pages with element-to-page Links for navigation, add page transitions (fade, slide, scale, blur, push, wipe), publish to friendly subdomains with version updates, export full sites as HTML files, and export to Figma with organized layers intact.
      </DocFeatureBlock>
      <DocFeatureBlock title="Templates & Components">
        Access 1000+ premium templates and 1400+ reusable components to jumpstart projects. Browse and remix full templates with all pages, replace elements instantly, create custom components, and share publicly with your team for faster collaboration.
      </DocFeatureBlock>
      <DocFeatureBlock title="Code References with @">
        Reference templates, components, and code snippets using @ to add up to 100,000 characters of context (~2,000 lines of code) in a single prompt. Include multiple elements with Shift-click, reference previous chat iterations, and apply preset animations and effects instantly.
      </DocFeatureBlock>
      <DocFeatureBlock title="Image Generation & Assets">
        Generate up to 4 image variations with Ideogram, Nano Banana, and Flux 2 Pro. Upload multiple images up to 10MB, access 20,000+ curated assets, remix visuals in Design Mode, instant image-to-HTML powered by GPT-5, and manage with improved attachment previews.
      </DocFeatureBlock>
      <DocFeatureBlock title="Advanced Design Mode">
        Full-featured visual editor with Layers panel, Auto Breakpoints, measurement overlays for spacing, Command+Click interactive testing, 1400+ replaceable components, drag-and-drop editing, code snippets for animations and effects, and works on mobile devices for on-the-go design.
      </DocFeatureBlock>

      {/* ===== Code References with @ ===== */}
      <DocH2 id="code-references">Code References with @</DocH2>
      <DocFeatureBlock title="The Power of Context">
        Transform your workflow by referencing templates, components, and code snippets directly in your prompts. The @ symbol unlocks up to 100,000 characters of context—roughly 2,000 lines of code—giving AI the exact ingredients it needs to create precisely what you envision. This is the single biggest productivity multiplier in Aura.
      </DocFeatureBlock>
      <DocUL>
        <DocLI title="Full templates">Reference entire landing pages (~31,000 characters) with all sections, styles, and scripts</DocLI>
        <DocLI title="Components">Individual elements like hero sections, navigation bars, cards, buttons, and forms</DocLI>
        <DocLI title="Code snippets">Preset animations, border gradients, progressive blur, alpha masks, and effects</DocLI>
        <DocLI title="Previous iterations">Reference earlier versions from your chat history to build upon</DocLI>
        <DocLI title="Multiple elements">Shift-click to select and reference multiple components at once</DocLI>
      </DocUL>

      <DocP muted>Instead of prompting:</DocP>
      <DocCodeBlock>Create a beautiful landing page for my SaaS</DocCodeBlock>

      <DocP muted>You can reference specific designs:</DocP>
      <DocCodeBlock>Create a landing page inspired by @auragen and @brutalist-showcase</DocCodeBlock>

      <DocNote>
        This gives AI exact design patterns, maintaining consistency and professional quality across your entire project.
      </DocNote>

      <DocProTip label="Pro Tip">
        Start with a base template, then reference specific components to customize it. This approach creates professional designs in minutes that would normally take hours to build from scratch.
      </DocProTip>

      {/* ===== Image Generation & Assets ===== */}
      <DocH2 id="image-generation-assets">Image Generation & Assets</DocH2>
      <DocFeatureBlock title="Complete Visual Asset Management">
        Say goodbye to placeholder images and generic stock photos. Aura integrates powerful AI image generation tools, provides access to a curated library of 20,000+ high-quality assets, and lets you upload your own branded visuals up to 10MB each. Every image need is covered.
      </DocFeatureBlock>

      <DocP muted>Generate up to 4 variations simultaneously using multiple AI models:</DocP>
      <DocUL>
        <DocLI title="Ideogram">Best for logos and typography</DocLI>
        <DocLI title="Nano Banana">Fast, cost-effective generations</DocLI>
        <DocLI title="Flux 2 Pro">High-quality detailed images</DocLI>
      </DocUL>
      <DocNote>Perfect for custom logos, icons, illustrations, and branded graphics that match your design language.</DocNote>

      <DocP muted>Browse our ever-growing curated library featuring:</DocP>
      <DocUL>
        <DocLI>High-resolution images (various sizes)</DocLI>
        <DocLI>Advanced search with keywords</DocLI>
        <DocLI>Resolution filters for optimization</DocLI>
        <DocLI>Backgrounds, textures, and patterns</DocLI>
        <DocLI>Professional photography</DocLI>
      </DocUL>
      <DocNote>Find the perfect visual for any design concept without leaving Aura.</DocNote>

      <DocP muted>Bring your own assets and leverage instant conversion:</DocP>
      <DocUL>
        <DocLI>Upload multiple images (up to 10MB each)</DocLI>
        <DocLI>Support for transparency (PNG)</DocLI>
        <DocLI>Image-to-HTML powered by GPT-5</DocLI>
        <DocLI>Instant mockup conversion</DocLI>
        <DocLI>Background removal built-in</DocLI>
      </DocUL>
      <DocNote>Attach any design mockup and get working HTML/Tailwind code in seconds.</DocNote>

      <DocFeatureBlock title="Remix & Edit Images">
        Generate variations of existing images right in Design Mode and the Assets panel. Remix uploaded images, library assets, or generated graphics to create the perfect visual without switching tools.
      </DocFeatureBlock>

      {/* ===== Advanced Design Mode Editor ===== */}
      <DocH2 id="advanced-design-mode-editor">Advanced Design Mode Editor</DocH2>
      <DocFeatureBlock title="Professional Visual Editor">
        A full-featured visual editor that rivals professional design tools like Figma and Webflow. Edit layouts, adjust spacing with visual overlays, modify styles with intuitive controls, and manage complex layer hierarchies—all with an interface that works seamlessly on desktop and mobile.
      </DocFeatureBlock>

      <DocFeatureBlock title="Layers Panel">
        View your complete HTML structure with collapsible sections. Filter by element types, class names, or Tailwind utilities. Manage script and style elements directly in the panel.
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Search and filter layers</DocLI>
        <DocLI>Drag to reorder elements</DocLI>
        <DocLI>Show/hide/lock layers</DocLI>
        <DocLI>Quick parent/sibling/child selection</DocLI>
      </DocUL>

      <DocFeatureBlock title="Auto Breakpoints">
        Edit responsive designs contextually. Aura automatically detects which Tailwind breakpoint you're viewing (sm:, md:, lg:, xl:, 2xl:) and applies classes to that specific breakpoint.
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Automatic breakpoint detection</DocLI>
        <DocLI>Preview all screen sizes instantly</DocLI>
        <DocLI>Edit in context</DocLI>
      </DocUL>

      <DocFeatureBlock title="Measurement Overlays">
        Visual feedback for spacing and positioning. See margin, padding, gap, and absolute positioning measurements overlaid on selected elements. Click any measurement to edit it directly.
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Visual spacing guides</DocLI>
        <DocLI>Click-to-edit measurements</DocLI>
        <DocLI>Smart positioning controls</DocLI>
      </DocUL>

      <DocFeatureBlock title="1400+ Component Library">
        Replace any element with pre-built, production-ready components. Browse by category (buttons, cards, forms, hero sections, etc.) with contextual search that surfaces relevant components based on what you're editing.
      </DocFeatureBlock>
      <DocUL>
        <DocLI>One-click element replacement</DocLI>
        <DocLI>Create custom components</DocLI>
        <DocLI>Share publicly with team</DocLI>
      </DocUL>

      <DocFeatureBlock title="Interactive Testing">
        Test interactive elements without switching modes. Hold Command (Mac) or Ctrl (Windows) and click buttons, menus, modals, and toggles to verify functionality while staying in Design Mode.
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Test buttons and links</DocLI>
        <DocLI>Preview animations</DocLI>
        <DocLI>Check hover states</DocLI>
      </DocUL>

      <DocFeatureBlock title="Code Snippets">
        Apply advanced effects instantly without writing code. Save your own snippets for reuse across projects. Access presets for common patterns like border gradients, progressive blur, gradient alpha masks, and complex animations.
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Border gradients</DocLI>
        <DocLI>Keyframe animations</DocLI>
        <DocLI>Alpha/blur masks</DocLI>
      </DocUL>

      <DocFeatureBlock title="Works on Mobile Devices">
        Design Mode adapts to smaller screens with touch-optimized controls. Edit designs on the go with your phone or tablet—perfect for making quick tweaks or previewing mobile layouts in their native environment.
      </DocFeatureBlock>

      {/* ===== Multi-Page Sites & Publishing ===== */}
      <DocH2 id="multi-page-sites-publishing">Multi-Page Sites & Publishing</DocH2>
      <DocFeatureBlock title="From Single Pages to Complete Websites">
        Build complete, production-ready websites with multiple pages, navigation systems, and smooth transitions between routes. Publish to friendly subdomains that update seamlessly with each iteration, export full sites as HTML for self-hosting, or send your designs to Figma for further refinement.
      </DocFeatureBlock>

      <DocFeatureBlock title="Multi-Page Architecture">
        Create as many pages as you need for your project:
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Create pages from scratch or duplicate existing ones</DocLI>
        <DocLI>Convert pages to standalone projects</DocLI>
        <DocLI>Manage page order and organization</DocLI>
        <DocLI>Share common components across all pages</DocLI>
        <DocLI>Maintain consistent fonts, colors, and styles site-wide</DocLI>
      </DocUL>
      <DocNote>Build complete sites: homepage, features page, about, pricing, contact, blog—whatever structure you need.</DocNote>

      <DocFeatureBlock title="Element-to-Page Links">
        Turn any element into a navigation link:
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Click any element and set its Link target</DocLI>
        <DocLI>Works with buttons, images, text, cards—anything</DocLI>
        <DocLI>Navigate between pages on click</DocLI>
        <DocLI>Build complex navigation menus</DocLI>
        <DocLI>Create interactive prototypes with real navigation</DocLI>
      </DocUL>
      <DocNote>No coding required—just select an element, choose a destination page, and you're done.</DocNote>

      <DocOL>
        <DocStep num={1}>Open the Pages menu and create the new page you want to add to the site.</DocStep>
        <DocStep num={2}>Prompt that page separately so it becomes the design or layout you want.</DocStep>
        <DocStep num={3}>Return to the page with your button, icon, or menu item and open Design Mode.</DocStep>
        <DocStep num={4}>Select the element you want to make clickable, then set its Link target in the Edit Popover.</DocStep>
        <DocStep num={5}>Preview the navigation, then publish or export the full site when the pages are connected the way you want.</DocStep>
      </DocOL>

      <DocP muted>Add polished motion to navigation with smooth, professional transitions that convey hierarchy and flow:</DocP>
      <DocTransitionGrid items={transitions} />

      <DocFeatureBlock title="Publish Online">
        Share your work instantly:
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Friendly .or.build subdomains</DocLI>
        <DocLI>Version updates (same URL)</DocLI>
        <DocLI>No redeployment needed</DocLI>
        <DocLI>Share links immediately</DocLI>
        <DocLI>Perfect for client presentations</DocLI>
      </DocUL>

      <DocFeatureBlock title="Export HTML">
        Download complete sites:
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Full HTML/CSS/JS files</DocLI>
        <DocLI>All pages in one package</DocLI>
        <DocLI>Host on Netlify, Vercel, etc.</DocLI>
        <DocLI>Continue in code editors</DocLI>
        <DocLI>No vendor lock-in</DocLI>
      </DocUL>

      <DocFeatureBlock title="Export to Figma">
        Send designs to Figma:
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Organized layer structure</DocLI>
        <DocLI>Icons, texts, styles preserved</DocLI>
        <DocLI>Continue design in Figma</DocLI>
        <DocLI>Browser console method</DocLI>
        <DocLI>Seamless roundtrip workflow</DocLI>
      </DocUL>

      <DocFeatureBlock title="Real Code, Real Websites">
        Everything in Aura is pure HTML, Tailwind CSS, and vanilla JavaScript. No proprietary frameworks, no custom runtime—just standard web technologies that work everywhere. Export and continue development in v0, Lovable, Cursor, or any code editor.
      </DocFeatureBlock>

      {/* ===== Figma Integration ===== */}
      <DocH2 id="figma-integration">Figma Integration</DocH2>
      <DocP>
        Aura offers seamless integration with Figma through two powerful methods that allow you to import designs from Figma and export your Aura creations back to Figma.
      </DocP>

      <DocH3 id="import-from-figma">Import from Figma</DocH3>
      <DocOL>
        <DocStep num={1} title="Open your design in Figma">
          Navigate to the frame or component you want to import into Aura.
        </DocStep>
        <DocStep num={2} title='Select the element and use "Copy link to selection"'>
          Right-click on your selection and choose "Copy link to selection" or use the share button and copy the link to the specific selection.
        </DocStep>
        <DocStep num={3} title="Paste the URL in Aura">
          In Aura, use the "Import from Figma" option and paste the copied URL to import your design elements.
        </DocStep>
        <DocStep num={4} title="Confirm that you have the correct design">
          Aura will process your Figma design and show you a preview. If you see your entire page, make sure to right-click and copy the link to a specific selection rather than the whole page.
        </DocStep>
      </DocOL>

      <DocH3 id="export-to-figma">Export to Figma</DocH3>
      <DocOL>
        <DocStep num={1} title="Select your design in Aura">
          Choose the element or frame you want to export to Figma.
        </DocStep>
        <DocStep num={2} title='Use "Copy Console Code" feature'>
          In Aura's export menu, select "Export to Figma" and click "Copy Console Code".
        </DocStep>
        <DocStep num={3} title="Open Figma and access the Console">
          In Figma, open the document where you want to place the design. Open the browser's developer console (Command /, search for "Developer"), and prepare to paste the code.
        </DocStep>
        <DocStep num={4} title="Paste and execute the code">
          Paste the copied code into the console and press Enter. The code will create your Aura design in Figma, preserving styles and structure.
        </DocStep>
      </DocOL>

      {/* ===== Exported From Aura ===== */}
      <DocH2 id="exported-from-aura">Exported From Aura</DocH2>
      <DocP>Figma designs generated and exported from Aura:</DocP>
      <DocEmbed
        src="https://embed.figma.com/design/zcEDbckRVq79t3mLoqTOAR/Aura-UI-Kit?node-id=0-1&embed-host=share"
        title="Aura UI Kit — Figma"
        aspect="16/9"
      />
      <DocH3 id="viewing-tips">Viewing Tips</DocH3>
      <DocUL>
        <DocLI>Use the scroll wheel to zoom in and out of the design</DocLI>
        <DocLI>Hold spacebar and drag to pan around the canvas</DocLI>
        <DocLI>Click on elements to see their properties and styles</DocLI>
      </DocUL>

      {/* ===== Why Aura? ===== */}
      <DocH2 id="why-aura">Why Aura?</DocH2>
      <DocP>
        In today's fast-paced design world, efficiency is key. Aura was built to address common pain points in the design workflow:
      </DocP>
      <DocH3 id="time-efficiency">Time Efficiency</DocH3>
      <DocP muted>Reducing time spent on repetitive design tasks allows you to focus on creativity and problem-solving.</DocP>
      <DocH3 id="design-dev-collaboration">Design-Dev Collaboration</DocH3>
      <DocP muted>Bridging the gap between design and development with code generation and seamless handoffs.</DocP>
      <DocH3 id="rapid-prototyping">Rapid Prototyping</DocH3>
      <DocP muted>Enabling rapid prototyping and iteration to quickly test and refine design concepts.</DocP>
      <DocH3 id="community-sharing">Community Sharing</DocH3>
      <DocP muted>Share your designs with the community and build upon existing templates to accelerate your workflow and inspire others.</DocP>

      {/* ===== Effective Prompting ===== */}
      <DocH2 id="effective-prompting">Effective Prompting</DocH2>
      <DocP>
        Well-structured prompts are the key to getting precise, usable designs from Aura. The more specific your instructions, the better the output you'll receive.
      </DocP>
      <DocP muted>
        The key to getting the most out of Aura is crafting effective prompts. Well-structured prompts lead to better AI-generated designs and code.
      </DocP>
      <DocH3 id="prompt-structure">Prompt Structure</DocH3>
      <DocP muted>Be specific about what you want, including:</DocP>
      <DocUL>
        <DocLI>Framework preferences (Tailwind, Bootstrap, etc.)</DocLI>
        <DocLI>Component structure and layout</DocLI>
        <DocLI>Color schemes and styling details</DocLI>
        <DocLI>Responsive behavior requirements</DocLI>
        <DocLI>Interactive elements and animations</DocLI>
      </DocUL>

      <DocH3 id="examples">Examples</DocH3>
      <DocP muted>Basic prompt (less effective):</DocP>
      <DocCodeBlock>Create a contact form</DocCodeBlock>
      <DocP muted>Detailed prompt (more effective):</DocP>
      <DocCodeBlock>Generate a responsive contact form using Tailwind CSS with form validation, floating labels, and a subtle purple accent color.</DocCodeBlock>

      <DocFeatureBlock title="Sample Prompts to Try">
        Referencing existing design systems and using device framing can dramatically improve your results. Brand-inspired styling creates familiarity, while device frames help the AI understand the target context and viewport.
      </DocFeatureBlock>
      <DocCodeBlock>Generate a modern hero section for a SaaS product with Tailwind CSS. Include a headline, subheading, CTA button, and a floating mockup image on the right side. Make it fully responsive.</DocCodeBlock>
      <DocP muted>Navigation Bar</DocP>
      <DocCodeBlock>Design a sticky navigation bar with logo on left, navigation links in center, and login/signup buttons on the right. Use a clean, minimal aesthetic with smooth hover transitions.</DocCodeBlock>

      <p className="docs-p">
        <DocLink href="/learn/tips-for-prompting">View detailed prompting guide →</DocLink>
      </p>

      {/* ===== Template made in Aura (auragen) ===== */}
      <DocH2 id="template-auragen">Template made in Aura</DocH2>
      <DocEmbed src="/s/auragen?embed=true" title="Aura Demo" aspect="16/9" />

      {/* ===== Getting Started ===== */}
      <DocH2 id="getting-started">Getting Started</DocH2>
      <DocP>Ready to dive in? Aura is a web app—simply create an account and start designing:</DocP>
      <DocCardGrid cols={2}>
        <DocCardLink href="/" title="Create Account">
          Sign up for free at aura.build and start creating beautiful designs with AI assistance.
        </DocCardLink>
        <DocCardLink href="/learn/tips-for-prompting" title="Tips for Prompting">
          Learn how to craft effective prompts for HTML generation and get better results.
        </DocCardLink>
      </DocCardGrid>

      <DocP>Need more guidance? Check out our video tutorials and documentation.</DocP>
      <div className="docs-btn-row">
        <DocButtonLink href="/learn/video-tutorials" variant="secondary">Video Tutorials</DocButtonLink>
        <DocButtonLink href="/learn/documentation" variant="primary">Documentation</DocButtonLink>
      </div>
    </article>
  ),
};
