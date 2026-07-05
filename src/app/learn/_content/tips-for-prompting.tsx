import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocOL, DocLI,
  DocFeatureBlock, DocStep, DocProTip, DocCodeBlock, DocLink, DocNote,
} from "../_components/Doc";

/* ============================================================================
   Tips for Prompting — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/tips-for-prompting.
   ========================================================================== */

const tocItems = [
  { id: "html-tips", label: "HTML Generation Tips", level: 2 },
  { id: "component-prompts", label: "Component Prompts", level: 2 },
  { id: "responsive-design", label: "Responsive Design", level: 2 },
  { id: "device-framing", label: "Device Framing", level: 2 },
  { id: "styling-tips", label: "Styling & Frameworks", level: 2 },
  { id: "typography-fonts", label: "Typography & Fonts", level: 2 },
  { id: "animation-tips", label: "Animation Techniques", level: 2 },
  { id: "layout-examples", label: "Layout Examples", level: 2 },
  { id: "advanced-techniques", label: "Advanced Techniques", level: 2 },
];

const fontShowcase = [
  { name: "Inter", label: "Inter Sans", description: "A versatile, highly legible sans-serif designed for screens." },
  { name: "Geist", label: "Geist Sans", description: "Modern sans-serif by Vercel with compact spacing and softly bent arcs." },
  { name: "Plus Jakarta Sans", label: "Jakarta Sans", description: "Friendly sans-serif designed for digital interfaces." },
  { name: "Manrope", label: "Manrope", description: "Modern geometric sans-serif with clean lines and balanced proportions." },
  { name: "IBM Plex Sans", label: "IBM Plex", description: "Corporate typeface with excellent legibility for enterprise apps." },
  { name: "Geist Mono", label: "Geist Mono", description: "Clean monospaced companion to Geist Sans, ideal for code." },
];

