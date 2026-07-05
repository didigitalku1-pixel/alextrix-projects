import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const documentationContent = {
  slug: "documentation",
  title: "Documentation",
  description:
    "Complete reference for the Aura Library: page structure, URL conventions, the public API for items and tags, and how to integrate the library into your own tools.",
  group: "resources" as const,
  body: () => (
    <>
      <p className="learn-lead">
        This page is the technical reference for Aura Library. It covers
        the page structure, the URL conventions, the public API endpoints
        you can call from your own tools, and the integration patterns we
        recommend. For narrative walkthroughs, see the Getting Started
        pages instead.
      </p>

      <Section title="Page structure">
        <p>
          The site is a Next.js 16 application. The route tree maps cleanly
          to the user-facing structure:
        </p>
        <ul>
          <li><Code>/</Code> — the home page, with tabs for templates, components, assets, and skills.</li>
          <li><Code>/design-systems</Code> — the design system file library.</li>
          <li><Code>/learn/&lt;slug&gt;</Code> — the page you are reading now, plus the other 12 learn pages.</li>
          <li><Code>/templates/&lt;slug&gt;</Code>, <Code>/components/&lt;slug&gt;</Code>, <Code>/assets/&lt;slug&gt;</Code>, <Code>/skills/&lt;slug&gt;</Code> — detail pages for each item type.</li>
          <li><Code>/api/...</Code> — public JSON API for programmatic access.</li>
        </ul>
      </Section>

      <Section title="URL conventions">
        <p>
          Slugs are kebab-case and unique within their item type. Detail
          pages accept the slug as a path parameter; the home page accepts
          a <Code>tab</Code> query parameter to switch the active list
          (e.g. <Code>/?tab=templates</Code>). The learn section uses
          semantic slugs (<Code>introduction</Code>, <Code>faq</Code>,
          etc.) that match the sidebar entries.
        </p>
        <Tip>
          The home page tab parameter is bookmarkable. If you find
          yourself returning to a particular view — say, &quot;recently added
          templates, dark mode&quot; — copy the URL and use it as your starting
          point next time.
        </Tip>
      </Section>

      <Section title="Public API">
        <p>
          The library exposes a small read-only JSON API. All endpoints
          return CORS-enabled JSON and require no authentication for
          read-only access.
        </p>
        <Subsection title="List items">
          <p>
            <Code>GET /api/items?type=templates&amp;limit=20&amp;offset=0</Code>
          </p>
          <p>
            Returns a paginated list of items. Supported query parameters:
          </p>
          <ul>
            <li><Code>type</Code> — one of <Code>templates</Code>, <Code>components</Code>, <Code>assets</Code>, <Code>skills</Code></li>
            <li><Code>tag</Code> — filter by tag (case-insensitive)</li>
            <li><Code>q</Code> — full-text search across name, description, and tags</li>
            <li><Code>limit</Code> — page size, default 20, max 100</li>
            <li><Code>offset</Code> — pagination offset, default 0</li>
          </ul>
        </Subsection>
        <Subsection title="Get a single item">
          <p>
            <Code>GET /api/item/&lt;type&gt;/&lt;id&gt;</Code>
          </p>
          <p>
            Returns the full item record including metadata, tags, source
            attribution, and a URL to the raw file content. The response
            shape is stable across item types.
          </p>
        </Subsection>
        <Subsection title="List tags">
          <p>
            <Code>GET /api/tags</Code>
          </p>
          <p>
            Returns the full tag index with item counts. Useful for
            building faceted search UIs or for discovering which tags are
            most common.
          </p>
        </Subsection>
        <Subsection title="Stats">
          <p>
            <Code>GET /api/stats</Code>
          </p>
          <p>
            Returns aggregate counts — total items, items per type, items
            added in the last 7 days. Useful for landing page badges and
            for monitoring library growth.
          </p>
        </Subsection>
      </Section>

      <Section title="Response shapes">
        <p>
          A single item response looks like this (abridged):
        </p>
        <pre className="learn-code-block"><code>{`{
  "id": "nova-os-landing-page",
  "type": "templates",
  "name": "Nova OS Landing Page",
  "description": "A futuristic SaaS landing page with a hero animation.",
  "tags": ["saas", "dark", "hero", "landing"],
  "category": "landing-pages",
  "source": {
    "name": "aura.build",
    "url": "https://aura.build/...",
    "license": "MIT"
  },
  "preview": "/templates/nova-os-landing-page",
  "file": "/api/item-file?type=templates&id=nova-os-landing-page",
  "createdAt": "2026-06-21T10:14:00Z",
  "updatedAt": "2026-07-04T18:22:00Z"
}`}</code></pre>
      </Section>

      <Section title="Embedding previews">
        <p>
          Every detail page renders its preview inside an isolated iframe.
          If you want to embed a preview in your own page, the simplest
          approach is to load the item&apos;s file URL inside an iframe on
          your domain. The files are plain HTML with no external
          dependencies beyond Tailwind via CDN, so they work anywhere a
          browser can render HTML.
        </p>
        <Callout title="Rate limits">
          <p>
            The API is rate-limited to 60 requests per minute per IP. If
            you need higher limits for a production integration, contact
            the library maintainer — there is no formal program, but
            case-by-case exceptions are common.
          </p>
        </Callout>
      </Section>

      <Section title="Integration patterns">
        <Subsection title="CLI import">
          <p>
            A small shell script that calls <Code>/api/items</Code> with a
            tag filter and downloads the matching files is enough to mirror
            a subset of the library locally. Schedule it with cron for a
            daily sync.
          </p>
        </Subsection>
        <Subsection title="Editor snippet">
          <p>
            For VS Code and similar editors, you can wire a keyboard
            shortcut to fetch a component by name from the API and insert
            its source into the current file. This is especially useful
            for components you reach for often — buttons, cards, inputs.
          </p>
        </Subsection>
        <Subsection title="AI tool context">
          <p>
            The skill files in the library are designed to be pasted into
            AI prompts. Combine the API with a small script that fetches a
            skill file by name and writes it to your clipboard, so you can
            drop it into Claude or GPT in one keystroke.
          </p>
        </Subsection>
      </Section>
    </>
  ),
};
