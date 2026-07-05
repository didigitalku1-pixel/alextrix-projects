import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const faqContent = {
  slug: "faq",
  title: "FAQ",
  description:
    "Common questions about the Aura Library — what is in it, how to use it, what the license covers, and how to report issues.",
  group: "resources" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Answers to the questions that come up most often. If you cannot find
        what you are looking for here, the documentation page has the
        technical reference and the introduction page has the orientation
        guide.
      </p>

      <Section title="About the library">
        <Subsection title="What is Aura Library?">
          <p>
            Aura Library is a personal collection of 54,996 web design
            templates, components, assets, and skills, organized into a
            single browsable interface. It exists to give designers and
            developers a fast starting point for new projects, with real,
            runnable code rather than opaque output.
          </p>
        </Subsection>
        <Subsection title="Is Aura Library affiliated with aura.build?">
          <p>
            No. The library is an independent collection that includes items
            sourced from aura.build alongside items from other public
            sources. Each item&apos;s detail page lists its original source and
            license so you can verify provenance before using it.
          </p>
        </Subsection>
        <Subsection title="How often is the library updated?">
          <p>
            The library is updated on a rolling basis. New items are added
            as they are reviewed and tagged, and existing items are
            re-tagged or retired when better versions become available. The
            stats endpoint (<Code>/api/stats</Code>) shows how many items
            have been added in the last 7 days.
          </p>
        </Subsection>
      </Section>

      <Section title="Using items">
        <Subsection title="Can I use items from the library in commercial projects?">
          <p>
            In almost all cases, yes. The majority of items are published
            under permissive licenses (MIT, Apache 2.0, CC0) that allow
            commercial use with attribution. A small number use CC-BY,
            which requires attribution in the product itself. Always check
            the license field on the item&apos;s detail page before using it
            commercially.
          </p>
        </Subsection>
        <Subsection title="Do I need to attribute the original author?">
          <p>
            It depends on the license. MIT and Apache 2.0 require you to
            keep the license notice in the source code, but do not require
            user-facing attribution. CC-BY requires both source and
            user-facing attribution. CC0 requires neither. When in doubt,
            adding a credit link in your project&apos;s README or footer is
            always appreciated, even when not strictly required.
          </p>
        </Subsection>
        <Subsection title="Can I modify items I download?">
          <p>
            Yes. Every license represented in the library permits
            modification. You can change colors, fonts, layout, copy, and
            structure without restriction. The only thing you cannot do is
            remove attribution that the license requires.
          </p>
        </Subsection>
        <Subsection title="Can I sell items I downloaded from the library?">
          <p>
            You can sell products you build on top of library items, but
            reselling the items themselves unchanged is rarely allowed and
            almost never a good idea — buyers will recognize public
            templates. The &quot;Selling Templates&quot; page covers this in
            detail, including the value-add patterns that make a product
            worth paying for.
          </p>
        </Subsection>
      </Section>

      <Section title="Technical">
        <Subsection title="Do I need Tailwind CSS to use the items?">
          <p>
            Almost every template and component in the library uses Tailwind
            utility classes. If your project already uses Tailwind, items
            work out of the box. If it does not, the quickest path is the
            Tailwind Play CDN, which lets you prototype without a build
            step. For production, follow the official Tailwind installation
            guide for your framework.
          </p>
        </Subsection>
        <Subsection title="Do the items work with React, Vue, or other frameworks?">
          <p>
            The items ship as plain HTML and can be dropped into any
            framework that renders HTML. For React, copy the markup into a
            component and replace <Code>class</Code> with <Code>className</Code>.
            For Vue, the HTML works as-is inside a template block. For
            Svelte, the same. No framework-specific wrappers are required.
          </p>
        </Subsection>
        <Subsection title="Are the items accessible?">
          <p>
            Most items follow accessibility best practices — semantic HTML,
            alt text on images, focus-visible states on interactive
            elements, and color contrast that meets WCAG AA. That said, the
            library does not guarantee accessibility for every item. Always
            audit the items you use with a tool like axe DevTools before
            shipping to production.
          </p>
        </Subsection>
        <Subsection title="Is there an API?">
          <p>
            Yes. The library exposes a small read-only JSON API at{" "}
            <Code>/api/items</Code>, <Code>/api/item/&lt;type&gt;/&lt;id&gt;</Code>,
            <Code>/api/tags</Code>, and <Code>/api/stats</Code>. The
            documentation page has the full reference.
          </p>
        </Subsection>
      </Section>

      <Section title="AI integration">
        <Subsection title="Can I use library items with AI coding tools?">
          <p>
            Yes — that is one of the primary use cases. The skill files in
            the library are written specifically to be pasted into AI
            prompts as context. Templates and components can be pasted in
            the same way to give the model a concrete starting point. The
            &quot;Tips for Prompting&quot; page covers this in detail.
          </p>
        </Subsection>
        <Subsection title="Which AI tools work best with the library?">
          <p>
            Any tool that accepts long context and can output HTML will
            work. Claude (3.5 Sonnet and later), GPT (4 and later), and
            Gemini (2.5 Pro and later) all produce good results. The video
            tutorials page has side-by-side comparisons of the latest
            models on the same prompts.
          </p>
        </Subsection>
        <Subsection title="Why do my AI-generated designs look generic?">
          <p>
            Almost always because the prompt was too open-ended. AI tools
            default to generic output when they have nothing to anchor to.
            Pulling a specific template from the library and pasting its
            source into the prompt is the single biggest improvement you
            can make. The &quot;Tips for Prompting&quot; page has more on this.
          </p>
        </Subsection>
      </Section>

      <Section title="Reporting issues">
        <Subsection title="How do I report a broken item?">
          <p>
            Open an issue on the project&apos;s GitHub repository with a link
            to the item&apos;s detail page and a description of what is
            broken. Screenshots help. Most issues are addressed within a
            few days.
          </p>
        </Subsection>
        <Subsection title="How do I request a new item?">
          <p>
            The library does not take requests for specific items, but the
            tag index is a useful signal for what to add next. If a
            particular tag is consistently empty or under-represented, that
            is a good hint that the gap will be filled soon.
          </p>
        </Subsection>
        <Subsection title="How do I report a licensing issue?">
          <p>
            If you believe an item in the library is mislabeled or
            infringes your copyright, open an issue with the item&apos;s URL
            and the correct license information. The library takes
            licensing seriously and will remove or relabel items promptly
            once the issue is verified.
          </p>
        </Subsection>
      </Section>

      <Callout title="Still stuck?">
        <p>
          If none of the above answered your question, the documentation
          page has the technical reference and the introduction page has
          the orientation guide. For anything else, opening a GitHub
          issue is the fastest way to get help.
        </p>
      </Callout>
    </>
  ),
};
