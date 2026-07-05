import { Section, Subsection, Tip, Callout, Code, Step } from "../_components/blocks";

export const seoSettingsContent = {
  slug: "seo-settings",
  title: "SEO Settings",
  description:
    "The metadata every published template should include, where to put it, and how to verify search engines can read it.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Search engines and link previews read a small set of meta tags from
        your HTML to figure out what the page is about. This page covers the
        tags that matter, where to put them, and how to check that they are
        working before you publish.
      </p>

      <Section title="The essentials in the head">
        <p>
          Every page you publish should include the following tags inside the
          <Code>&lt;head&gt;</Code> element. The library&apos;s templates ship
          with placeholder values you can replace in seconds.
        </p>
        <Subsection title="Title and description">
          <p>
            The <Code>&lt;title&gt;</Code> tag controls the headline that
            appears in search results and browser tabs. Aim for 50–60
            characters. The <Code>meta name=&quot;description&quot;</Code> tag
            controls the snippet text under the title — keep it under 160
            characters and make it action-oriented.
          </p>
        </Subsection>
        <Subsection title="Canonical URL">
          <p>
            Add <Code>rel=&quot;canonical&quot;</Code> to tell search engines which
            URL is the authoritative version of a page. This prevents
            duplicate-content penalties when the same page is reachable from
            multiple URLs (for example, with and without a trailing slash).
          </p>
        </Subsection>
        <Subsection title="Open Graph and Twitter cards">
          <p>
            Open Graph tags (<Code>og:title</Code>, <Code>og:description</Code>,
            <Code> og:image</Code>, <Code>og:url</Code>) control how your
            link looks when shared on Slack, Facebook, LinkedIn, and most
            messaging apps. Twitter cards use a parallel set of{" "}
            <Code>twitter:*</Code> tags but fall back to Open Graph when
            absent — set both to be safe.
          </p>
        </Subsection>
      </Section>

      <Section title="A copy-paste head block">
        <p>
          Here is a minimal block you can drop into any template&apos;s{" "}
          <Code>&lt;head&gt;</Code> and fill in. Replace every{" "}
          <Code>{`{{placeholder}}`}</Code> with your own value.
        </p>
        <pre className="learn-code-block"><code>{`<title>{{Page title}} — {{Site name}}</title>
<meta name="description" content="{{One-sentence description of the page}}">

<!-- Canonical -->
<link rel="canonical" href="https://{{your-domain.com}}/{{path}}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="{{Page title}}">
<meta property="og:description" content="{{One-sentence description}}">
<meta property="og:url" content="https://{{your-domain.com}}/{{path}}">
<meta property="og:image" content="https://{{your-domain.com}}/og.png">
<meta property="og:site_name" content="{{Site name}}">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{Page title}}">
<meta name="twitter:description" content="{{One-sentence description}}">
<meta name="twitter:image" content="https://{{your-domain.com}}/og.png">`}</code></pre>
      </Section>

      <Section title="Structured data">
        <p>
          For specific page types — articles, products, FAQs, breadcrumbs —
          adding JSON-LD structured data helps search engines render rich
          results. Wrap a <Code>&lt;script type=&quot;application/ld+json&quot;&gt;</Code>
          block around a schema.org object describing the page. Keep the JSON
          small and focused on fields you can fill accurately; empty or
          incorrect fields can hurt more than they help.
        </p>
        <Tip>
          Google&apos;s Rich Results Test (searchgoogle.com/rich-results) is the
          fastest way to validate your structured data before publishing. Paste
          your URL or HTML and it will flag missing or invalid fields.
        </Tip>
      </Section>

      <Section title="Sitemaps and robots">
        <p>
          A sitemap helps search engines discover every page on your site.
          For a single template published on its own domain, a one-line
          sitemap is enough:
        </p>
        <pre className="learn-code-block"><code>{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://{{your-domain.com}}/</loc>
    <lastmod>{{YYYY-MM-DD}}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`}</code></pre>
        <p>
          Publish this at <Code>/sitemap.xml</Code> and reference it from{" "}
          <Code>/robots.txt</Code>:
        </p>
        <pre className="learn-code-block"><code>{`User-agent: *
Allow: /
Sitemap: https://{{your-domain.com}}/sitemap.xml`}</code></pre>
      </Section>

      <Section title="Performance is SEO">
        <p>
          Core Web Vitals are now a ranking signal. The library&apos;s templates
          are designed to score well out of the box — they ship minimal
          JavaScript, lazy-load images where appropriate, and avoid render
          blocking. A few things to check before you publish:
        </p>
        <Step n={1} title="Compress images">
          <p>
            Convert hero images to WebP or AVIF and keep them under 200KB
            where possible. Tools like Squoosh make this painless.
          </p>
        </Step>
        <Step n={2} title="Inline critical CSS">
          <p>
            For above-the-fold content, inline a small block of CSS so the
            first paint does not wait on a stylesheet request.
          </p>
        </Step>
        <Step n={3} title="Defer non-critical scripts">
          <p>
            Add <Code>defer</Code> (or <Code>async</Code>) to any script tag
            that is not required for the first paint. This keeps the main
            thread free for interactivity.
          </p>
        </Step>
      </Section>

      <Callout title="Verifying your setup">
        <p>
          Before you share a link, paste the URL into the Twitter Card
          Validator, the Facebook Sharing Debugger, and Google Search
          Console. Each tool will show you exactly what preview a viewer will
          see and flag missing tags. Fixing issues now is much easier than
          fixing them after a link has been shared a hundred times.
        </p>
      </Callout>
    </>
  ),
};
