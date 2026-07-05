import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const stylingContent = {
  slug: "prompt-for-styling",
  title: "Styling Prompting",
  description:
    "How to prompt AI tools for a coherent visual style — color tokens, spacing, borders, shadows, and the small details that separate polished designs from generic ones.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Visual style is more than color palette. It is the consistent
        application of spacing, borders, shadows, and surface treatment
        across every element on the page. This page covers the prompting
        patterns that produce designs with a recognizable style instead of
        &quot;AI default&quot;.
      </p>

      <Section title="Color tokens, not hex codes">
        <p>
          Ask the model to use semantic color tokens instead of literal hex
          codes. Tokens force consistency because the same token always
          refers to the same color, and changes only need to happen in one
          place. A minimal token set:
        </p>
        <pre className="learn-code-block"><code>{`--color-bg:           #ffffff;  /* page background */
--color-surface:      #f7f7f8;  /* card background */
--color-surface-2:    #ececee;  /* hover state */
--color-border:       #e4e4e7;  /* hairline borders */
--color-text:         #18181b;  /* primary text */
--color-text-muted:   #71717a;  /* secondary text */
--color-primary:      #4f46e5;  /* brand accent */
--color-primary-fg:   #ffffff;  /* text on brand accent */
--color-success:      #16a34a;
--color-warning:      #ea580c;
--color-danger:       #dc2626;`}</code></pre>
        <p>
          With these tokens defined, the model never picks a random hex
          value — it picks the right token for the job. Re-skinning the
          design later becomes a 30-second change to the token definitions.
        </p>
      </Section>

      <Section title="Dark mode from the start">
        <p>
          If dark mode is in scope, ask for it in the first prompt rather
          than retrofitting it later. Define a parallel set of tokens
          under a <Code>.dark</Code> selector and ask the model to use the
          same token names everywhere — never literal colors. This forces
          the model to think about both modes at once, which produces
          designs that actually look good in both.
        </p>
        <Tip>
          For dark mode, do not just invert the light palette. Surfaces
          should step up (not down) — the page background gets darker, and
          cards get slightly lighter than the background to create
          separation. Borders should be lighter than the surface, not
          darker, because dark mode has less ambient contrast.
        </Tip>
      </Section>

      <Section title="Spacing scale and rhythm">
        <p>
          Use a fixed spacing scale and forbid arbitrary values. Tailwind&apos;s
          default 4px-based scale is a good baseline:
        </p>
        <pre className="learn-code-block"><code>{`0   = 0px
1   = 4px    /* inline gaps */
2   = 8px    /* tight gaps, small padding */
3   = 12px   /* button padding */
4   = 16px   /* card padding */
6   = 24px   /* section padding (mobile) */
8   = 32px   /* section padding (tablet) */
12  = 48px   /* section padding (desktop) */
16  = 64px   /* large section break */
24  = 96px   /* hero padding */
32  = 128px  /* page-level spacing */`}</code></pre>
        <p>
          Ask the model to use only these values for padding, margin, and
          gap. The result is a page that feels measured rather than ad-hoc.
        </p>
      </Section>

      <Section title="Borders and surface treatment">
        <p>
          The single biggest tell that a design is AI-generated is
          inconsistent border treatment. Pick one approach and apply it
          everywhere:
        </p>
        <Subsection title="Option A — Hairline borders, no shadows">
          <p>
            Every surface gets a 1px solid border in{" "}
            <Code>--color-border</Code>. No drop shadows. Reads as clean and
            technical; works well for dashboards and developer tools.
          </p>
        </Subsection>
        <Subsection title="Option B — Soft shadows, no borders">
          <p>
            Every elevated surface gets a single subtle shadow
            (<Code>0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)</Code>)
            and no border. Reads as friendly and modern; works well for
            marketing sites.
          </p>
        </Subsection>
        <Subsection title="Option C — Layered shadows on key elements only">
          <p>
            Default to no border and no shadow. Reserve a stronger layered
            shadow for floating elements (modals, dropdowns, popovers).
            Reads as confident and minimal; works well for premium
            products.
          </p>
        </Subsection>
        <p>
          Tell the model which option you are using in the system prompt.
          Otherwise it will mix all three on the same page.
        </p>
      </Section>

      <Section title="Corner radius">
        <p>
          Pick two radii — one for small elements (buttons, inputs, badges)
          and one for large elements (cards, modals). A common pair is 8px
          for small and 16px for large. Forbid the model from inventing
          other radii. Mixing 4px, 6px, 10px, 12px, and 14px on the same
          page is a classic AI mistake.
        </p>
        <Callout title="Sharp corners are a style choice, not a default">
          <p>
            Zero radius everywhere reads as brutalist. If that is the goal,
            say so explicitly and ask the model to also use sharper type
            and tighter spacing — the style only works when all the
            elements agree.
          </p>
        </Callout>
      </Section>

      <Section title="Motion as a style primitive">
        <p>
          Motion should be consistent across the page. Pick two durations
          (e.g. 150ms for micro-interactions, 300ms for layout transitions)
          and one easing curve (<Code>cubic-bezier(0.4, 0, 0.2, 1)</Code> is
          a safe default). Ask the model to use these values for every
          transition and animation. Inconsistent motion is just as visible
          as inconsistent color, and just as easy to fix with a token-based
          prompt.
        </p>
      </Section>

      <Section title="Prompt template">
        <pre className="learn-code-block"><code>{`Visual style for this project:
- Color tokens (use ONLY these names):
    bg, surface, surface-2, border, text, text-muted,
    primary, primary-fg, success, warning, danger
- Spacing scale (use ONLY these values):
    4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px
- Border treatment: 1px solid var(--color-border), no shadows
- Corner radii: 8px (buttons/inputs), 16px (cards/modals)
- Motion: 150ms micro / 300ms layout, easing cubic-bezier(.4,0,.2,1)
- Dark mode: parallel token set under .dark selector

Do not introduce hex colors, arbitrary spacing, or other radii.`}</code></pre>
      </Section>
    </>
  ),
};
