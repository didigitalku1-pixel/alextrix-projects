import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI,
  DocFeatureBlock, DocProTip, DocLink, DocNote,
} from "../_components/Doc";

/* ============================================================================
   SEO Settings — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/seo-settings.
   ========================================================================== */

const tocItems = [
  { id: "overview", label: "How to Add SEO", level: 2 },
  { id: "short-answer", label: "Short Answer", level: 2 },
  { id: "behind-scenes", label: "Behind the Scenes", level: 2 },
  { id: "titles", label: "Titles", level: 2 },
  { id: "descriptions", label: "Descriptions", level: 2 },
  { id: "page-specific", label: "Page-Specific SEO", level: 2 },
  { id: "content-match", label: "Match Metadata", level: 2 },
  { id: "domains", label: "Domains", level: 2 },
  { id: "images", label: "Images and Previews", level: 2 },
  { id: "search-console", label: "Search Console", level: 2 },
  { id: "crawler-checks", label: "Indexing Checks", level: 2 },
  { id: "measure", label: "Measure", level: 2 },
  { id: "launch-checklist", label: "Launch Checklist", level: 2 },
  { id: "references", label: "References", level: 2 },
];

const googleRefs = [
  { name: "Google Search Essentials", href: "https://developers.google.com/search/docs/essentials" },
  { name: "Google SEO Starter Guide", href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
  { name: "Verify your site ownership in Search Console", href: "https://support.google.com/webmasters/answer/9008080?hl=en" },
  { name: "URL Inspection tool", href: "https://support.google.com/webmasters/answer/9012289?hl=en" },
  { name: "Build and submit a sitemap", href: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
  { name: "Canonical URL guidance", href: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" },
];

const faqItems = [
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

export const seoSettingsContent: LearnPageContent = {
  slug: "seo-settings",
  title: "SEO Settings",
  description: "The metadata every published page should include.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>How to Add SEO to Your Aura Website</DocH1>
        <DocLead>
          Do not edit the website header by hand for normal SEO metadata. In Aura, the right place is the Publish popover: open SEO, choose the page, and write metadata that matches the public website.
        </DocLead>
      </header>

      {/* ===== How to Add SEO (overview) ===== */}
      <DocH2 id="overview">How to Add SEO to Your Aura Website</DocH2>
      <DocP>
        The short answer is simple: do not edit the website header by hand for normal SEO metadata. In Aura, the right place is the Publish popover. Open Publish, switch to the SEO tab, choose the page, and edit the title, keywords, description, favicon…
      </DocP>
      <DocP>
        SEO is not a single tag. It is a relationship between the public URL, the page title, the visible content, the preview image, the canonical domain, the sitemap, the robots file, and the way Google can crawl the final page.
      </DocP>
      <DocP>
        Aura already has a dedicated SEO tab in the publishing flow and crawler-facing support for project-domain robots.txt, sitemap.xml, llms.txt, metadata injection, and analytics scripts. The real work is choosing metadata and site structure that help search engines and people understand the page.
      </DocP>

      {/* ===== Short Answer ===== */}
      <DocH2 id="short-answer">The Short Answer in Aura</DocH2>
      <DocP>When someone asks how to add SEO to an Aura website:</DocP>
      <DocUL>
        <DocLI>Open the Aura project.</DocLI>
        <DocLI>Click Publish.</DocLI>
        <DocLI>Open the SEO tab.</DocLI>
        <DocLI>Choose Home or a specific page from the Page dropdown.</DocLI>
        <DocLI>Fill in Title, Keywords, and Description.</DocLI>
        <DocLI>Upload a favicon if the project needs one.</DocLI>
        <DocLI>Publish the site.</DocLI>
      </DocUL>
      <DocP>
        Aura can generate basic metadata, but generated SEO should be treated like a first draft. It may understand the visual intent of the page, but it does not always know the market, buyer, category, brand positioning, or phrases people use when they search.
      </DocP>
      <DocP>
        Use the Home option as the default SEO for the site. Then override individual pages when their search intent is different. If a page would deserve a different search result on Google, it deserves different SEO in Aura.
      </DocP>

      {/* ===== Behind the Scenes ===== */}
      <DocH2 id="behind-scenes">What Aura Publishes Behind the Scenes</DocH2>
      <DocP>The current Aura publishing flow stores the important SEO pieces separately from the design files:</DocP>
      <DocUL>
        <DocLI>Project title and description</DocLI>
        <DocLI>Default SEO title, description, and keywords</DocLI>
        <DocLI>Page-specific SEO overrides</DocLI>
        <DocLI>Social preview image data</DocLI>
        <DocLI>Light and dark favicons</DocLI>
        <DocLI>Google Analytics or Google Tag Manager IDs</DocLI>
        <DocLI>Custom domain and public visibility</DocLI>
      </DocUL>
      <DocP>
        That separation matters because a published website has two audiences: people who see the page itself, and crawlers or preview bots that need reliable metadata before rendering a search result, social card, link preview, or indexed URL.
      </DocP>
      <DocP>
        You still need strong visible content on the page. Metadata can influence how a result appears, but it cannot compensate for a page that is vague, thin, inaccessible, or disconnected from the search query.
      </DocP>

      {/* ===== Titles ===== */}
      <DocH2 id="titles">Write Titles Like Promises, Not Labels</DocH2>
      <DocP>
        The title is usually the most important field you will write in the SEO tab. It becomes the strongest hint for the search result title, browser tab, saved bookmarks, and link previews.
      </DocP>
      <DocP muted>Weak labels:</DocP>
      <DocUL>
        <DocLI>Home</DocLI>
        <DocLI>Landing Page</DocLI>
        <DocLI>SaaS Template</DocLI>
        <DocLI>My Portfolio</DocLI>
      </DocUL>
      <DocP muted>Strong promises:</DocP>
      <DocUL>
        <DocLI>Flowly - SaaS Workflow Builder Template</DocLI>
        <DocLI>Private Chef Portfolio for Luxury Events</DocLI>
        <DocLI>AI Resume Builder for Product Managers</DocLI>
        <DocLI>Singapore Wedding Photographer With Editorial Style</DocLI>
      </DocUL>
      <DocP>Use this formula for most Aura pages:</DocP>
      <DocP muted>Page-specific promise - brand or site name</DocP>
      <DocP>Keep the title readable. Do not turn it into a pile of keywords. A person should be able to scan it and understand why the page exists.</DocP>

      {/* ===== Descriptions ===== */}
      <DocH2 id="descriptions">Write Descriptions That Sell the Click</DocH2>
      <DocP>
        The description field should explain what the page is, who it is for, and why someone should click. A good description is the tiny sales pitch that sits under the search result.
      </DocP>
      <DocP muted>Use this pattern:</DocP>
      <DocP>For [audience], this page helps you [outcome] with [specific proof, format, or feature].</DocP>

      <DocFeatureBlock title="Title">
        Use the actual promise of the page, not a file label. Put the specific topic near the front and include the brand when it improves recognition.
      </DocFeatureBlock>
      <DocFeatureBlock title="Description">
        Explain what the page is, who it is for, and why someone should click. Keep it specific without making it sound mechanical.
      </DocFeatureBlock>
      <DocFeatureBlock title="Keywords">
        Use a short comma-separated topic list that actually matches the page. Treat keywords as support, not as a replacement for useful page copy.
      </DocFeatureBlock>
      <DocP>Before publishing, read your title and description together. Ask whether the result would feel specific, trustworthy, and meaningfully different beside competitors.</DocP>

      {/* ===== Page-Specific SEO ===== */}
      <DocH2 id="page-specific">Use Page-Specific SEO for Multi-Page Sites</DocH2>
      <DocP>
        Aura's SEO tab has a Page dropdown. This is easy to miss, but it is the difference between basic SEO and useful SEO. Home is the broad default. Important pages should get their own search result.
      </DocP>
      <DocP>
        Use page-specific SEO when a page targets a different query, audience, question, share preview, or buying intent.
      </DocP>

      {/* ===== Match Metadata ===== */}
      <DocH2 id="content-match">Make the Page Match the Metadata</DocH2>
      <DocP>
        Metadata works best when it agrees with the page. If the SEO title says "AI Website Builder for SaaS Startups," the page should visibly include those ideas in natural places.
      </DocP>
      <DocUL>
        <DocLI>The H1 or main hero heading</DocLI>
        <DocLI>The opening paragraph</DocLI>
        <DocLI>Section headings</DocLI>
        <DocLI>Alt text for relevant images</DocLI>
        <DocLI>Button and link labels</DocLI>
        <DocLI>FAQ questions</DocLI>
        <DocLI>Case studies or examples</DocLI>
      </DocUL>
      <DocP>
        Do not hide all important meaning inside images. Aura can make beautiful visuals, but search engines need text they can read. For AI answer engines, clear headings, direct answers, visible facts, and well-structured sections make the page easier to understand and cite.
      </DocP>

      {/* ===== Domains ===== */}
      <DocH2 id="domains">Domains, Slugs, Canonicals, and Duplicates</DocH2>
      <DocP>
        Domain choices affect how people remember your site and how consistently search engines see your URLs. Pick one primary host and use it consistently in links, social profiles, email signatures, ads, and Search Console.
      </DocP>
      <DocP>For Aura projects, a practical domain strategy is:</DocP>
      <DocUL>
        <DocLI>Use the Aura subdomain while drafting and sharing internally.</DocLI>
        <DocLI>Move serious public projects to a memorable custom domain when the site is ready.</DocLI>
        <DocLI>Verify the domain in Google Search Console.</DocLI>
        <DocLI>Submit the sitemap for the canonical domain.</DocLI>
        <DocLI>Link to the canonical domain everywhere.</DocLI>
        <DocLI>Avoid public duplicate copies on multiple hosts unless canonicalization is handled deliberately.</DocLI>
      </DocUL>
      <DocP>The domain is not the SEO strategy, but it is the address where the strategy compounds.</DocP>

      {/* ===== Images and Previews ===== */}
      <DocH2 id="images">Images, Favicons, and Social Previews</DocH2>
      <DocP>
        Aura's publish flow can capture preview images, upload preview assets, and let you add social image URLs for page-specific SEO. It also supports light and dark favicons in the SEO tab.
      </DocP>
      <DocP>
        Images need two things for SEO: relevance and context. Use real page screenshots or product visuals when possible, keep social-card text minimal and readable, and choose favicons that stay recognizable at 16x16 and 32x32.
      </DocP>
      <DocP>
        If you add a page-specific Social Image URL in Aura, use an image that matches that page. A pricing page should not use a generic homepage hero image if the pricing page is what people will share.
      </DocP>

      {/* ===== Search Console ===== */}
      <DocH2 id="search-console">Search Console Setup After Publishing</DocH2>
      <DocP>
        Google Webmaster Tools is now Google Search Console. After publishing an Aura site, Search Console is where you verify ownership, submit sitemaps, inspect URLs, and watch how Google sees your pages.
      </DocP>
      <DocUL>
        <DocLI>Go to Google Search Console.</DocLI>
        <DocLI>Add a Domain property for your root domain, such as example.com.</DocLI>
        <DocLI>Copy the TXT verification record.</DocLI>
        <DocLI>Add it at your DNS provider.</DocLI>
        <DocLI>Wait for DNS propagation.</DocLI>
        <DocLI>Click Verify in Search Console.</DocLI>
        <DocLI>Submit your sitemap.</DocLI>
        <DocLI>Inspect the homepage URL.</DocLI>
        <DocLI>Request indexing for the most important pages.</DocLI>
      </DocUL>
      <DocP>
        Search Console tells you how the site appears in Google Search. Google Analytics tells you what people do after they arrive. Use both when the site is important.
      </DocP>

      {/* ===== Indexing Checks ===== */}
      <DocH2 id="crawler-checks">Sitemaps, Robots, and Indexing Checks</DocH2>
      <DocP>
        For published project domains, Aura's edge layer can serve robots.txt, sitemap.xml, and llms.txt. Those files help crawlers understand what they are allowed to fetch and which URLs matter.
      </DocP>
      <DocFeatureBlock title="robots.txt">
        Tells crawlers what they may request. It is not a secure way to hide private content.
      </DocFeatureBlock>
      <DocFeatureBlock title="sitemap.xml">
        Lists URLs you want search engines to know about, using fully qualified absolute URLs.
      </DocFeatureBlock>
      <DocFeatureBlock title="llms.txt">
        Gives AI tools a concise map of the site for answer-engine readability.
      </DocFeatureBlock>
      <DocP muted>After publishing, check these URLs on the canonical host:</DocP>
      <DocUL>
        <DocLI><code>https://yourdomain.com/robots.txt</code></DocLI>
        <DocLI><code>https://yourdomain.com/sitemap.xml</code></DocLI>
        <DocLI><code>https://yourdomain.com/llms.txt</code> if available</DocLI>
      </DocUL>
      <DocP>
        For new sites, indexing takes time. Publishing and submitting a sitemap does not guarantee instant ranking. It simply removes avoidable friction.
      </DocP>

      {/* ===== Measure ===== */}
      <DocH2 id="measure">Measure, Learn, and Improve</DocH2>
      <DocP>
        SEO is not finished on publish day. Publish day is when the feedback loop starts. Search Console can show queries, impressions, click-through behavior, indexing state, canonical choices, and page issues. Analytics can show engagement, sources, CTA clicks, and bounce.
      </DocP>
      <DocP muted>Then improve the page:</DocP>
      <DocUL>
        <DocLI>Rewrite titles with clearer intent.</DocLI>
        <DocLI>Make descriptions more specific.</DocLI>
        <DocLI>Add real examples and proof.</DocLI>
        <DocLI>Add an FAQ section.</DocLI>
        <DocLI>Add internal links.</DocLI>
        <DocLI>Improve image alt text.</DocLI>
        <DocLI>Make the hero clearer.</DocLI>
        <DocLI>Remove empty marketing language.</DocLI>
        <DocLI>Add location terms for local pages.</DocLI>
        <DocLI>Update stale screenshots or pricing references.</DocLI>
      </DocUL>
      <DocP>
        SEO rewards compounding clarity. A one-page Aura site can rank if it answers a specific problem better than the alternatives. A large site can fail if every page says vague things in a beautiful layout.
      </DocP>

      {/* ===== Launch Checklist ===== */}
      <DocH2 id="launch-checklist">A Practical Launch Checklist</DocH2>
      <DocP>Before publishing an Aura site for search, run this checklist:</DocP>
      <DocUL>
        <DocLI>The homepage has a specific title, not just the brand name.</DocLI>
        <DocLI>Every important page has a unique title and description.</DocLI>
        <DocLI>Keywords are comma-separated and not stuffed.</DocLI>
        <DocLI>The visible H1 agrees with the SEO title.</DocLI>
        <DocLI>The page copy includes real audience, category, and offer language.</DocLI>
        <DocLI>Images appear near relevant text and have useful alt text when exported or edited.</DocLI>
        <DocLI>The favicon is recognizable in small browser tabs.</DocLI>
        <DocLI>The social preview image is readable when cropped.</DocLI>
        <DocLI>The page is public, not private.</DocLI>
        <DocLI>The custom domain is the URL you want people to share.</DocLI>
        <DocLI>You chose one canonical host, such as example.com or www.example.com.</DocLI>
        <DocLI>The sitemap loads at the canonical domain.</DocLI>
        <DocLI>robots.txt is not blocking the site.</DocLI>
        <DocLI>Search Console ownership is verified.</DocLI>
        <DocLI>The sitemap is submitted in Search Console.</DocLI>
        <DocLI>The homepage and key pages pass URL Inspection.</DocLI>
        <DocLI>Google Analytics or GTM is added only if you need behavior tracking.</DocLI>
        <DocLI>The site has links from places real users can find it.</DocLI>
      </DocUL>
      <DocP>
        The main insight is this: Aura already gives you the publishing surface for SEO. The leverage comes from using it like a strategist, not a form filler.
      </DocP>

      {/* ===== References ===== */}
      <DocH2 id="references">Official References</DocH2>
      <DocP>Useful Google references for this workflow:</DocP>
      <div className="docs-registrar-grid">
        {googleRefs.map((r) => (
          <a key={r.href} href={r.href} className="docs-registrar-card" target="_blank" rel="noopener noreferrer">
            <span className="docs-registrar-name">{r.name}</span>
            <span className="docs-registrar-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </span>
          </a>
        ))}
      </div>

      {/* ===== FAQ ===== */}
      <DocH2 id="seo-faq">SEO FAQ</DocH2>
      {faqItems.map((item, i) => (
        <details key={i} className="docs-faq">
          <summary className="docs-faq-q">{item.q}</summary>
          <div className="docs-faq-a">
            <DocP>{item.a}</DocP>
          </div>
        </details>
      ))}
    </article>
  ),
};
