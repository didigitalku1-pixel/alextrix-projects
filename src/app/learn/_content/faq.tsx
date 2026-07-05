import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI,
  DocLink,
} from "../_components/Doc";

/* ============================================================================
   FAQ — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/faq.
   ========================================================================== */

const tocItems = [
  { id: "aura-basics", label: "Aura basics", level: 2 },
  { id: "pricing-billing", label: "Pricing & billing", level: 2 },
  { id: "features-workflow", label: "Features & workflow", level: 2 },
  { id: "seo-publishing", label: "SEO & publishing", level: 2 },
  { id: "publishing-export", label: "Publishing & export", level: 2 },
];

interface QA {
  q: string;
  a: string;
}

const auraBasics: QA[] = [
  {
    q: "How does Aura work?",
    a: "Aura is a web-based AI design assistant. You can generate HTML, CSS, and JavaScript designs using text prompts, reference templates and components with @, edit visually in Design Mode, and publish or export your creations. All processing happens in your browser and the cloud.",
  },
  {
    q: "Can I generate designs with Aura?",
    a: "Yes. Aura includes design generation so you can create visual content using text prompts. Pro and Max plans unlock design mode and export options.",
  },
  {
    q: "Does Aura work offline?",
    a: "No. Aura is a web-based application that requires an internet connection to access AI models and generate content. All processing happens in the cloud for the best performance and latest model access.",
  },
  {
    q: "Which AI models does Aura support?",
    a: "Aura integrates Grok 4.3, GPT-5.5, GPT-5.4, Claude Opus 4.7, Claude Sonnet 4.6, and Gemini 3.1 Pro. Pro and Max plans unlock premium Claude models for higher-quality results.",
  },
  {
    q: "What apps can Aura integrate with?",
    a: "Aura can export designs to Figma using the browser console method, and you can import designs from Figma by pasting Figma URLs. You can also export full sites as HTML/CSS/JS files to continue development in any code editor or deploy to hosting platforms like Netlify or Vercel.",
  },
  {
    q: "What are the system requirements for Aura?",
    a: "Aura is a web application that works in any modern browser. You'll need a stable internet connection and a modern web browser like Chrome, Firefox, Safari, or Edge. No downloads or installations required—just visit aura.build and start creating.",
  },
  {
    q: "Can I try Aura before purchasing?",
    a: "Yes. Start a 3-day Pro, Max, or Ultra trial with 20 trial prompts. A payment method is required, and you will not be charged if you cancel before the trial ends.",
  },
];

const pricingBilling: QA[] = [
  {
    q: "What pricing plans does Aura offer?",
    a: "Aura starts with a 3-day Pro, Max, or Ultra trial that includes 20 trial prompts. Paid plans then increase monthly message limits: Pro has 120, Max has 240, Ultra has 560, and Elite has 1,080.",
  },
  {
    q: "How do message limits work?",
    a: "All AI models (Grok, GPT, Claude, Gemini) count toward the same usage limit. Pro, Max, and Ultra trials include 20 trial prompts, Pro gets 120 monthly messages after trial, Max gets 240, Ultra gets 560, and Elite gets 1,080.",
  },
  {
    q: "How does the trial work?",
    a: "Pro, Max, and Ultra start with a 3-day trial and 20 trial prompts. A payment method is required to start; cancel before the trial ends to avoid being charged.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. Upgrades apply immediately; downgrades take effect at the next billing cycle.",
  },
  {
    q: "Do unused messages roll over to the next month?",
    a: "No. Message allowances reset each billing cycle for all plans.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Major credit cards and Apple Pay via Stripe are supported for subscriptions.",
  },
];

