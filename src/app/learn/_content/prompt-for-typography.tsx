import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocLI,
  DocFeatureBlock, DocProTip, DocCodeBlock, DocLink, DocNote, DocEmbed,
} from "../_components/Doc";

/* ============================================================================
   Typography Prompting — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/prompt-for-typography.
   ========================================================================== */

const tocItems = [
  { id: "introduction", label: "Introduction", level: 2 },
  { id: "font-fundamentals", label: "Font Fundamentals", level: 2 },
  { id: "typography-pairing", label: "Typography Pairing", level: 2 },
  { id: "font-showcase", label: "Font Showcase", level: 2 },
  { id: "prompt-builder", label: "Typography Prompt Builder", level: 2 },
  { id: "typography-examples", label: "Typography Examples", level: 2 },
  { id: "responsive-typography", label: "Responsive Typography", level: 2 },
  { id: "text-animation", label: "Text Animation", level: 2 },
];

const sansSerifFonts = [
  { name: "Inter", label: "Inter Sans", desc: "A versatile, highly legible sans-serif designed for screens." },
  { name: "Bricolage Grotesque", label: "Bricolage Grotesque", desc: "A contemporary grotesque with quirky details and excellent readability." },
  { name: "Geist Sans", label: "Geist Sans", desc: "Modern sans-serif by Vercel with compact spacing and softly bent arcs." },
  { name: "Plus Jakarta Sans", label: "Plus Jakarta Sans", desc: "Friendly sans-serif designed for digital interfaces with excellent legibility." },
];

const serifFonts = [
  { name: "Merriweather", label: "Merriweather", desc: "A traditional serif with excellent readability for longform content." },
  { name: "IBM Plex Serif", label: "IBM Plex Serif", desc: "A contemporary serif with excellent legibility and a technical, precise character." },
  { name: "Playfair Display", label: "Playfair Display", desc: "An elegant display serif with dramatic thick-thin transitions, ideal for headlines." },
];

const monoFonts = [
  { name: "Geist Mono", label: "Geist Mono", desc: "Clean monospaced companion to Geist Sans, ideal for code blocks and technical content." },
  { name: "IBM Plex Mono", label: "IBM Plex Mono", desc: "Technical-looking monospace font with excellent readability for code and technical documentation." },
];