export const tipsForPromptingContent: LearnPageContent = {
  slug: "tips-for-prompting",
  title: "Tips for Prompting",
  description: "How to write prompts that produce usable designs.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Tips for Prompting</DocH1>
        <DocLead>
          Learn how to craft effective prompts for HTML generation and get better results with Aura's AI-powered design tools. Well-structured prompts are the key to getting precise, usable output from AI tools.
        </DocLead>
      </header>

      {/* ===== HTML Generation Tips ===== */}
      <DocH2 id="html-tips">HTML Generation Tips</DocH2>
      <DocP>Creating effective prompts for HTML generation can significantly improve your results. Here are some specialized tips:</DocP>

      <DocOL>
        <DocStep num={1} title="Specify the framework">Mention whether you want vanilla HTML/CSS or a specific framework like Tailwind CSS, Bootstrap, or Material UI.</DocStep>
        <DocStep num={2} title="Define the component structure">Outline the key elements you need.</DocStep>
        <DocStep num={3} title="Include responsive behavior requirements">Specify how your design should adapt to different screen sizes.</DocStep>
        <DocStep num={4} title="Reference a style guide or brand colors">Provide color codes or style information.</DocStep>
        <DocStep num={5} title="Mention interactive elements">Describe any animations or effects.</DocStep>
        <DocStep num={6} title="Provide a reference or inspiration">Point to existing designs.</DocStep>
      </DocOL>

      <DocP>Examples:</DocP>
      <DocCodeBlock>Generate a contact form using Tailwind CSS with responsive design and form validation.</DocCodeBlock>
      <DocCodeBlock>Create a product card with image at the top, product title, price, short description, and an 'Add to Cart' button.</DocCodeBlock>
      <DocCodeBlock>Create a navbar that collapses into a hamburger menu on mobile devices under 768px width.</DocCodeBlock>
      <DocCodeBlock>Use the color palette #3A86FF (primary), #FF006E (accent), and #FFFFFF (background) with rounded corners (8px radius).</DocCodeBlock>
      <DocCodeBlock>Include a hover effect that scales the card by 1.05x and adds a subtle shadow when users hover over the product.</DocCodeBlock>
      <DocCodeBlock>Create a testimonial section similar to those on Airbnb's homepage with avatar, quote, and customer name.</DocCodeBlock>

      {/* ===== Component Prompts ===== */}
      <DocH2 id="component-prompts">Component Prompts</DocH2>
      <DocP>These templates are starting points. For best results, customize them with your specific design requirements.</DocP>
      <DocP>Use these sample prompts as templates for common UI components:</DocP>

      <DocFeatureBlock title="Hero Section">
        Generate a modern hero section for a SaaS product with Tailwind CSS. Include a headline, subheading, CTA button, and a floating mockup image on the right side. Make it fully responsive.
      </DocFeatureBlock>
      <DocFeatureBlock title="Pricing Table">
        Create a 3-tier pricing table with Tailwind CSS. Each card should have the plan name, price, feature list with checkmarks, and a CTA button. Highlight the middle plan as "Most Popular."
      </DocFeatureBlock>

      {/* ===== Responsive Design ===== */}
      <DocH2 id="responsive-design">Responsive Design</DocH2>
      <DocOL>
        <DocStep num={1} title="Specify breakpoints">Define exactly when layouts should change.
          <br />Create a layout that switches from 3 columns on desktop (1024px+) to 2 columns on tablet (768px to 1023px) and 1 column on mobile (below 768px).
        </DocStep>
        <DocStep num={2} title="Describe mobile-specific behaviors">Detail how elements should adapt.
          <br />On mobile, the navigation menu should collapse into a hamburger icon that, when clicked, reveals a full-screen overlay menu with a close button.
        </DocStep>
        <DocStep num={3} title="Prioritize content for mobile">Explain what content is most important.
          <br />On mobile, prioritize the sign-up form by placing it above the feature list. On desktop, display them side-by-side.
        </DocStep>
        <DocStep num={4} title="Specify touch-friendly elements">Request appropriate sizing for touch interfaces.
          <br />Make all buttons at least 44px tall on mobile for better touch targets, with 16px spacing between interactive elements.
        </DocStep>
      </DocOL>

      {/* ===== Device Framing ===== */}
      <DocH2 id="device-framing">Device Framing</DocH2>
      <DocP>For more realistic mockups, request your UI to be framed within appropriate device containers:</DocP>

      <DocFeatureBlock title="Browser Frame">
        Frame your design in a browser window with traffic lights (close, minimize, maximize buttons).
        <br />Create a landing page and frame it within a modern browser window with macOS-style traffic light buttons (red, yellow, green) in the top-left corner.
      </DocFeatureBlock>
      <DocFeatureBlock title="iPhone Frame">
        Showcase mobile designs within an iPhone frame with notch and buttons.
        <br />Design a mobile app screen for a fitness tracker, and place it inside a modern iPhone frame with the notch/Dynamic Island at the top.
      </DocFeatureBlock>
      <DocFeatureBlock title="iPad Frame">
        Present tablet designs in an iPad frame with characteristic bezels.
        <br />Create a tablet version of our dashboard and display it within an iPad Pro frame with thin bezels and rounded corners.
      </DocFeatureBlock>

      <DocProTip label="Pro Tip">
        When requesting device frames, include details about the device's environment to make mockups more realistic. For example, specify desktop wallpaper for browser frames, or include a desk surface for device mockups.
      </DocProTip>

      <DocH3>Framing Implementation Tips</DocH3>
      <DocUL>
        <DocLI>"Frame this design in an iPhone 14 Pro" is better than "put this in a phone frame."</DocLI>
        <DocLI>Include URL bars for browser frames or status bars with realistic time/battery indicators for mobile frames.</DocLI>
        <DocLI>"Show the iPhone on a wooden desk with soft lighting" creates more realistic mockups.</DocLI>
        <DocLI>"Show the iPad at a slight angle (15°) with a subtle shadow beneath it" adds depth to presentations.</DocLI>
      </DocUL>

      {/* ===== Styling & Frameworks ===== */}
      <DocH2 id="styling-tips">Styling & Frameworks</DocH2>
      <DocP>Tips for specifying styling and frameworks in your prompts:</DocP>

      <DocFeatureBlock title="Be explicit about CSS frameworks">
        "Generate a contact form using Bootstrap 5 with form validation and floating labels" is better than just "Create a contact form."
      </DocFeatureBlock>
      <DocFeatureBlock title="Include specific class patterns">
        For Tailwind users: "Use Tailwind's container class with mx-auto and px-4 for proper spacing and centering."
      </DocFeatureBlock>
      <DocFeatureBlock title="Specify design system or component library">
        "Create a dashboard layout using Material UI components with a sidebar, header, and main content area."
      </DocFeatureBlock>
      <DocFeatureBlock title="Mention CSS architecture">
        "Use BEM methodology for CSS class naming and organization with separate component-based stylesheets."
      </DocFeatureBlock>
      <DocFeatureBlock title="Reference your favorite apps">
        "Design a settings page in the style of Apple's iOS interface" or "Create a music player with Spotify's dark theme aesthetic."
      </DocFeatureBlock>

      {/* ===== Typography & Fonts ===== */}
      <DocH2 id="typography-fonts">Typography & Fonts</DocH2>
      <DocP>
        Typography plays a crucial role in UI design. Effective typography enhances readability, establishes hierarchy, and strengthens brand identity. Here's how to leverage modern fonts in your designs:
      </DocP>
      <DocFeatureBlock title="Typography Fundamentals">
        When requesting designs, be specific about typography preferences including font family, weight, size, line height, and letter spacing. This ensures consistent, readable, and visually appealing text across your interface.
      </DocFeatureBlock>

      <DocH3>Modern Web Fonts</DocH3>
      <div className="docs-font-grid">
        {fontShowcase.map((f) => (
          <div key={f.name} className="docs-font-card">
            <span className="docs-font-name">{f.label}</span>
            <span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl</span>
            <span className="docs-font-desc">{f.description}</span>
          </div>
        ))}
      </div>

      <DocH3>Typography Prompt Builder</DocH3>
      <DocP>Use this interactive tool to craft precise typography prompts. Adjust the sliders to create the perfect typography instructions:</DocP>
      <DocUL>
        <DocLI title="1. Select Typeface Family">Sans Serif (Inter, Geist, Manrope, Plus Jakarta Sans), Serif (Merriweather, IBM Plex Serif, Libre Baskerville), Monospace (Geist Mono, IBM Plex Mono, JetBrains Mono)</DocLI>
        <DocLI title="2. Font Size Scale">Heading, subheading, body text sizes</DocLI>
        <DocLI title="3. Font Weight Distribution">Heading weight, subheading weight, body text weight</DocLI>
        <DocLI title="4. Letter Spacing">Tracking for headings, subheadings, body</DocLI>
      </DocUL>

      <DocP muted>Generated Prompt example:</DocP>
      <DocCodeBlock>{`Create a landing page using Inter font with the following typography scale:
• Headings: 40-60px, font-weight: 640, letter-spacing: -0.06em
• Subheadings: 28-36px, font-weight: 560, letter-spacing: 0.00em
• Body text: 14-16px, font-weight: 460, line-height: 1.5
• Button text: 14px, font-weight: 540, letter-spacing: 0.02em`}</DocCodeBlock>

      {/* ===== Animation Techniques ===== */}
      <DocH2 id="animation-tips">Animation Techniques</DocH2>
      <DocP>Add smooth, purposeful animations to enhance user experience:</DocP>

      <DocFeatureBlock title="Fade In">
        Gradually reveal elements for a subtle, elegant entrance.
        <br />Add a simple fade-in animation to the hero section that transitions from opacity 0 to 1 over 800ms with an ease-in-out timing function.
      </DocFeatureBlock>
      <DocFeatureBlock title="Slide-in Animations">
        Move elements into position from off-screen.
        <br />Create a slide-in animation for the sidebar that enters from the left with a transform: translateX(-100%) to translateX(0) transition.
      </DocFeatureBlock>
      <DocFeatureBlock title="Blur Effects">
        Transition from blurred to clear for a dramatic reveal.
        <br />Apply a blur-in effect to images where they start with filter: blur(10px) and transition to filter: blur(0) when they enter the viewport.
      </DocFeatureBlock>
      <DocFeatureBlock title="Sequenced Animations">
        Stagger animations across multiple elements.
        <br />Create a staggered entrance for list items where each item appears 150ms after the previous one using incremental animation-delay values.
      </DocFeatureBlock>

      <DocP muted>Animation Examples:</DocP>
      <DocCodeBlock>{`@keyframes fadeIn {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes slideIn {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}`}</DocCodeBlock>

      <DocOL>
        <DocStep num={1} title="Duration">Set animation-duration for how long an animation takes to complete one cycle.
          <br /><code>animation-duration: 500ms; /* Half a second */</code>
        </DocStep>
        <DocStep num={2} title="Delay">Use animation-delay to postpone the start of an animation.
          <br /><code>animation-delay: 250ms; /* Quarter second delay */</code>
        </DocStep>
        <DocStep num={3} title="Timing Function">Control animation acceleration with animation-timing-function.
          <br /><code>animation-timing-function: ease-in-out; /* Smooth start and end */</code>
        </DocStep>
        <DocStep num={4} title="Negative Delays">Use negative animation-delay values to start an animation partway through its cycle.
          <br /><code>animation-delay: -2s; /* Starts 2 seconds into the animation */</code>
        </DocStep>
      </DocOL>

      <DocProTip label="Animation Best Practices">
        Keep animations subtle and purposeful. Use the <code>prefers-reduced-motion</code> media query to respect user preferences for reduced motion. Aim for animations under 500ms for UI interactions to maintain responsiveness.
      </DocProTip>

      <DocH3>JavaScript Visualization Libraries</DocH3>
      <DocP>Leverage powerful JavaScript libraries to create impressive visual effects with minimal custom code:</DocP>
      <DocFeatureBlock title="Three.js">
        Create 3D scenes, models, and animations directly in the browser.
        <br />Create a landing page with a Three.js background featuring a slow-rotating 3D model of our product.
      </DocFeatureBlock>
      <DocFeatureBlock title="COBE.js">
        Lightweight library for creating interactive 3D globes.
        <br />Add a COBE.js globe to our 'Global Presence' section that highlights our office locations with markers.
      </DocFeatureBlock>
      <DocFeatureBlock title="Vanta.js">
        Animated backgrounds with minimal configuration.
        <br />Use Vanta.js BIRDS effect as a subtle animated background for our newsletter signup section.
      </DocFeatureBlock>
      <DocFeatureBlock title="GSAP">
        Professional-grade animation library for modern websites.
        <br />Implement a staggered fade-in animation using GSAP for the features list as users scroll down the page.
      </DocFeatureBlock>

      <DocFeatureBlock title="Learning Tailwind's Design System">
        Understanding Tailwind's design systems will help you create more effective and consistent prompts:
      </DocFeatureBlock>

      <DocH4>Color System</DocH4>
      <DocP>Tailwind uses a numeric scale for color intensity, from 50 (lightest) to 900 (darkest).</DocP>
      <DocCodeBlock>Create a button with a blue-600 background that changes to blue-700 on hover, with white text.</DocCodeBlock>

      <DocH4>Spacing System</DocH4>
      <DocP>Tailwind uses a consistent spacing scale where 1 unit equals 0.25rem (4px by default).</DocP>
      <DocCodeBlock>Add p-4 for padding, mt-6 for margin-top, and gap-2 between flex items.</DocCodeBlock>

      <DocH4>Typography Scale</DocH4>
      <DocP>Tailwind's font sizes range from text-xs to text-9xl, with standardized line heights.</DocP>
      <DocCodeBlock>Use text-xl font-medium for headings and text-sm text-gray-600 for descriptions.</DocCodeBlock>

      <DocH4>Responsive Design Patterns</DocH4>
      <DocP>Learn Tailwind's breakpoint prefixes: sm, md, lg, xl, and 2xl.</DocP>
      <DocCodeBlock>Create a grid with grid-cols-1 on mobile, md:grid-cols-2 on tablets, and lg:grid-cols-3 on desktop.</DocCodeBlock>

      {/* ===== Layout Examples ===== */}
      <DocH2 id="layout-examples">Layout Examples</DocH2>
      <DocP>These visual examples demonstrate common UI layout patterns you can request in your prompts:</DocP>
      <DocFeatureBlock title="Bento Grid">
        Design a bento grid layout with mixed sized cells using grid-column-span and grid-row-span. Make the featured item larger than others.
      </DocFeatureBlock>
      <DocFeatureBlock title="Modal Dialog">
        Build a modal dialog with header, body, and footer. Include a close button and overlay backdrop with a fade-in animation.
      </DocFeatureBlock>
      <DocFeatureBlock title="List Layout">
        Create a responsive list layout with cards that stack on mobile and display in a grid on larger screens.
      </DocFeatureBlock>

      {/* ===== Advanced Techniques ===== */}
      <DocH2 id="advanced-techniques">Advanced Techniques</DocH2>
      <DocP>Advanced prompting techniques for power users:</DocP>

      <DocH3>Expert Prompting Strategies</DocH3>
      <DocFeatureBlock title="Chain your requests">
        Start with a basic structure, then refine in subsequent prompts: "Now add form validation to the contact form with appropriate error messages."
      </DocFeatureBlock>
      <DocFeatureBlock title="Provide example code snippets">
        Share a code snippet you like and ask: "Create a product listing page following this component structure but styled with Tailwind CSS."
      </DocFeatureBlock>
      <DocFeatureBlock title="Use persona-based prompting">
        "Create HTML/CSS for a pricing section as if you were an experienced UI designer specializing in SaaS products."
      </DocFeatureBlock>
      <DocFeatureBlock title="Request accessibility features">
        "Create a form with WCAG 2.1 AA compliance, including proper aria labels, keyboard navigation, and focus states."
      </DocFeatureBlock>

      <DocP>
        For more in-depth guidance, check out our{" "}
        <DocLink href="/learn/video-tutorials">video tutorials</DocLink>
        {" "}or visit the{" "}
        <DocLink href="/learn/documentation">documentation</DocLink>
        {" "}for comprehensive information.
      </DocP>

      {/* ===== Next Steps ===== */}
      <DocH2 id="next-steps">Next Steps</DocH2>
      <DocP>Now that you've learned about effective prompting, explore these resources:</DocP>
      <div className="docs-card-grid docs-card-grid-2">
        <a href="/learn/video-tutorials" className="docs-card">
          <span className="docs-card-title">Video Tutorials</span>
          <span className="docs-card-body">Watch step-by-step guides</span>
          <span className="docs-card-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </a>
        <a href="/learn/documentation" className="docs-card">
          <span className="docs-card-title">Documentation</span>
          <span className="docs-card-body">Read comprehensive guides</span>
          <span className="docs-card-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>
    </article>
  ),
};
