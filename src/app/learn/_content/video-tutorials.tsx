import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const videoTutorialsContent = {
  slug: "video-tutorials",
  title: "Video Tutorials",
  description:
    "A curated index of video walkthroughs covering AI-assisted design workflows, prompting techniques, and how to get the most out of the library.",
  group: "resources" as const,
  body: () => (
    <>
      <p className="learn-lead">
        This page collects every video walkthrough referenced elsewhere in
        the learn section. Use the sidebar anchors to jump straight to a
        specific video, or read through the categories below to find
        something new to watch.
      </p>

      <Section title="Interactive and motion-led builds">
        <p>
          These videos cover builds where motion is the point — interactive
          hero sections, WebGL scenes, and complex scroll-driven
          animations. Each one shows the full workflow from a rough idea to
          a polished result, including the prompts that worked and the
          iterations that did not.
        </p>
        <ul className="learn-video-list">
          <li id="interactive-rain-hero"><strong>Interactive Rain Hero</strong> — building a canvas-based rain effect that responds to mouse movement, using a single Claude prompt and a small amount of vanilla JavaScript for the interaction layer.</li>
          <li id="brutalist-landing-page"><strong>Brutalist Landing Page</strong> — taking a design reference and shipping a complete brutalist landing page in one session, including the typography choices and the sharp grid that define the style.</li>
          <li id="animated-webgl-pages"><strong>Animated WebGL Pages</strong> — using a design system file plus a WebGL shader to produce hero sections that feel three-dimensional without a heavy runtime.</li>
          <li id="complex-animations"><strong>Complex Animations</strong> — breaking a multi-step animation into individual scroll-triggered reveals, then orchestrating them so the result feels like one continuous sequence.</li>
          <li id="gemini-3-animations"><strong>Gemini 3 Animations</strong> — what changed in the latest model&apos;s handling of motion, and which animation prompts now work better than they did before.</li>
        </ul>
      </Section>

      <Section title="End-to-end website builds">
        <p>
          These videos take a single prompt — sometimes just a sentence —
          and follow it all the way to a published website. They are useful
          for understanding how to scope a prompt, how to iterate when the
          first output is not quite right, and how to combine multiple
          tools (an image generator, a coding assistant, a design system
          file) into a single workflow.
        </p>
        <ul className="learn-video-list">
          <li id="20k-website-prompt"><strong>$20K Website Prompt</strong> — the exact prompt used to generate a website that recently sold for $20,000, broken down line by line so you can adapt it.</li>
          <li id="20k-ai-workflow"><strong>$20K AI Workflow</strong> — the full workflow behind the same project, including the image generation step, the assembly step, and the manual polish that brought it over the line.</li>
          <li id="gpt-images-grok"><strong>GPT Images + Grok</strong> — pairing GPT Image generation with Grok for video, then assembling both into a single landing page with a hero video.</li>
          <li id="ai-landing-pages-media"><strong>AI Landing Pages with Media</strong> — patterns for embedding images and video into AI-generated layouts so the result does not look like a stock template.</li>
          <li id="gpt-image-to-landing"><strong>GPT Image to Landing Page</strong> — a two-step workflow where GPT Image imagines a hero, then a coding assistant turns that hero into a full page.</li>
          <li id="gemini-3-landing-pages"><strong>Gemini 3 Landing Pages</strong> — the kinds of landing pages Gemini 3 produces well out of the box, and where it still needs hand-holding.</li>
          <li id="gpt-51-uis"><strong>Using GPT 5.1 for Creating UIs</strong> — a focused look at GPT 5.1&apos;s strengths for UI work, with side-by-side comparisons against earlier models.</li>
          <li id="aura-compose-workflow"><strong>Aura Compose Workflow</strong> — composing multiple library items into a single cohesive page, then asking the model to harmonize the typography and color.</li>
        </ul>
      </Section>

      <Section title="Design system and prompting">
        <p>
          These videos dig into the prompting side — how to write a design
          system file, how to feed it to a model, and how to iterate on the
          model&apos;s output without losing the structure you established.
        </p>
        <ul className="learn-video-list">
          <li id="design-md-workflow"><strong>DESIGN.md Workflow</strong> — the role a single markdown file can play in keeping AI-generated output consistent across a whole project.</li>
          <li id="gpt-55-design-md"><strong>GPT 5.5 + DESIGN.md</strong> — pairing the design system file with GPT 5.5, and the prompt patterns that produce the best landing pages.</li>
          <li id="design-md-better-design"><strong>DESIGN.md Better AI Design</strong> — a before-and-after look at the same prompt with and without a design system file attached.</li>
          <li id="gemini-3-changes"><strong>Gemini 3 Changes Everything</strong> — what the latest Gemini release changes about the design system file workflow, and which old patterns no longer apply.</li>
          <li id="how-to-prompt-ui"><strong>How to Prompt for UI</strong> — a slow walkthrough of a single prompt, line by line, with explanations of why each line is there.</li>
        </ul>

        <Tip>
          If you are new to design system files, start with the{" "}
          <Code>DESIGN.md Workflow</Code> video — it covers the core idea
          in 12 minutes and the others build on that foundation.
        </Tip>
      </Section>

      <Section title="Improving and customizing AI output">
        <p>
          These videos cover the post-generation work that turns a
          serviceable AI design into something polished. They assume you
          already have a working page and want to push it further.
        </p>
        <ul className="learn-video-list">
          <li id="avoid-ai-slop"><strong>Avoid AI Slop</strong> — the five most common tells that a landing page was AI-generated, and the specific changes that fix each one.</li>
          <li id="claude-vs-gpt"><strong>Claude 4.8 vs GPT-5.5</strong> — side-by-side builds of the same landing page in both models, with notes on which model wins each section.</li>
          <li id="pro-level-designs"><strong>Turn AI Designs to Pro-level</strong> — a checklist of small typographic and spacing adjustments that consistently elevate AI output.</li>
          <li id="master-customizations"><strong>Master Customizations</strong> — patterns for customizing a library template without breaking its responsive behavior or accessibility.</li>
          <li id="image-to-html"><strong>Image to HTML with AI</strong> — turning a static design image into clean HTML and Tailwind, including how to handle images, icons, and fonts.</li>
          <li id="improve-ai-designs"><strong>Improve your AI Designs</strong> — a 20-minute audit of a real AI-generated landing page, with every fix explained as it is applied.</li>
        </ul>
      </Section>

      <Callout title="Watching tips">
        <p>
          These videos are dense — most pack a full workflow into 10–20
          minutes. Skim the first 60 seconds to see the final result, then
          scrub back to the start if the result is what you want. The
          prompts and design system files referenced in each video are
          available in the library&apos;s skills section under the matching
          name.
        </p>
      </Callout>
    </>
  ),
};
