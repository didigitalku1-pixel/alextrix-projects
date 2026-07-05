import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const typographyContent = {
  slug: "prompt-for-typography",
  title: "Typography Prompting",
  description:
    "How to prompt AI tools for typography that looks intentional — scale, rhythm, font pairing, and the specific values that consistently produce good results.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Typography is where AI-generated designs most often feel off. The
        model picks reasonable fonts but tends to misuse scale, line height,
        and tracking — and the result reads as &quot;close but not quite&quot;.
        This page covers the prompting patterns that fix the most common
        typography problems.
      </p>

      <Section title="Define the type scale explicitly">
        <p>
          Never ask the model to &quot;pick a type scale&quot;. Instead, paste a
          specific scale and ask the model to use only those sizes. A
          modular scale based on a 1.25 ratio works well for most landing
          pages:
        </p>
        <pre className="learn-code-block"><code>{`--text-xs:   12px;   /* captions, labels */
--text-sm:   14px;   /* secondary copy */
--text-base: 16px;   /* body copy */
--text-lg:   20px;   /* lead paragraphs */
--text-xl:   25px;   /* card titles */
--text-2xl:  31px;   /* section headings */
--text-3xl:  39px;   /* sub-heroes */
--text-4xl:  49px;   /* hero headlines */
--text-5xl:  61px;   /* display headlines */`}</code></pre>
        <p>
          With this scale in the prompt, the model will reach for one of
          these sizes instead of inventing its own. The result is a
          consistent rhythm across the page.
        </p>
      </Section>

      <Section title="Pick a font pairing and stick to it">
        <p>
          AI tools default to Inter for everything. That is not wrong, but
          it produces designs that all look the same. Pairing a characterful
          display face for headings with a neutral sans for body creates
          visual hierarchy without effort. A few pairings that work:
        </p>
        <Subsection title="Editorial">
          <p>
            <Code>Instrument Serif</Code> for display, <Code>Inter</Code> for
            body. Reads as magazine-like; good for content-heavy sites.
          </p>
        </Subsection>
        <Subsection title="Technical">
          <p>
            <Code>Geist Mono</Code> for display, <Code>Geist Sans</Code> for
            body. Reads as developer-tool; good for SaaS dashboards.
          </p>
        </Subsection>
        <Subsection title="Soft modern">
          <p>
            <Code>General Sans</Code> for display, <Code>Inter</Code> for
            body. Reads as friendly but professional; good for B2B
            marketing.
          </p>
        </Subsection>
        <Tip>
          Whichever pairing you pick, load fonts via the official variable
          font files (or a single link tag from Google Fonts / Fontshare).
          Asking the model to &quot;use a font that looks like X&quot; without
          naming the actual file produces inconsistent results.
        </Tip>
      </Section>

      <Section title="Line height and tracking by role">
        <p>
          Default line heights are tuned for body copy and break down at
          both ends of the scale. Headings need tighter line height; small
          labels need looser tracking. Spell this out in the prompt:
        </p>
        <ul>
          <li>Display headings: line-height 1.05, letter-spacing -0.02em</li>
          <li>Section headings: line-height 1.15, letter-spacing -0.01em</li>
          <li>Body copy: line-height 1.6, letter-spacing 0</li>
          <li>Buttons and labels: line-height 1.2, letter-spacing 0.01em (uppercase) or -0.005em (sentence case)</li>
          <li>Code blocks: line-height 1.5, letter-spacing 0</li>
        </ul>
        <p>
          These values are not universal, but they are a safe starting
          point. Once the model applies them, you can fine-tune individual
          cases.
        </p>
      </Section>

      <Section title="Vertical rhythm">
        <p>
          Spacing between text blocks matters as much as the text itself. A
          common mistake is to set heading margins in isolation, which
          produces an irregular vertical rhythm. Instead, define spacing as
          a multiple of the body line height and apply it consistently:
        </p>
        <pre className="learn-code-block"><code>{`/* body line-height: 1.6 * 16px = 25.6px ≈ 26px */
--space-1:  8px;   /* half line */
--space-2:  16px;  /* one line */
--space-3:  26px;  /* line + half */
--space-4:  52px;  /* two lines */
--space-5:  78px;  /* three lines */

/* Apply: heading margin-top = --space-4, margin-bottom = --space-2 */`}</code></pre>
        <p>
          With this rhythm in place, the page reads as intentional even
          before any specific design decisions are visible.
        </p>
      </Section>

      <Section title="Maximum measure and alignment">
        <p>
          Lines of body copy should be 60–80 characters wide. Anything wider
          hurts readability; anything narrower feels claustrophobic. Set{" "}
          <Code>max-width: 65ch</Code> on long-form paragraphs and let the
          layout breathe around them. For headings, allow wider measures
          since they break across lines differently.
        </p>
        <Callout title="Alignment">
          <p>
            Default to left-aligned body copy. Centered copy is fine for
            short hero headlines but breaks down quickly for paragraphs —
            the ragged left edge forces the reader to find the start of
            each line, which slows reading noticeably. If you must center
            body copy (e.g. for a quote), keep the measure tight (45ch or
            less) and the block short.
          </p>
        </Callout>
      </Section>

      <Section title="Prompt template">
        <p>
          A typography prompt you can adapt for any project:
        </p>
        <pre className="learn-code-block"><code>{`Typography system for this project:
- Display font: {{name}}, weights 400 and 500 only
- Body font: {{name}}, weights 400 and 600 only
- Type scale (use ONLY these sizes):
    xs=12, sm=14, base=16, lg=20, xl=25, 2xl=31, 3xl=39, 4xl=49, 5xl=61
- Line heights: display 1.05, headings 1.15, body 1.6, labels 1.2
- Letter spacing: display -0.02em, headings -0.01em, body 0,
  uppercase labels +0.01em
- Body max-width: 65ch
- Vertical rhythm: spacing tokens at 8, 16, 26, 52, 78px
  (heading margin-top = 52px, margin-bottom = 16px)

Do not introduce other font sizes, line heights, or letter spacing
values anywhere in the output.`}</code></pre>
        <p>
          Pasting this block at the start of a conversation will keep the
          model&apos;s typography choices consistent across every reply.
        </p>
      </Section>
    </>
  ),
};
