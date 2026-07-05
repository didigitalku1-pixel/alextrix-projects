import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const animationContent = {
  slug: "prompt-for-animation",
  title: "Animation Prompting",
  description:
    "How to prompt AI tools for motion that adds polish without becoming distracting — durations, easings, scroll-triggered reveals, and the patterns that consistently feel right.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Animation is the easiest thing for an AI tool to get wrong. The
        model tends to add motion to everything, use the wrong easing, or
        pick durations that feel sluggish. This page covers the prompting
        patterns that produce motion which enhances rather than distracts.
      </p>

      <Section title="Decide what motion is for">
        <p>
          Before prompting for any animation, decide what role motion plays
          on the page. There are three legitimate answers:
        </p>
        <Subsection title="Feedback">
          <p>
            Motion that confirms a user action — button press, toggle,
            successful form submit. These should be fast (100–200ms) and
            use a snappy easing.
          </p>
        </Subsection>
        <Subsection title="Reveal">
          <p>
            Motion that introduces content as it enters the viewport.
            Slower (400–800ms), often with a slight upward translate, and
            triggered by scroll position.
          </p>
        </Subsection>
        <Subsection title="Delight">
          <p>
            Motion that exists purely because it makes the page feel alive
            — a slow ambient gradient, a parallax layer, a hero image that
            drifts. Use sparingly, only on hero sections, and never on more
            than one element per page.
          </p>
        </Subsection>
        <p>
          Tell the model which of these you want, and forbid the others.
          Without that constraint, the model will reach for delight motion
          on every element, which is the most common cause of &quot;feels
          AI-generated&quot;.
        </p>
      </Section>

      <Section title="Durations and easings">
        <p>
          Pick a small set of durations and easings and use them
          everywhere. A good starting set:
        </p>
        <pre className="learn-code-block"><code>{`/* Durations */
--motion-fast:    150ms;   /* hover, focus, press */
--motion-base:    250ms;   /* dropdowns, tooltips */
--motion-slow:    450ms;   /* modals, panels */
--motion-reveal:  600ms;   /* scroll-in reveals */

/* Easings */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);   /* most things */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* enter+exit */
--ease-in:     cubic-bezier(0.7, 0, 0.84, 0);   /* exit only */
--ease-spring: cubic-bezier(0.5, 1.7, 0.5, 1);  /* playful bounces */`}</code></pre>
        <Callout title="Avoid linear and default ease">
          <p>
            <Code>linear</Code> feels mechanical and is almost never right.
            The CSS default <Code>ease</Code> (<Code>cubic-bezier(0.25, 0.1,
            0.25, 1)</Code>) is acceptable but slightly flat. Reach for{" "}
            <Code>--ease-out</Code> in most cases — the fast start and slow
            end feels responsive and natural.
          </p>
        </Callout>
      </Section>

      <Section title="Scroll-triggered reveals">
        <p>
          The most common reveal pattern is &quot;fade up on scroll into view&quot;.
          The implementation is small but easy to get wrong. The key rules:
        </p>
        <ul>
          <li>Translate by 16–24px, never more. Larger distances feel dramatic and slow.</li>
          <li>Use <Code>--ease-out</Code>, not linear.</li>
          <li>Trigger once per element, not every time it enters the viewport.</li>
          <li>Stagger siblings by 50–80ms, not 200ms+. Long staggers feel pretentious.</li>
          <li>Respect <Code>prefers-reduced-motion</Code> — disable reveals entirely when set.</li>
        </ul>
        <Tip>
          A simple prompt: <em>&quot;Reveal each section with a 16px upward
          translate and 0.6 opacity fade over 450ms with --ease-out.
          Trigger once when the element first enters the viewport. Stagger
          child cards by 60ms. Disable entirely when prefers-reduced-motion
          is reduce.&quot;</em>
        </Tip>
      </Section>

      <Section title="Hover and press states">
        <p>
          Interactive elements need a clear hover and press state. Keep
          them subtle:
        </p>
        <ul>
          <li>Hover: 4–8px upward translate on cards, brightness 1.05 on images, color shift on text.</li>
          <li>Press: 1px downward translate, brightness 0.95, scale 0.98 — pick one, not all three.</li>
          <li>Duration: 150ms with <Code>--ease-out</Code>.</li>
        </ul>
        <p>
          The model often overdoes these by adding scale, rotate, and
          shadow all at once. Specify one transform per state and the
          output will feel restrained.
        </p>
      </Section>

      <Section title="Page transitions">
        <p>
          For multi-page sites, page transitions add polish but are easy to
          over-engineer. The cleanest pattern is a 200ms crossfade between
          pages with a 4px upward translate on the new content. Avoid slide
          transitions unless you have a clear spatial metaphor (wizard
          steps, image galleries) — they feel awkward on content pages.
        </p>
        <p>
          For Next.js apps, the App Router handles this naturally with the
          <Code> template</Code> element and a small Framer Motion wrapper.
          Ask the model to use that pattern rather than building a custom
          router-level transition.
        </p>
      </Section>

      <Section title="Ambient motion (use sparingly)">
        <p>
          Ambient motion — a slow-drifting gradient, a parallax layer, a
          rotating globe — can make a hero feel alive. Rules of thumb:
        </p>
        <ul>
          <li>One ambient element per page, on the hero only.</li>
          <li>Durations 8–20 seconds. Faster reads as a bug.</li>
          <li>Use <Code>linear</Code> easing for true loops (so the seam is invisible).</li>
          <li>Pause when off-screen to save battery and CPU.</li>
          <li>Disable on mobile and when <Code>prefers-reduced-motion</Code> is set.</li>
        </ul>
      </Section>

      <Section title="Prompt template">
        <pre className="learn-code-block"><code>{`Motion rules for this project:
- Roles allowed: feedback (buttons, toggles) and reveal (scroll-in only)
- Forbid: ambient motion, parallax, looping animations on body content
- Durations: fast 150ms, base 250ms, slow 450ms, reveal 600ms
- Easings: --ease-out for most, --ease-in-out for enter+exit
- Reveals: 16px translate Y, 0.6 start opacity, stagger 60ms
- Hovers: ONE transform only (translate OR scale OR brightness)
- Always honor prefers-reduced-motion: reduce (disable reveals,
  keep color-only hovers)
- Always pause ambient motion when element is off-screen`}</code></pre>
      </Section>
    </>
  ),
};
