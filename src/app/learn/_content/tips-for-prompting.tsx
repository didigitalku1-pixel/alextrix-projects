import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const tipsForPromptingContent = {
  slug: "tips-for-prompting",
  title: "Tips for Prompting",
  description:
    "How to write prompts that produce usable, on-brand output when you combine the library with an AI coding tool like Claude, GPT, or Gemini.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        The library and AI coding tools are designed to be used together.
        Pull a template or skill file from the library, paste it into your
        prompt as context, and the AI will produce output that matches the
        library&apos;s quality bar instead of generic boilerplate. This page
        covers the prompting patterns that consistently work.
      </p>

      <Section title="Give the model a concrete starting point">
        <p>
          The single biggest mistake is asking for a design from scratch.
          Open-ended prompts like &quot;design a modern landing page&quot; produce
          generic output because the model has nothing to anchor to. Instead,
          pull a specific template from the library, paste its source into
          the prompt, and ask for a specific change. The model now has a
          concrete structure, color palette, and typography system to work
          with, and the output will be 10× more usable.
        </p>
        <Tip>
          A good prompt template: <em>&quot;Here is a template I want to adapt:
          [paste source]. I want to [change X, Y, Z]. Keep everything else
          the same.&quot;</em> This works because the model treats the source as
          ground truth and only modifies what you asked it to.
        </Tip>
      </Section>

      <Section title="Be specific about what to change">
        <p>
          Vague change requests produce vague output. &quot;Make it look more
          premium&quot; means ten different things to ten different people. A
          better version: &quot;Increase the heading size from 48px to 72px, swap
          the body font from Inter to GT America, and add a subtle grain
          overlay to the hero section.&quot; The model can execute specifics; it
          cannot read your mind.
        </p>
        <Subsection title="A useful change request checklist">
          <ul>
            <li>Which element (heading, button, section, page)?</li>
            <li>Which property (size, color, spacing, content)?</li>
            <li>What is the new value, expressed concretely?</li>
            <li>What should stay the same?</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="Use the library&apos;s skill files as context">
        <p>
          The skill files in the library are written specifically to be
          pasted into AI prompts. They describe a visual language in
          structured terms — typography scale, spacing rhythm, color tokens,
          motion principles — that the model can apply directly. When you
          start a new project, drop one or two relevant skill files into
          your system prompt and the model will respect that visual language
          across every output in the conversation.
        </p>
        <Callout title="Combining a skill file with a template">
          <p>
            The strongest combination is a skill file in the system prompt
            plus a template in the user message. The skill file tells the
            model what good looks like; the template gives it a concrete
            structure to adapt. Output quality jumps noticeably compared to
            using either alone.
          </p>
        </Callout>
      </Section>

      <Section title="Iterate in small steps">
        <p>
          Resist the urge to ask for everything in one prompt. AI coding
          tools have a limited attention budget — the more changes you ask
          for in a single message, the more likely some of them get dropped
          or implemented incorrectly. Break complex requests into a sequence
          of small, focused steps: first the layout, then the typography,
          then the color, then the motion. After each step, review the
          output and only proceed when it matches your intent.
        </p>
        <p>
          This is especially important for animations and interactions,
          which the model often gets wrong on the first try. Asking for one
          animation at a time, with explicit timing and easing values,
          produces dramatically better results than asking for &quot;smooth
          animations throughout&quot;.
        </p>
      </Section>

      <Section title="Reference other library items explicitly">
        <p>
          When you want the model to mix elements from multiple templates,
          name them explicitly and paste their relevant sections. &quot;Use the
          hero from template A, the pricing section from template B, and the
          footer from template C&quot; works much better than &quot;combine templates
          A, B, and C&quot;. The model will faithfully reproduce each section&apos;s
          structure, and you can then ask it to harmonize the typography and
          color in a follow-up prompt.
        </p>
      </Section>

      <Section title="Give negative guidance">
        <p>
          Telling the model what not to do is just as important as telling
          it what to do. Common anti-patterns to call out:
        </p>
        <ul>
          <li>&quot;No emoji icons — use SVG icons from the library instead.&quot;</li>
          <li>&quot;No CSS gradients on text — keep text solid colors.&quot;</li>
          <li>&quot;No <Code>!important</Code> in the CSS.&quot;</li>
          <li>&quot;No JavaScript frameworks — keep it vanilla JS.&quot;</li>
          <li>&quot;No placeholder lorem ipsum — use the copy I provided.&quot;</li>
        </ul>
        <p>
          These constraints feel obvious, but they save you from a class of
          mistakes that AI tools make repeatedly. Once you find yourself
          correcting the same issue two or three times, add it to your
          standing list of negative guidance.
        </p>
      </Section>

      <Section title="Ask for explanations">
        <p>
          When the model produces output you do not fully understand, ask it
          to explain the choice it made. &quot;Why did you pick 16px for the body
          font here?&quot; or &quot;What does this media query do?&quot; The model&apos;s
          answer will either confirm the choice was intentional (in which
          case you have learned something) or expose a guess (in which case
          you can correct it). Either way, your next prompt will be more
          informed.
        </p>
      </Section>

      <Section title="Keep prompts reusable">
        <p>
          Once you have a prompt that reliably produces good output, save
          it. A simple markdown file with one prompt per section is enough.
          Over time you will build up a small library of prompts that work
          for your specific style, and your iteration speed will compound.
          Many of the skill files in this library started life exactly this
          way — as prompts that worked well enough to be worth keeping.
        </p>
      </Section>
    </>
  ),
};
