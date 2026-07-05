import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocOL, DocLI,
  DocFeatureBlock, DocStep, DocProTip, DocCodeBlock, DocLink, DocNote,
} from "../_components/Doc";

/* ============================================================================
   Styling Prompting — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/prompt-for-styling.
   ========================================================================== */

const tocItems = [
  { id: "overview", label: "Overview", level: 2 },
  { id: "style-types", label: "Style Types", level: 2 },
  { id: "themes", label: "Themes", level: 2 },
  { id: "color-theory", label: "Color Theory", level: 2 },
  { id: "colors", label: "Colors", level: 2 },
  { id: "shadows", label: "Shadows", level: 2 },
  { id: "responsive-design", label: "Responsive Design", level: 2 },
  { id: "accessibility", label: "Accessibility", level: 2 },
  { id: "advanced-techniques", label: "Advanced Techniques", level: 2 },
  { id: "color-palettes", label: "Color Palettes", level: 2 },
  { id: "prompt-builder", label: "Prompt Builder", level: 2 },
  { id: "best-practices", label: "Best Practices", level: 2 },
  { id: "examples", label: "Example Prompts", level: 2 },
  { id: "resources", label: "Resources", level: 2 },
];

const colorPsychology = [
  { name: "Red", desc: "Energy, urgency, passion. Use for CTAs, warnings, and important actions." },
  { name: "Blue", desc: "Trust, stability, professionalism. Perfect for corporate and financial apps." },
  { name: "Green", desc: "Growth, success, nature. Ideal for success states and eco-friendly brands." },
  { name: "Yellow", desc: "Optimism, creativity, attention. Great for highlights and creative tools." },
  { name: "Purple", desc: "Luxury, creativity, mystery. Perfect for premium and creative applications." },
  { name: "Gray", desc: "Neutrality, sophistication, balance. Essential for text and backgrounds." },
];

const colorTools = [
  { name: "Coolors", desc: "Color palette generator", href: "https://coolors.co" },
  { name: "Color Hunt", desc: "Curated color palettes", href: "https://colorhunt.co" },
  { name: "Paletton", desc: "Color scheme designer", href: "https://paletton.com" },
];

const accessibilityTools = [
  { name: "WebAIM Contrast Checker", desc: "WCAG compliance testing", href: "https://webaim.org/resources/contrastchecker/" },
  { name: "Color Blindness Simulator", desc: "Test color accessibility", href: "https://www.colour-blindness.com/colour-blindness-tests/" },
  { name: "Accessible Colors", desc: "Find accessible color combinations", href: "https://accessible-colors.com" },
  { name: "axe DevTools", desc: "Chrome extension for accessibility testing", href: "https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd" },
  { name: "Stark (Figma Plugin)", desc: "Design accessibility toolkit", href: "https://www.figma.com/community/plugin/732603254453395948/Stark" },
  { name: "WAVE Web Accessibility Evaluator", desc: "Web page accessibility analysis", href: "https://wave.webaim.org/" },
];

const designSystems = [
  { name: "Material Design", desc: "Google's design system", href: "https://material.io/design" },
  { name: "Apple HIG", desc: "iOS design guidelines", href: "https://developer.apple.com/design/human-interface-guidelines/" },
  { name: "Tailwind CSS", desc: "Utility-first CSS framework", href: "https://tailwindcss.com/docs" },
];

const typographyTools = [
  { name: "Type Scale", desc: "Typography scale generator", href: "https://type-scale.com" },
  { name: "Gridlover", desc: "Typography rhythm tool", href: "https://gridlover.net" },
  { name: "Spacing.js", desc: "Spacing system calculator", href: "https://spacingjs.com" },
];

