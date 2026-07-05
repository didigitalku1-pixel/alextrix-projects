import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const introductionContent = {
  slug: "introduction",
  title: "Introduction",
  description:
    "Welcome to Aura Library — a curated home for 54,996 templates, components, assets, and skills you can browse, preview, and remix into your own projects.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Aura Library is a personal design library that brings together thousands of
        production-ready templates, UI components, visual assets, and reusable
        skill definitions in one searchable place. Whether you are building a
        landing page, a SaaS dashboard, or a marketing site, this library gives
        you a head start so you can focus on what makes your product unique.
      </p>

      <Section title="What this library is for">
        <p>
          The library exists to solve one problem: collecting and organizing the
          pieces you reach for most often when shipping web work. Instead of
          bookmarking snippets across ten different tools, everything lives in a
          single browsable interface with search, tags, and structured previews.
          You can pull a complete template as a starting point, drop in
          individual components, grab a hero image from the assets section, or
          load a skill file into your AI tool of choice.
        </p>
        <p>
          Every item in the library is real, runnable code — no proprietary
          runtime, no opaque output. Templates export as plain HTML, Tailwind
          CSS, and vanilla JavaScript, so they keep working wherever you take
          them. Components follow the same rule: copy, paste, customize, ship.
        </p>
      </Section>

      <Section title="Who the library is for">
        <Subsection title="Designers moving into code">
          <p>
            If you live in Figma but need to hand off to engineers, the
            component library gives you a shared vocabulary. Each component
            ships with a clean Tailwind implementation, so the gap between
            design intent and production code shrinks to almost nothing.
          </p>
        </Subsection>
        <Subsection title="Developers who want a faster starting line">
          <p>
            Stop rewriting the same hero section, pricing table, and footer for
            every project. Pull a template that already handles responsive
            layout, dark mode, and accessibility basics, then spend your time on
            the parts that actually differ.
          </p>
        </Subsection>
        <Subsection title="AI-assisted builders">
          <p>
            The skill files in this library are written as structured prompts
            and design system definitions. Feed them into Claude, GPT, Gemini,
            or any tool that accepts long context, and you will get output that
            matches the library&apos;s quality bar instead of generic AI slop.
          </p>
        </Subsection>
      </Section>

      <Section title="What you will find inside">
        <Subsection title="Templates">
          <p>
            Full landing pages and complete site skeletons. Each template
            includes every section you would expect — hero, features, pricing,
            testimonials, footer — wired together with consistent typography,
            spacing, and color. Use them as-is or remix sections into something
            new.
          </p>
        </Subsection>
        <Subsection title="Components">
          <p>
            Atomic building blocks: buttons, cards, forms, navigation bars,
            modals, tabs, and dozens more. Every component is self-contained,
            accessible by default, and ready to drop into any Tailwind project.
          </p>
        </Subsection>
        <Subsection title="Assets">
          <p>
            A curated library of high-resolution images, backgrounds, textures,
            and icons. Use the in-page search and filters to find the right
            visual in seconds, then download or copy the URL.
          </p>
        </Subsection>
        <Subsection title="Skills and design systems">
          <p>
            Structured markdown files that describe visual languages, motion
            systems, and component patterns. These are the same files used
            internally to keep AI-generated output consistent — now available
            for your own workflows.
          </p>
        </Subsection>
      </Section>

      <Section title="How items are organized">
        <p>
          Every item in the library is tagged with a type (template, component,
          asset, skill), a category, and a set of searchable keywords. The home
          page exposes top-level tabs for each type, and within each tab you can
          filter by category, sort by recency or popularity, and search by name
          or tag. The URL reflects your current view, so you can bookmark or
          share any filtered list.
        </p>
        <Tip>
          The fastest way to find something specific is to type a keyword into
          the search box at the top of any list page. Search matches names,
          tags, and descriptions, so even vague queries like &quot;dark hero&quot; or
          &quot;pricing table with toggle&quot; usually surface what you need.
        </Tip>
      </Section>

      <Section title="Working with the preview">
        <p>
          Click any item to open its detail page. There you will find a live
          preview rendered in an isolated frame, a device toggle for switching
          between desktop, tablet, and mobile viewports, a metadata panel with
          tags and source links, and a &quot;copy&quot; or &quot;download&quot; action depending on
          the item type. The preview is interactive — buttons, hover states,
          and animations work exactly as they would in production.
        </p>
        <Callout title="A note on copying code">
          <p>
            When you copy a component or template, you get the raw source with
            no library-specific imports. The only assumption is that your
            project already has Tailwind CSS installed. If you do not, the
            quickest path is the official Tailwind Play CDN, which lets you
            prototype before setting up a build step.
          </p>
        </Callout>
      </Section>

      <Section title="Where to go next">
        <p>
          If you are new here, start with the <Code>How to Edit Designs</Code>{" "}
          page — it walks through the preview, the device toggle, and the
          metadata panel in detail. From there, <Code>Tips for Prompting</Code>{" "}
          is useful if you plan to combine the library with an AI coding tool,
          and <Code>Custom Domain</Code> covers what you need to know if you
          want to publish a template to your own URL.
        </p>
        <p>
          For a complete reference, jump to the <Code>Documentation</Code>{" "}
          page. For common questions about licensing, attribution, and what is
          and is not allowed, see the <Code>FAQ</Code>.
        </p>
      </Section>
    </>
  ),
};
