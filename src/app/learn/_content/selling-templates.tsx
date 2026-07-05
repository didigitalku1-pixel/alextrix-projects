import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocOL, DocLI,
  DocFeatureBlock, DocStep, DocProTip, DocLink, DocNote,
} from "../_components/Doc";

/* ============================================================================
   Selling Templates — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/selling-templates.
   ========================================================================== */

const tocItems = [
  { id: "overview", label: "Overview", level: 2 },
  { id: "setting-up", label: "Setting Up for Sale", level: 2 },
  { id: "providing-access", label: "Providing Access", level: 2 },
  { id: "marketing", label: "Marketing & Growth", level: 2 },
  { id: "building-trust", label: "Building Trust", level: 2 },
  { id: "buyer-experience", label: "Buyer Experience", level: 2 },
  { id: "support-policies", label: "Support & Policies", level: 2 },
];

const platforms = [
  { name: "LemonSqueezy", href: "https://lemonsqueezy.com" },
  { name: "Polar.sh", href: "https://polar.sh" },
  { name: "Gumroad", href: "https://gumroad.com" },
];

export const sellingTemplatesContent: LearnPageContent = {
  slug: "selling-templates",
  title: "Selling Templates",
  description: "Licensing, packaging, and pricing for selling templates.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Selling Templates</DocH1>
        <DocLead>
          Learn how to monetize your designs by selling templates directly on Aura with 0% commission. Use your own payment links and keep 100% of the revenue.
        </DocLead>
      </header>

      {/* ===== Overview ===== */}
      <DocH2 id="overview">Overview</DocH2>
      <DocFeatureBlock title="0% Commission Marketplace">
        Aura allows creators to sell their high-quality templates directly to users. Unlike many other marketplaces, Aura takes 0% commission on your sales. You use your own payment processor and keep 100% of the revenue.
      </DocFeatureBlock>
      <DocP>
        <strong>How it works</strong> — Paid templates are highlighted in the marketplace with a price tag. When a user purchases your template, you provide them with a special access link that unlocks the ability to remix and customize the design.
      </DocP>

      {/* ===== Setting Up for Sale ===== */}
      <DocH2 id="setting-up">Setting Up for Sale</DocH2>
      <DocP>To sell a template, you first need to create your design in Aura. Once your design is ready, follow these steps:</DocP>
      <DocOL>
        <DocStep num={1}>Click the Publish button in the top right corner of the editor.</DocStep>
        <DocStep num={2}>In the publish dialog, click Sell Template to expand the selling options.</DocStep>
        <DocStep num={3}>Fill in the required information:</DocStep>
      </DocOL>
      <DocUL>
        <DocLI title="Price ($):">Set your desired price in USD.</DocLI>
        <DocLI title="Purchase URL:">The link to your checkout page (see recommendations below).</DocLI>
        <DocLI title="Rich Description:">A detailed description of your template. Markdown is supported.</DocLI>
      </DocUL>
      <DocP muted>Markdown Tips:</DocP>
      <DocOL>
        <DocStep num={4}>Click Publish to make your template live.</DocStep>
      </DocOL>

      <DocH4>Recommended Platforms</DocH4>
      <DocP>We recommend using one of these trusted platforms to handle payments and digital delivery:</DocP>
      <div className="docs-registrar-grid">
        {platforms.map((p) => (
          <a key={p.href} href={p.href} className="docs-registrar-card" target="_blank" rel="noopener noreferrer">
            <span className="docs-registrar-name">{p.name}</span>
            <span className="docs-registrar-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      <DocH4>Tips for Success</DocH4>
      <DocP>High-quality designs with multiple pages, fair pricing, and detailed descriptions are more likely to be featured. Aura may remove templates that do not meet quality standards.</DocP>

      {/* ===== Providing Access ===== */}
      <DocH2 id="providing-access">Providing Access</DocH2>
      <DocP>Since payments happen on your external platform, you need a way to grant access to the buyer on Aura. This is done via a unique Access URL.</DocP>

      <DocH3>1. Get the Access URL</DocH3>
      <DocOL>
        <DocStep num={1}>Go to your template's detail page while logged in as the owner.</DocStep>
        <DocStep num={2} title="Copy">Look for the golden button with a icon near the action buttons.</DocStep>
        <DocStep num={3}>Click it to copy the unique Access URL to your clipboard.</DocStep>
      </DocOL>

      <DocH3>2. Deliver to Buyer</DocH3>
      <DocP>Set up your payment provider to automatically send this URL. Include it in:</DocP>
      <DocUL>
        <DocLI>Confirmation email</DocLI>
        <DocLI>"Thank you" page or redirect</DocLI>
        <DocLI>PDF receipt / digital download</DocLI>
      </DocUL>

      <DocProTip label="Important: Link Expiration">
        Access URLs expire after 7 days for security reasons. Advise your customers to click the link and claim their access soon after purchase. Once they claim it, they have access to remix that template. If the link is expired, you can generate a new one for customers at any time.
      </DocProTip>

      {/* ===== Marketing & Growth ===== */}
      <DocH2 id="marketing">Marketing & Growth</DocH2>
      <DocP>Creating a great template is just the first step. To generate sales, you need to promote your work effectively. Here are proven strategies to succeed.</DocP>

      <DocFeatureBlock title="Craft Your Presentation">
        Your template's page is your sales pitch. Make it count:
      </DocFeatureBlock>
      <DocUL>
        <DocLI title="High-Quality Visuals:">Use clear screenshots showing the full design and key details.</DocLI>
        <DocLI title="What's Included:">Clearly list everything the buyer gets (e.g., "5 page layouts, 20+ components, mobile responsive").</DocLI>
        <DocLI title="Detailed Description:">Explain the use cases, features, and benefits of your template.</DocLI>
      </DocUL>

      <DocFeatureBlock title='The "Free Version" Strategy'>
        Build excitement by giving away a taste of your work:
      </DocFeatureBlock>
      <DocUL>
        <DocLI>Create a free version of your template (e.g., just the homepage or a single component).</DocLI>
        <DocLI>Export it as a single HTML file and share it on social media.</DocLI>
        <DocLI>Use this to drive traffic to the full paid version on Aura.</DocLI>
      </DocUL>

      <DocH4>Add Extra Value with Figma</DocH4>
      <DocP>Increase the perceived value of your template by including the Figma source file. You can easily generate this using Aura's Export to Figma feature. Mention "Figma file included" in your description to attract more buyers.</DocP>

      <DocFeatureBlock title="Launch Discounts">
        Get initial traction by offering a limited-time discount (e.g., "50% off for the first 48 hours"). Use your payment provider's coupon features to create urgency and drive early sales.
      </DocFeatureBlock>

      {/* ===== Building Trust ===== */}
      <DocH2 id="building-trust">Building Trust</DocH2>
      <DocP>Buyers are more likely to purchase from creators they trust. A complete, professional profile signals credibility and quality.</DocP>

      <DocH4>Complete Your Profile</DocH4>
      <DocP>Go to your profile settings and fill out every field. This information appears on your template pages and user profile.</DocP>
      <DocUL>
        <DocLI title="Avatar:">Use a professional photo or logo</DocLI>
        <DocLI title="User URL:">Set a custom handle (e.g., aura.build/your-brand)</DocLI>
        <DocLI title="Bio:">Describe your expertise and style</DocLI>
        <DocLI title="Links:">Add your website and location</DocLI>
      </DocUL>

      <DocH4>Grow Your Portfolio</DocH4>
      <DocP>Activity builds authority. A single template might look like an experiment, but a portfolio shows dedication.</DocP>
      <DocUL>
        <DocLI>Create multiple free templates to attract followers</DocLI>
        <DocLI>Maintain a consistent design style across your work</DocLI>
        <DocLI>Regularly update your existing templates</DocLI>
      </DocUL>

      {/* ===== Buyer Experience ===== */}
      <DocH2 id="buyer-experience">Buyer Experience</DocH2>
      <DocP>When a buyer clicks your Access URL while logged into Aura, they will see a special version of the template page.</DocP>
      <DocUL>
        <DocLI>A golden Use as Paid button appears on the template page.</DocLI>
        <DocLI>Clicking opens the editor with the full template loaded for remixing.</DocLI>
        <DocLI>Buyer can customize, export code, publish their version, or continue editing.</DocLI>
      </DocUL>

      {/* ===== Support & Policies ===== */}
      <DocH2 id="support-policies">Support & Policies</DocH2>
      <DocP>As the seller, you are responsible for providing support to your customers. Aura provides the platform, but the relationship is between you and the buyer.</DocP>

      <DocH4>Refunds</DocH4>
      <DocP>Managed entirely by you through your payment provider (e.g., issue a refund on Gumroad). Aura cannot issue refunds for third-party transactions.</DocP>

      <DocH4>Contact</DocH4>
      <DocP>Aura displays a "Contact Creator" button on the template page if your email is available, or uses the domain from your Purchase URL to direct users.</DocP>

      <DocH4>Disputes</DocH4>
      <DocP>Any disputes regarding the purchase, delivery, or quality of the template are resolved between you and the buyer.</DocP>
      <DocP>By selling on Aura, you agree to deliver the content as described and provide reasonable support to your buyers.</DocP>
    </article>
  ),
};