const featuresWorkflow: QA[] = [
  {
    q: "How do I use @ to reference templates and components?",
    a: "Use @ in prompts to pull in templates, components, or snippets—up to ~100,000 characters of context. Shift-click to reference multiple items at once.",
  },
  {
    q: "Can I create multi-page websites with Aura?",
    a: "Yes. Build as many pages as you need, link elements for navigation, add page transitions, and keep shared components consistent across the site.",
  },
  {
    q: "How do I use this template?",
    a: 'Free or Pro templates can be remixed with the "Use for Free" or "Use as Pro" button. Paid templates require using the author\'s "Buy" link to get access.',
  },
  {
    q: "Can I customize this template?",
    a: "Yes. After remixing or purchasing, you can change colors, fonts, images, layout, and content, or edit the code directly with prompts.",
  },
  {
    q: "Do I need Pro to use this template?",
    a: "Premium templates require a Pro subscription. Paid templates require purchasing from the author regardless of your plan.",
  },
  {
    q: "Can I remix or share my version?",
    a: "Yes. You can remix templates to create your own version and share your remixes with the community; credit stays with you.",
  },
  {
    q: "Why do elements vanish in Design/Code view?",
    a: "Heavy animations can hide elements. Remove or simplify them, or use the built-in Animate Keyframe/Animate on Scroll snippets optimized for the editor.",
  },
  {
    q: "What's different from Lovable?",
    a: "Aura focuses on Tailwind-based design output: real HTML/CSS/JS, 1,700+ templates, 1,400+ components, multi-page sites, and visual editing. Lovable is more full-stack app–oriented.",
  },
  {
    q: "What's different from Framer, Webflow, or Figma Sites?",
    a: "Aura outputs standard HTML, Tailwind CSS, and vanilla JS—no proprietary runtime. You can export, self-host, or keep editing in any code editor or Figma.",
  },
  {
    q: "Am I tied to Aura when I design and publish?",
    a: "No, it's just HTML and you can convert to Figma using our tool, Framer using their plugin and other popular platforms that use HTML.",
  },
  {
    q: "Can you import fonts that aren't inside of Aura?",
    a: "Yes, you can just mention the font name in the prompt. Or you can do so in the code. As long as it's an online font like Google Fonts, or a URL it'll work.",
  },
  {
    q: "My project is resource-intensive and the screen freezes when I try to make changes. What should I do?",
    a: 'If your page is freezing when trying to make changes, go to Home and click on "Iterations" next to Chat. Hover over the iteration and click on Delete. Before deleting, please copy your code as a backup to avoid any data loss. To optimize your project without editing code, create a new project and rebuild the page with simpler structure.',
  },
  {
    q: "Why doesn't Aura remember my previous page selections when I switch to a new page?",
    a: "Currently, Aura only processes the page you are actively viewing in the editor and does not retain context from previous pages or maintain a full build history. This is intentional to keep performance optimal and avoid overloading the system with too much context. However, when working on a multi-page site, you can switch between pages using the Pages panel and Aura will load the selected page for editing.",
  },
  {
    q: "How do I design each page separately in Aura and combine them?",
    a: 'You can prompt and design each page separately in Aura. To connect the pages, use the "Link" feature—right-click an element and choose "Copy," then go to the target page and use "Paste to Replace" as needed. This helps transfer sections or navigation elements across pages. If this doesn\'t fully work, you can also publish each page separately and link them via the published URLs.',
  },
  {
    q: "I'm trying to add custom logos to the landing page I'm building but I can't figure out how to upload my own assets.",
    a: "Currently, direct SVG uploads aren't supported yet. You can, however, copy the SVG code from your file and include it directly in your prompt—even multiple SVGs at once. Alternatively, you could upload your SVG files to an external hosting platform (or FTP server) and reference the URL in your design.",
  },
];

const seoPublishing: QA[] = [
  {
    q: "How do I add SEO to my Aura website?",
    a: "Open the Publish popover, switch to the SEO tab, choose Home or a specific page, then fill in the title, keywords, description, favicon, and any page-specific overrides before publishing.",
  },
  {
    q: "Do I need to edit the website header manually?",
    a: "No. For normal SEO metadata, use the Publish SEO tab. Aura stores SEO fields with the published project so they survive republishing, page changes, and domain updates.",
  },
  {
    q: "Can I customize SEO for each page?",
    a: "Yes. Use the Page dropdown inside the SEO tab. Home works as the site default, and individual pages can have their own title, keywords, description, and social preview image.",
  },
  {
    q: "What should I write in the SEO title?",
    a: "Write a clear promise for the specific page, then add the brand when it helps recognition. Avoid generic titles like Home, Landing Page, or Page 1.",
  },
  {
    q: "What should I check after publishing?",
    a: "Check the public page, robots.txt, sitemap.xml, and llms.txt when available. Then verify the domain in Google Search Console, submit the sitemap, and inspect the most important URLs.",
  },
  {
    q: "Does a custom domain help SEO?",
    a: "A custom domain is not a ranking strategy by itself, but it gives the site a memorable canonical home. Pick one primary host and use it consistently in links, Search Console, and the sitemap.",
  },
];