export const stylingContent: LearnPageContent = {
  slug: "prompt-for-styling",
  title: "Styling Prompting",
  description: "Prompting for color tokens, spacing, borders, and motion.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Prompt for Styling</DocH1>
        <DocLead>
          Master the art of crafting effective prompts for styling your UI components with different visual approaches, themes, colors, and effects. This comprehensive guide covers everything from basic color theory to advanced styling techniques.
        </DocLead>
      </header>
      <DocP>
        Well-crafted styling prompts are essential for creating visually appealing, accessible designs that align with your brand identity. This guide helps you create effective styling instructions for optimal results.
      </DocP>

      {/* ===== Overview ===== */}
      <DocH2 id="overview">Overview</DocH2>
      <DocP>Creating effective prompts for styling your UI components with different visual approaches, themes, colors, and effects:</DocP>
      <DocOL>
        <DocStep num={1} title="Visual Hierarchy">How elements are prioritized and organized to guide user attention.
          <br />Create a card component with clear visual hierarchy: large title, medium subtitle, small body text, and a prominent CTA button.
        </DocStep>
        <DocStep num={2} title="Style Type Selection">Choose the overall visual approach that matches your brand and goals.
          <br />Design a dashboard with glassmorphism style using backdrop blur, subtle transparency, and soft shadows to create depth.
        </DocStep>
        <DocStep num={3} title="Color Psychology">Use colors strategically to influence emotions and behavior.
          <br />Create a financial app interface using blue as the primary color to convey trust and stability, with green for positive values and red for warnings.
        </DocStep>
        <DocStep num={4} title="Accessibility & Contrast">Ensure designs work for all users with proper contrast and semantic meaning.
          <br />Design a form with WCAG AA compliant contrast ratios (4.5:1 minimum), clear focus states, and semantic HTML structure.
        </DocStep>
      </DocOL>
      <DocFeatureBlock title="Key Styling Considerations">
        When crafting styling prompts, be specific about visual hierarchy, color choices, spacing, and interactive states. Don't just say "make it look good" — describe exactly how elements should appear and behave.
      </DocFeatureBlock>

      <DocH3>Common Styling Approaches</DocH3>
      <DocFeatureBlock title="Minimalist">
        Clean lines, ample white space, and purposeful use of color.
        <br />Create a minimalist login form with clean typography, subtle borders, and a single accent color for the submit button.
      </DocFeatureBlock>
      <DocFeatureBlock title="Rich & Expressive">
        Bold colors, gradients, and dynamic visual elements.
        <br />Design a creative portfolio hero section with vibrant gradients, bold typography, and animated elements that showcase personality.
      </DocFeatureBlock>

      {/* ===== Style Types ===== */}
      <DocH2 id="style-types">Style Types</DocH2>
      <DocP>Choose a visual style that matches your design goals and brand identity. Each style type has its own characteristics and use cases.</DocP>
      <DocUL>
        <DocLI title="flat">Clean, solid colors without shadows or gradients</DocLI>
        <DocLI title="outline">Transparent backgrounds with visible borders</DocLI>
        <DocLI title="minimalist">Simple, clean design with subtle elements</DocLI>
        <DocLI title="glass">Glassmorphism with backdrop blur effects</DocLI>
        <DocLI title="ios">iOS-style with rounded corners and depth</DocLI>
        <DocLI title="material">Material Design with elevation and shadows</DocLI>
      </DocUL>

      <DocProTip label="Style Type Guidelines">
        <strong>Flat Design:</strong> Perfect for modern, clean interfaces. Use when you want minimal distraction and fast loading times.
        <br /><br />
        <strong>Material Design:</strong> Great for Android apps and Google-style interfaces. Provides clear hierarchy through elevation.
        <br /><br />
        <strong>Glassmorphism:</strong> Ideal for premium, modern applications. Creates depth while maintaining transparency.
        <br /><br />
        <strong>Neumorphism:</strong> Best for creative applications where you want a tactile, physical feel.
      </DocProTip>

      {/* ===== Themes ===== */}
      <DocH2 id="themes">Themes</DocH2>
      <DocP>Theme selection affects the overall mood and usability of your interface. Consider your users' preferences, usage context, and accessibility needs.</DocP>
      <DocUL>
        <DocLI title="light">Bright backgrounds with dark text</DocLI>
        <DocLI title="dark">Dark backgrounds with light text</DocLI>
        <DocLI title="auto">Adapts to system preferences</DocLI>
      </DocUL>

      <DocH3>Theme Considerations</DocH3>
      <DocH4>Light Theme</DocH4>
      <DocUL>
        <DocLI>Better for reading and detailed work</DocLI>
        <DocLI>More familiar to most users</DocLI>
        <DocLI>Better for outdoor/bright environments</DocLI>
        <DocLI>Can appear more trustworthy and professional</DocLI>
      </DocUL>

      <DocH4>Dark Theme</DocH4>
      <DocUL>
        <DocLI>Reduces eye strain in low-light conditions</DocLI>
        <DocLI>Saves battery on OLED screens</DocLI>
        <DocLI>Popular with developers and power users</DocLI>
        <DocLI>Can appear more modern and sophisticated</DocLI>
      </DocUL>

      {/* ===== Color Theory ===== */}
      <DocH2 id="color-theory">Color Theory</DocH2>
      <DocP>Understanding color theory is essential for creating effective and emotionally resonant designs. Colors can influence user behavior, convey brand personality, and improve usability.</DocP>

      <DocH3>Color Psychology</DocH3>
      <div className="docs-color-psych-grid">
        {colorPsychology.map((c) => (
          <div key={c.name} className="docs-color-psych-card">
            <span className="docs-color-psych-name">{c.name}</span>
            <span className="docs-color-psych-desc">{c.desc}</span>
          </div>
        ))}
      </div>

      <DocH3>Color Harmony Rules</DocH3>
      <DocFeatureBlock title="60-30-10 Rule">
        Use 60% dominant color, 30% secondary color, and 10% accent color for balanced designs.
      </DocFeatureBlock>
      <DocFeatureBlock title="Complementary Colors">
        Colors opposite on the color wheel create high contrast and visual interest. Use sparingly for maximum impact.
      </DocFeatureBlock>
      <DocFeatureBlock title="Analogous Colors">
        Colors next to each other on the color wheel create harmony and are pleasing to the eye. Perfect for gradients and subtle variations.
      </DocFeatureBlock>

      {/* ===== Colors ===== */}
      <DocH2 id="colors">Colors</DocH2>
      <DocP>Choose colors that align with your brand and create good contrast for accessibility. Consider the emotional impact and cultural associations of your color choices.</DocP>

      <DocProTip label="Color Usage Guidelines">
        <strong>Primary Color:</strong> Use for main actions, links, and brand elements (5-10% of interface)
        <br /><br />
        <strong>Secondary Color:</strong> Use for secondary actions and supporting elements (15-20% of interface)
        <br /><br />
        <strong>Neutral Colors:</strong> Use for text, backgrounds, and borders (70-80% of interface)
        <br /><br />
        <strong>Semantic Colors:</strong> Reserve red for errors, green for success, yellow for warnings
      </DocProTip>

      {/* ===== Shadows ===== */}
      <DocH2 id="shadows">Shadows & Depth</DocH2>
      <DocP>Shadows add depth and hierarchy to your interface. They help users understand which elements are interactive and how content is layered.</DocP>
      <DocUL>
        <DocLI title="none">No shadow effects</DocLI>
        <DocLI title="small">Subtle shadow for minimal depth</DocLI>
        <DocLI title="medium">Standard shadow for good depth</DocLI>
        <DocLI title="large">Prominent shadow for strong depth</DocLI>
        <DocLI title="extra large">Dramatic shadow for maximum impact</DocLI>
        <DocLI title="2xl">Very dramatic shadow for hero elements</DocLI>
        <DocLI title="inner">Inset shadow for pressed/recessed effect</DocLI>
      </DocUL>

      <DocH3>Shadow Usage Guidelines</DocH3>
      <DocH4>Best Practices</DocH4>
      <DocUL>
        <DocLI>Use consistent shadow directions (usually bottom-right)</DocLI>
        <DocLI>Increase shadow intensity for higher elevation</DocLI>
        <DocLI>Consider light source and environment</DocLI>
        <DocLI>Use colored shadows sparingly for special effects</DocLI>
        <DocLI>Test shadows in both light and dark themes</DocLI>
      </DocUL>

      {/* ===== Responsive Design ===== */}
      <DocH2 id="responsive-design">Responsive Design</DocH2>
      <DocP>Your styling choices should adapt gracefully across different screen sizes and devices. Consider how colors, shadows, and spacing will work on mobile, tablet, and desktop.</DocP>
      <DocUL>
        <DocLI title="desktop">1025px+ — Multi-column layouts, hover states, detailed interactions</DocLI>
        <DocLI title="tablet">641-1024px — Two-column layouts, medium touch targets, adaptive navigation</DocLI>
        <DocLI title="mobile">0-767px — Single column, larger touch targets (44px), simplified navigation</DocLI>
      </DocUL>

      {/* ===== Accessibility ===== */}
      <DocH2 id="accessibility">Accessibility</DocH2>
      <DocP>Accessible design ensures your interface works for users with disabilities. Color contrast, focus states, and semantic meaning are crucial considerations.</DocP>

      <DocH3>Accessibility Checklist</DocH3>
      <DocH4>Color & Contrast</DocH4>
      <DocUL>
        <DocLI>Maintain 4.5:1 contrast ratio for normal text</DocLI>
        <DocLI>Maintain 3:1 contrast ratio for large text</DocLI>
        <DocLI>Don't rely solely on color to convey information</DocLI>
        <DocLI>Test with color blindness simulators</DocLI>
      </DocUL>

      <DocH4>Interactive Elements</DocH4>
      <DocUL>
        <DocLI>Provide clear focus indicators</DocLI>
        <DocLI>Ensure touch targets are at least 44px</DocLI>
        <DocLI>Use semantic HTML elements</DocLI>
        <DocLI>Provide alternative text for images</DocLI>
      </DocUL>

      {/* ===== Advanced Techniques ===== */}
      <DocH2 id="advanced-techniques">Advanced Styling Techniques</DocH2>
      <DocP>Explore sophisticated styling approaches that can elevate your designs and create memorable user experiences.</DocP>

      <DocH3>Gradient Techniques</DocH3>
      <DocH4>Linear Gradients</DocH4>
      <DocCodeBlock>{`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`}</DocCodeBlock>

      <DocH4>Radial Gradients</DocH4>
      <DocCodeBlock>{`background: radial-gradient(circle at top right, #ff6b6b, #4ecdc4);`}</DocCodeBlock>

      <DocH3>CSS Custom Properties (Variables)</DocH3>
      <DocP>Use CSS custom properties to create maintainable and themeable designs.</DocP>
      <DocCodeBlock>{`:root {
  --primary-color: #3B82F6;
  --secondary-color: #6B7280;
  --background-color: #FFFFFF;
  --text-color: #1F2937;
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --background-color: #111827;
  --text-color: #F9FAFB;
}`}</DocCodeBlock>

      {/* ===== Color Palettes ===== */}
      <DocH2 id="color-palettes">Color Palettes</DocH2>
      <DocUL>
        <DocLI title="modern">Clean, professional palette for modern applications</DocLI>
        <DocLI title="vibrant">Energetic colors for creative and youthful brands</DocLI>
        <DocLI title="earth">Natural, warm tones inspired by earth elements</DocLI>
        <DocLI title="monochrome">Sophisticated grayscale palette for elegant designs</DocLI>
        <DocLI title="ocean">Cool blues and teals reminiscent of ocean depths</DocLI>
        <DocLI title="sunset">Warm gradient colors inspired by sunset skies</DocLI>
      </DocUL>

      {/* ===== Prompt Builder ===== */}
      <DocH2 id="prompt-builder">Interactive Prompt Builder</DocH2>
      <DocP>Use this interactive tool to build custom styling prompts for your designs. Make selections below to generate a ready-to-use prompt and see a visual preview.</DocP>
      <DocUL>
        <DocLI title="Style Type">flat, outline, minimalist, glass, ios, material</DocLI>
        <DocLI title="Theme">light, dark, auto</DocLI>
        <DocLI title="Primary Color">Choose brand color</DocLI>
        <DocLI title="Shadow Depth">none, small, medium, large, extra large, 2xl, inner</DocLI>
        <DocLI title="Device Optimization">mobile, tablet, desktop</DocLI>
        <DocLI title="Color Palette">modern, vibrant, earth, monochrome, ocean, sunset</DocLI>
      </DocUL>

      <DocProTip label="Customization Tip">
        For even better results, you can further customize the generated prompt with specific details about your brand colors, accessibility requirements, or particular visual effects you need. Consider adding context about your target audience and use case.
      </DocProTip>

      {/* ===== Best Practices ===== */}
      <DocH2 id="best-practices">Best Practices</DocH2>

      <DocH3>Do's</DocH3>
      <DocUL>
        <DocLI>Maintain consistency across all components and pages</DocLI>
        <DocLI>Consider accessibility and color contrast in all design decisions</DocLI>
        <DocLI>Test your designs in both light and dark themes</DocLI>
        <DocLI>Use shadows purposefully to create clear visual hierarchy</DocLI>
        <DocLI>Choose colors that align with your brand identity and target audience</DocLI>
        <DocLI>Implement responsive design principles from the start</DocLI>
        <DocLI>Use semantic color meanings (red for errors, green for success)</DocLI>
        <DocLI>Create a design system with reusable components</DocLI>
        <DocLI>Test with real users and gather feedback</DocLI>
        <DocLI>Consider cultural color associations for global audiences</DocLI>
      </DocUL>

      <DocH3>Don'ts</DocH3>
      <DocUL>
        <DocLI>Don't use too many different colors in one design (stick to 3-5 main colors)</DocLI>
        <DocLI>Avoid low contrast combinations that hurt readability</DocLI>
        <DocLI>Don't overuse shadows or visual effects</DocLI>
        <DocLI>Avoid mixing incompatible style types within the same interface</DocLI>
        <DocLI>Don't ignore mobile and responsive considerations</DocLI>
        <DocLI>Don't use color as the only way to convey information</DocLI>
        <DocLI>Don't follow trends blindly without considering your users</DocLI>
        <DocLI>Don't neglect performance implications of complex styling</DocLI>
        <DocLI>Don't make assumptions about user preferences</DocLI>
      </DocUL>

      <DocH3>Pro Tips</DocH3>
      <DocUL>
        <DocLI>Use the 60-30-10 rule for color distribution in your designs</DocLI>
        <DocLI>Create hover and focus states that are 10-20% darker/lighter than base colors</DocLI>
        <DocLI>Implement a consistent border radius system (e.g., 4px, 8px, 16px)</DocLI>
        <DocLI>Use CSS custom properties for easy theme switching</DocLI>
        <DocLI>Consider using a color palette generator for harmonious combinations</DocLI>
        <DocLI>Test your designs with color blindness simulators</DocLI>
        <DocLI>Use relative units (rem, em) for better scalability</DocLI>
        <DocLI>Implement a consistent spacing scale (e.g., 4px, 8px, 16px, 32px)</DocLI>
        <DocLI>Consider the emotional impact of your color choices</DocLI>
        <DocLI>Document your design decisions for team consistency</DocLI>
      </DocUL>

      {/* ===== Example Prompts ===== */}
      <DocH2 id="examples">Example Prompts</DocH2>
      <DocH3>Modern SaaS Dashboard</DocH3>
      <DocCodeBlock>{`Create a modern SaaS dashboard with glassmorphism design using an adaptive theme that responds to system preferences. Use blue (#3B82F6) as the primary accent color with subtle large shadows for depth. The background should be white in light mode and dark gray (#111827) in dark mode. Include a sidebar navigation, main content area with cards showing key metrics, and a top bar with user profile and notifications.`}</DocCodeBlock>

      <div className="docs-card-grid docs-card-grid-2">
        <a href="/learn/prompt-for-layout" className="docs-card">
          <span className="docs-card-title">Layout Prompting</span>
          <span className="docs-card-body">Learn how to prompt for effective layouts</span>
          <span className="docs-card-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </a>
        <a href="/learn/prompt-for-typography" className="docs-card">
          <span className="docs-card-title">Typography Prompting</span>
          <span className="docs-card-body">Master typography prompts for better readability</span>
          <span className="docs-card-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>

      {/* ===== Resources ===== */}
      <DocH2 id="resources">Resources & Tools</DocH2>
      <DocP>Essential tools and resources to help you create better styling prompts and design systems.</DocP>

      <DocH3>Color Tools & Generators</DocH3>
      <div className="docs-registrar-grid">
        {colorTools.map((t) => (
          <a key={t.href} href={t.href} className="docs-registrar-card" target="_blank" rel="noopener noreferrer">
            <span className="docs-registrar-name">{t.name}</span>
            <span className="docs-registrar-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      <DocH3>Accessibility & Contrast Tools</DocH3>
      <div className="docs-registrar-grid">
        {accessibilityTools.map((t) => (
          <a key={t.href} href={t.href} className="docs-registrar-card" target="_blank" rel="noopener noreferrer">
            <span className="docs-registrar-name">{t.name}</span>
            <span className="docs-registrar-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      <DocH3>Design Systems & References</DocH3>
      <div className="docs-registrar-grid">
        {designSystems.map((t) => (
          <a key={t.href} href={t.href} className="docs-registrar-card" target="_blank" rel="noopener noreferrer">
            <span className="docs-registrar-name">{t.name}</span>
            <span className="docs-registrar-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      <DocH3>Typography & Spacing Tools</DocH3>
      <div className="docs-registrar-grid">
        {typographyTools.map((t) => (
          <a key={t.href} href={t.href} className="docs-registrar-card" target="_blank" rel="noopener noreferrer">
            <span className="docs-registrar-name">{t.name}</span>
            <span className="docs-registrar-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </article>
  ),
};