export const typographyContent: LearnPageContent = {
  slug: "prompt-for-typography",
  title: "Typography Prompting",
  description: "Prompting for type scale, font pairing, line height, and rhythm.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Prompting for Typography</DocH1>
        <DocLead>
          Master the art of typography in your designs with effective prompting techniques and font pairing strategies.
        </DocLead>
      </header>
      <DocP>
        Typography is the foundation of good design. This guide will help you craft effective prompts for typography, choose the right fonts, and create balanced type systems for your projects.
      </DocP>

      {/* ===== Introduction ===== */}
      <DocH2 id="introduction">Introduction to Typography Prompting</DocH2>
      <DocP>
        Typography plays a crucial role in design, influencing readability, hierarchy, and overall aesthetic. Properly crafted typography prompts help AI tools generate designs with a professional typographic foundation.
      </DocP>

      <DocH3>Elements of Good Typography</DocH3>
      <DocFeatureBlock title="Hierarchy">
        Clear visual distinction between headings, subheadings, and body text that guides the reader's eye.
      </DocFeatureBlock>
      <DocFeatureBlock title="Readability">
        Appropriate font choices, sizes, and spacing that make content easy to read across different devices.
      </DocFeatureBlock>
      <DocFeatureBlock title="Consistency">
        A systematic approach to type that creates harmony throughout the design.
      </DocFeatureBlock>
      <DocFeatureBlock title="Why Typography Prompts Matter">
        Specifying typography details in your prompts helps AI tools create designs with intentional type choices rather than default options. This leads to more professional-looking designs with better readability and visual hierarchy.
      </DocFeatureBlock>

      <DocEmbed src="/s/ai-systems?embed=true" title="Aura Demo" aspect="16/9" />

      {/* ===== Font Fundamentals ===== */}
      <DocH2 id="font-fundamentals">Font Fundamentals</DocH2>
      <DocP>Understanding font classifications and terminology will help you create more effective typography prompts.</DocP>

      <DocH3>Sans-Serif Fonts</DocH3>
      <DocP>Clean, modern fonts without decorative strokes at the end of characters. Ideal for interfaces, headings, and body text in digital designs.</DocP>
      <div className="docs-font-grid">
        <div className="docs-font-card"><span className="docs-font-name">Inter</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
        <div className="docs-font-card"><span className="docs-font-name">Geist</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
      </div>

      <DocH3>Serif Fonts</DocH3>
      <DocP>Classic fonts with small decorative strokes at the ends of characters. Often used for body text in print and for creating traditional, sophisticated looks.</DocP>
      <div className="docs-font-grid">
        <div className="docs-font-card"><span className="docs-font-name">Merriweather</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
        <div className="docs-font-card"><span className="docs-font-name">Plex Serif</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
      </div>

      <DocH3>Display Fonts</DocH3>
      <DocP>Decorative fonts designed for large headings and titles, not suitable for body text. Use sparingly for maximum impact.</DocP>
      <div className="docs-font-grid">
        <div className="docs-font-card"><span className="docs-font-name">Playfair Display</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
      </div>

      <DocH3>Monospace Fonts</DocH3>
      <DocP>Fonts where each character takes up the same amount of horizontal space. Ideal for code snippets, technical content, and creating typewriter-like aesthetics.</DocP>
      <div className="docs-font-grid">
        <div className="docs-font-card"><span className="docs-font-name">Geist Sans</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
      </div>

      <DocH3>Condensed Fonts</DocH3>
      <DocP>Narrower versions of standard typefaces with characters that take up less horizontal space. Ideal for space-constrained layouts, headlines, and data-dense interfaces.</DocP>
      <div className="docs-font-grid">
        <div className="docs-font-card"><span className="docs-font-name">IBM Plex Condensed</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
      </div>

      <DocH3>Expanded Fonts</DocH3>
      <DocP>Wider versions of standard typefaces with characters that take up more horizontal space. Great for creating impact in headlines and providing an open, airy feel.</DocP>
      <div className="docs-font-grid">
        <div className="docs-font-card"><span className="docs-font-name">Encode Sans Expanded</span><span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl 0123456789</span></div>
      </div>

      <DocH3>Typography Terminology</DocH3>
      <DocUL>
        <DocLI title="Font Weight">The thickness of the characters, usually ranging from 100 (thin) to 900 (black).</DocLI>
        <DocLI title="Font Size">The size of the characters, typically measured in pixels (px), points (pt), or relative units like rem.</DocLI>
        <DocLI title="Line Height">The space between lines of text, affects readability especially for longer text blocks.</DocLI>
        <DocLI title="Letter Spacing">The space between characters, can be adjusted for aesthetic purposes or to improve readability.</DocLI>
      </DocUL>

      {/* ===== Typography Pairing ===== */}
      <DocH2 id="typography-pairing">Typography Pairing</DocH2>
      <DocP>Creating effective font pairings is an art that can elevate your designs. Learn how to specify complementary fonts in your prompts.</DocP>
      <DocFeatureBlock title="Font Pairing Principles">
        The most effective font combinations create visual contrast while sharing some subtle quality that connects them. Typically, pair a distinctive headline font with a more neutral body font.
      </DocFeatureBlock>

      <DocH3>Classic Font Pairings</DocH3>

      <DocH4>Serif + Sans-Serif</DocH4>
      <DocP>Create a landing page using Playfair Display for headings and Inter for body text. Use a dramatic size contrast with headings at 64px and body text at 16px.</DocP>

      <DocH4>Sans-Serif + Sans-Serif</DocH4>
      <DocP>Bricolage Grotesque paired with Inter for a modern, cohesive look that maintains readability while using a distinctive display font for headlines.</DocP>

      <DocOL>
        <li className="docs-step">
          <span className="docs-step-num">1</span>
          <div className="docs-step-body">
            <p className="docs-step-title">Contrast in Style</p>
            <div className="docs-step-content">Use Playfair Display for headings and Inter for body text.</div>
          </div>
        </li>
        <li className="docs-step">
          <span className="docs-step-num">2</span>
          <div className="docs-step-body">
            <p className="docs-step-title">Contrast in Weight</p>
            <div className="docs-step-content">When using fonts from the same family, create contrast with dramatic weight differences. Use Inter Black (900) for headings and Inter Regular (400) for body text.</div>
          </div>
        </li>
        <li className="docs-step">
          <span className="docs-step-num">3</span>
          <div className="docs-step-body">
            <p className="docs-step-title">Contrast in Size</p>
            <div className="docs-step-content">Create visual interest with significant size differences between headings and body text. Set headings to 3rem (48px) and body text to 1rem (16px).</div>
          </div>
        </li>
        <li className="docs-step">
          <span className="docs-step-num">4</span>
          <div className="docs-step-body">
            <p className="docs-step-title">Historical or Stylistic Connections</p>
            <div className="docs-step-content">Pair fonts that share a historical period or design aesthetic. Create a mid-century modern design using Futura for headings and Gill Sans for body text.</div>
          </div>
        </li>
      </DocOL>

      {/* ===== Font Showcase ===== */}
      <DocH2 id="font-showcase">Font Showcase</DocH2>
      <DocP>A selection of modern fonts you can reference in your prompts, with examples of their appearance and ideal use cases.</DocP>

      <DocH3>Sans-Serif Fonts</DocH3>
      <div className="docs-font-grid">
        {sansSerifFonts.map((f) => (
          <div key={f.name} className="docs-font-card">
            <span className="docs-font-name">{f.label}</span>
            <span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl</span>
            <span className="docs-font-desc">{f.desc}</span>
          </div>
        ))}
      </div>

      <DocH3>Serif Fonts</DocH3>
      <div className="docs-font-grid">
        {serifFonts.map((f) => (
          <div key={f.name} className="docs-font-card">
            <span className="docs-font-name">{f.label}</span>
            <span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl</span>
            <span className="docs-font-desc">{f.desc}</span>
          </div>
        ))}
      </div>

      <DocH3>Monospace Fonts</DocH3>
      <div className="docs-font-grid">
        {monoFonts.map((f) => (
          <div key={f.name} className="docs-font-card">
            <span className="docs-font-name">{f.label}</span>
            <span className="docs-font-sample">AaBbCcDdEeFfGgHhIiJjKkLl</span>
            <span className="docs-font-desc">{f.desc}</span>
          </div>
        ))}
      </div>

      <DocH3>How to Reference Fonts in Prompts</DocH3>
      <DocUL>
        <DocLI title="Be specific about font names">Use the exact font name instead of generic descriptions. "Use Playfair Display" is better than "use an elegant serif."</DocLI>
        <DocLI title="Specify weights and styles">Include weight numbers (400, 700) or names (Regular, Bold) and styles (italic) when relevant.</DocLI>
        <DocLI title="Include fallback options">Mention similar alternatives. "Use Inter or a similar modern sans-serif" provides flexibility.</DocLI>
        <DocLI title="Reference font sources">Mention "Google Fonts" or other sources to clarify where the font is available.</DocLI>
      </DocUL>

      {/* ===== Typography Prompt Builder ===== */}
      <DocH2 id="prompt-builder">Typography Prompt Builder</DocH2>
      <DocP>Create precise typography specifications for your prompts with this interactive builder. Select options below to generate a detailed typography prompt that you can use in your designs.</DocP>

      <DocH3>1. Select Typeface Family</DocH3>
      <DocUL>
        <DocLI title="Sans Serif">Inter, Geist, Manrope, Plus Jakarta Sans</DocLI>
        <DocLI title="Serif">Merriweather, IBM Plex Serif, Libre Baskerville</DocLI>
        <DocLI title="Monospace">Geist Mono, IBM Plex Mono, JetBrains Mono</DocLI>
        <DocLI title="Display">Playfair Display, Bricolage Grotesque</DocLI>
        <DocLI title="Grotesque">Bricolage Grotesque, Neue Haas Grotesk</DocLI>
      </DocUL>

      <DocH3>2. Font Size Scale</DocH3>
      <DocUL>
        <DocLI title="Heading Size">20-32px (small) / 32-40px (medium) / 48-64px (large)</DocLI>
        <DocLI title="Subheading Size">16-20px (small) / 20-28px (medium) / 32-40px (large)</DocLI>
        <DocLI title="Body Text Size">12-14px (small) / 14-16px (medium) / 16-18px (large)</DocLI>
      </DocUL>

      <DocH3>3. Font Weight Distribution</DocH3>
      <DocUL>
        <DocLI title="Heading Weight">400 / 500 / 600 / 700</DocLI>
        <DocLI title="Subheading Weight">300 / 400 / 500 / 600</DocLI>
        <DocLI title="Body Text Weight">300 / 400 / 500 / 600</DocLI>
      </DocUL>

      <DocH3>4. Letter Spacing</DocH3>
      <DocUL>
        <DocLI title="Headings">-0.04em to -0.02em (tight)</DocLI>
        <DocLI title="Subheadings">-0.01em to 0em (slightly tight to normal)</DocLI>
        <DocLI title="Body Text">0em to 0.01em (normal)</DocLI>
        <DocLI title="Buttons/Labels">0.02em to 0.04em (slightly loose)</DocLI>
      </DocUL>

      <DocH3>Generated Prompt</DocH3>
      <DocCodeBlock>{`Create a landing page using Inter font with the following typography scale:
• Headings: 40-60px, font-weight: 640, letter-spacing: -0.06em
• Subheadings: 28-36px, font-weight: 560, letter-spacing: 0.00em
• Body text: 14-16px, font-weight: 460, line-height: 1.5
• Button text: 14px, font-weight: 540, letter-spacing: 0.02em`}</DocCodeBlock>

      {/* ===== Typography Examples ===== */}
      <DocH2 id="typography-examples">Typography Examples</DocH2>
      <DocP>Ready-to-use typography prompt examples for different design scenarios. Copy these prompts and adapt them to your specific needs.</DocP>

      <DocH3>Modern Business Website</DocH3>
      <DocP>Inter Bold for headings. Inter Regular for body text with good readability and clean modern feel.</DocP>
      <DocCodeBlock>{`Create a business homepage using Inter with the following typography scale:
• Headings: 48px, font-weight: 700, letter-spacing: -0.02em
• Subheadings: 24px, font-weight: 600, letter-spacing: -0.01em
• Body text: 16px, font-weight: 400, line-height: 1.5
• Button text: 16px, font-weight: 500, letter-spacing: 0.01em`}</DocCodeBlock>

      <DocH3>Editorial Blog</DocH3>
      <DocCodeBlock>{`Design a blog layout with elegant typography:
• Article titles: Playfair Display, 56px, font-weight: 700, line-height: 1.1
• Section headings: Playfair Display, 32px, font-weight: 600, line-height: 1.2
• Body text: Merriweather, 18px, font-weight: 400, line-height: 1.6
• Pull quotes: Playfair Display italic, 24px, font-weight: 400`}</DocCodeBlock>

      <DocH3>Modern SaaS Landing Page</DocH3>
      <DocCodeBlock>{`Create a SaaS landing page with modern typography:
• Hero heading: Bricolage Grotesque, 64px, font-weight: 700, letter-spacing: -0.03em
• Feature titles: Bricolage Grotesque, 28px, font-weight: 600, letter-spacing: -0.01em
• UI text: Inter, 16px, font-weight: 400, line-height: 1.5
• Button text: Inter, 14px, font-weight: 500, letter-spacing: 0.02em`}</DocCodeBlock>

      <DocH3>E-commerce Store</DocH3>
      <DocCodeBlock>{`Design an e-commerce store with clean, accessible typography:
• Page titles: Plus Jakarta Sans, 40px, font-weight: 800
• Product names: Plus Jakarta Sans, 24px, font-weight: 700, line-height: 1.2
• Product descriptions: Plus Jakarta Sans, 16px, font-weight: 400, line-height: 1.5
• Price: Plus Jakarta Sans, 20px, font-weight: 600`}</DocCodeBlock>

      {/* ===== Responsive Typography ===== */}
      <DocH2 id="responsive-typography">Responsive Typography</DocH2>
      <DocFeatureBlock title="Why Responsive Typography Matters">
        Typography that works well on a desktop might be unreadable on a mobile device. Responsive typography ensures optimal readability and visual hierarchy across all screen sizes, improving the user experience for everyone.
      </DocFeatureBlock>

      <DocH3>Responsive Typography Strategies</DocH3>

      <DocH4>Fluid Typography</DocH4>
      <DocP>Font sizes that scale smoothly between minimum and maximum sizes based on screen width. Smoothly scales between devices.</DocP>
      <DocCodeBlock>{`Create a landing page with fluid typography that scales between mobile and desktop:
• Headings: clamp(32px, 5vw, 64px)
• Subheadings: clamp(24px, 3vw, 36px)
• Body text: clamp(16px, 1vw, 18px)`}</DocCodeBlock>

      <DocH4>Breakpoint-Based Typography</DocH4>
      <DocP>Font sizes that change at specific screen width breakpoints. Smoothly scales between devices.</DocP>
      <DocCodeBlock>{`Create a landing page with breakpoint-based typography:
• Headings: 48px on desktop, 36px on tablet, 24px on mobile
• Subheadings: 36px on desktop, 28px on tablet, 18px on mobile
• Body text: 18px on desktop, 16px on tablet, 14px on mobile
• Button text: 16px on desktop, 14px on mobile`}</DocCodeBlock>

      {/* ===== Text Animation ===== */}
      <DocH2 id="text-animation">Text Animation</DocH2>
      <DocP>Bring your typography to life with these text animation techniques.</DocP>

      <DocH3>Character Reveal</DocH3>
      <DocP>Reveal text character by character, creating a typing effect. Perfect for headers and important typography elements.</DocP>
      <DocCodeBlock>Create a typing animation that reveals each character with a 50ms delay between characters for the main headline using Inter.</DocCodeBlock>

      <DocH4>Word Fade Up</DocH4>
      <DocCodeBlock>{`@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(20px); }
  10%, 80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}`}</DocCodeBlock>
      <DocP>Create a staggered fade-up animation for each word in the tagline, with 100ms delay between words, using Inter font.</DocP>

      <DocH4>Letter by Letter</DocH4>
      <DocCodeBlock>{`@keyframes letterAppear {
  0%, 30% { opacity: 0; transform: scale(0.8); }
  40%, 80% { opacity: 1; transform: scale(1); }
  90%, 100% { opacity: 0; transform: scale(1.2); }
}`}</DocCodeBlock>
      <DocP>Create a letter-by-letter animation that reveals each character with a subtle scale effect and 80ms staggered delay, using a bold display font.</DocP>

      <DocH4>Combined Animation</DocH4>
      <DocCodeBlock>{`@keyframes combinedAnim {
  0%, 30% { opacity: 0; transform: translateY(15px); filter: blur(8px); }
  40%, 80% { opacity: 1; transform: translateY(0); filter: blur(0); }
  90%, 100% { opacity: 0; transform: translateY(-15px); filter: blur(8px); }
}`}</DocCodeBlock>
      <DocP>Create a complex animation that fades in, slides up, and reduces blur for each letter with a 60ms staggered delay between characters using Inter at 60-80px.</DocP>

      <DocH4>Gradient Text</DocH4>
      <DocCodeBlock>{`@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`}</DocCodeBlock>
      <DocP>Apply a moving gradient background from blue to purple to the main heading, with the gradient animating horizontally over 3 seconds in a loop.</DocP>

      <DocH4>Clipped Reveal</DocH4>
      <DocCodeBlock>{`.clip-slide-animation {
  display: inline-block;
  position: relative;
  animation: clipSlide 3s ease-in-out infinite;
}`}</DocCodeBlock>
      <DocP>Create a text animation that slides in with a clipping mask effect that reveals the title text from left to right over 800ms with an ease-out timing function.</DocP>

      <DocProTip label="Text Animation Best Practices">
        Keep text animations subtle and brief to avoid distracting from your content. Ensure animated text remains readable and accessible. Always provide a fallback for users who prefer reduced motion.
      </DocProTip>
    </article>
  ),
};