const publishingExport: QA[] = [
  {
    q: "Can I export this template?",
    a: "Yes. After remixing and customizing, you can export as HTML or send to Figma. Export options are available in the editor.",
  },
  {
    q: "Can I export my site designs out of Aura?",
    a: "Yes. Export full sites as HTML/CSS/JS, publish to subdomains, or export to Figma. All output is standard code you can continue anywhere.",
  },
  {
    q: "How do I add my own domain?",
    a: "Export your site, deploy to Netlify or Vercel, then configure your custom domain and DNS in their dashboards.",
  },
  {
    q: "How do I build multiple pages?",
    a: "Create pages in the Pages popover, link elements to pages, and manage navigation. Duplicating a page doesn't auto-create new ones—you add them explicitly.",
  },
  {
    q: "Where should I host my landing page?",
    a: "Export HTML and drag-and-drop to Netlify or Vercel. Both have quick, low-setup hosting with free plans.",
  },
  {
    q: "Where do form submissions go?",
    a: "Forms are empty by default. Connect actions to Netlify Forms, Formspree, Getform, or Google Forms (a few lines of JS) to store submissions.",
  },
  {
    q: "What happens to Unicorn Studio animations if servers go down?",
    a: "Animated Unicorn Studio assets are hosted on Unicorn Studio by default. If you'd prefer to self-host the assets for more control or reliability, you can follow their official guide: https://www.unicorn.studio/docs/faqs/",
  },
];

function FAQItem({ item }: { item: QA }) {
  return (
    <details className="docs-faq">
      <summary className="docs-faq-q">{item.q}</summary>
      <div className="docs-faq-a">
        <DocP>{item.a}</DocP>
      </div>
    </details>
  );
}

function FAQSection({ id, title, intro, items }: { id: string; title: string; intro: string; items: QA[] }) {
  return (
    <>
      <DocH2 id={id}>{title}</DocH2>
      <DocP>{intro}</DocP>
      <div className="docs-faq-list">
        {items.map((item, i) => (
          <FAQItem key={i} item={item} />
        ))}
      </div>
    </>
  );
}

export const faqContent: LearnPageContent = {
  slug: "faq",
  title: "Frequently Asked Questions",
  description: "Common questions about the Aura Library.",
  group: "resources",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Frequently Asked Questions</DocH1>
        <DocLead>
          Answers to every question collected from our product, pricing, and template pages—organized in one place so you can move faster.
        </DocLead>
      </header>

      <FAQSection
        id="aura-basics"
        title="Aura basics"
        intro="Core questions about how Aura works, which models it supports, and how you can get started."
        items={auraBasics}
      />

      <FAQSection
        id="pricing-billing"
        title="Pricing & billing"
        intro="Plan details, limits, and billing controls drawn from the Pricing and core FAQ content."
        items={pricingBilling}
      />

      <FAQSection
        id="features-workflow"
        title="Features & workflow"
        intro="Everything about templates, the editor, and how Aura differs from other tools."
        items={featuresWorkflow}
      />

      <FAQSection
        id="seo-publishing"
        title="SEO & publishing"
        intro="How to add search metadata before publishing and customize it for each page."
        items={seoPublishing}
      />

      <FAQSection
        id="publishing-export"
        title="Publishing & export"
        intro="How to publish, export, host, and connect forms or domains for your projects."
        items={publishingExport}
      />

      <DocP>
        <strong>Still need help?</strong> Reach out and we'll get back quickly.{" "}
        <DocLink href="mailto:meng@designcode.io">Contact support →</DocLink>
      </DocP>
    </article>
  ),
};
