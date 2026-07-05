import { Section, Subsection, Tip, Callout, Code, Step } from "../_components/blocks";

export const sellingTemplatesContent = {
  slug: "selling-templates",
  title: "Selling Templates",
  description:
    "What you can and cannot do with items from the library if you plan to sell them, plus a practical workflow for packaging and shipping a commercial product.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Many of the templates and components in this library are suitable as
        the starting point for a commercial product — a paid landing page
        bundle, a UI kit, a Notion-style site template, or a starter theme.
        This page covers the practical side: licensing, packaging, and what
        to do before you put a price tag on your work.
      </p>

      <Section title="Licensing basics">
        <p>
          Items in the library are collected from multiple sources. Each
          item&apos;s detail page lists its source and license. Before you sell
          anything built on top of an item, check that license carefully.
          Most items use permissive licenses (MIT, Apache 2.0, CC0) that
          allow commercial use with attribution; some may use CC-BY, which
          requires attribution in the product itself; a small number may be
          &quot;personal use only&quot; and cannot be resold.
        </p>
        <Callout title="When in doubt, ask">
          <p>
            If a license is unclear or you are not sure whether your use case
            qualifies, contact the original author. Most are happy to grant
            commercial rights in exchange for a small fee or a credit link.
            Keeping a written record of these permissions protects you if
            questions come up later.
          </p>
        </Callout>
      </Section>

      <Section title="What adds value beyond the source">
        <p>
          Buyers rarely pay for a template they could download for free from
          the same source you used. To make a product worth paying for, add
          something on top:
        </p>
        <Subsection title="Curation">
          <p>
            A bundle of 20 templates that work together visually is worth
            more than 20 templates downloaded separately. Curate around a
            theme — &quot;startup landing pages&quot;, &quot;agency portfolios&quot;,
            &quot;SaaS pricing pages&quot; — and document why each one is in the
            bundle.
          </p>
        </Subsection>
        <Subsection title="Customization">
          <p>
            Swap in a distinctive color palette, typography system, and
            component set so the result does not look like the source.
            Buyers want something that feels like theirs, not like a remix
            of a public template.
          </p>
        </Subsection>
        <Subsection title="Documentation and support">
          <p>
            A short setup guide, a list of which Tailwind classes control
            which colors, and a contact email for support turn a folder of
            files into a product. This is often the difference between a
            $19 sale and a $99 sale.
          </p>
        </Subsection>
        <Subsection title="Variants and presets">
          <p>
            Ship multiple color schemes, multiple hero variants, and a dark
            mode out of the box. Buyers love options, and each variant is
            cheap to produce once the base layout is solid.
          </p>
        </Subsection>
      </Section>

      <Section title="A practical packaging workflow">
        <Step n={1} title="Pick a base template">
          <p>
            Browse the library, pick a template that is 80% of what you want,
            and download it. Open it locally and confirm it runs without
            errors.
          </p>
        </Step>
        <Step n={2} title="Rebrand">
          <p>
            Replace colors, fonts, and copy with your own. Use CSS custom
            properties (e.g. <Code>--color-primary</Code>) so buyers can
            rebrand in one place. Strip any remaining references to the
            original source — logos, comments, file names.
          </p>
        </Step>
        <Step n={3} title="Add the unique value">
          <p>
            This is where you make the product yours. Add the documentation,
            the variant presets, the support contact, and any bonus sections
            you promised in the sales pitch.
          </p>
        </Step>
        <Step n={4} title="Package">
          <p>
            Zip the project folder with a clear name and version. Include a{" "}
            <Code>README.md</Code> at the root with setup instructions, a{" "}
            <Code>LICENSE</Code> file documenting what buyers can and cannot
            do with your version, and a <Code>CHANGELOG.md</Code> so future
            updates are easy to ship.
          </p>
        </Step>
        <Step n={5} title="Pick a distribution channel">
          <p>
            Gumroad and Lemon Squeezy are the simplest options for digital
            products. Both handle payments, tax, and EU VAT automatically.
            For higher-volume sales, consider a self-hosted Stripe checkout
            with a fulfillment email.
          </p>
        </Step>
      </Section>

      <Section title="Pricing">
        <p>
          Pricing template bundles is more art than science. A few rules of
          thumb that tend to work: a single template with no support starts
          around $19–$29; a curated bundle of 10–20 templates with
          documentation starts at $49–$99; a full UI kit with 100+
          components and ongoing updates can support $149–$299. The market
          is willing to pay for perceived effort — a polished landing page
          with thoughtful copy and a clear story commands a premium over a
          folder of generic sections.
        </p>
        <Tip>
          Start higher than you think you should. It is much easier to run
          a sale or lower a price than to raise one. Early buyers at a
          higher price also tend to be the most engaged and provide the
          best feedback for improving the product.
        </Tip>
      </Section>

      <Section title="What to avoid">
        <ul>
          <li>
            <strong>Don&apos;t resell items as-is.</strong> Even when the license
            allows it, buyers will recognize public templates and ask for
            refunds. Always add value.
          </li>
          <li>
            <strong>Don&apos;t strip attribution that the license requires.</strong>{" "}
            MIT and CC-BY both have specific attribution requirements.
            Removing them is copyright infringement.
          </li>
          <li>
            <strong>Don&apos;t promise features you can&apos;t maintain.</strong>{" "}
            Lifetime updates sound great in marketing copy but become a
            burden six months in. Be honest about the update cadence.
          </li>
        </ul>
      </Section>
    </>
  ),
};
