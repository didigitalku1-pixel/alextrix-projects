import { Section, Subsection, Tip, Callout, Code, Step } from "../_components/blocks";

export const howToDesignContent = {
  slug: "how-to-design",
  title: "How to Edit Designs",
  description:
    "How to use the preview, the device toggle, the metadata panel, and the copy/download actions on every item in the library.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Every item in Aura Library has a detail page that doubles as a small
        design editor. This page walks through each part of that interface so
        you can preview, inspect, and export items with confidence.
      </p>

      <Section title="The preview frame">
        <p>
          The largest area on any detail page is the live preview. It renders
          the template or component inside an isolated frame so its styles
          never leak into the rest of the page. Buttons, hover states, form
          inputs, and animations are all interactive — what you see is exactly
          what you get when you copy the source into your own project.
        </p>
        <p>
          The frame preserves the item&apos;s intended width and centers it
          against a neutral background, which makes it easy to evaluate visual
          rhythm and spacing without distractions. If an item is responsive,
          the preview will reflow when you change the device viewport (see
          below).
        </p>
      </Section>

      <Section title="Device toggle">
        <p>
          Above the preview, three small buttons let you switch between
          desktop, tablet, and mobile viewports. The preview re-renders at the
          selected width so you can verify responsive behavior. This is
          especially useful for components like navigation bars and pricing
          tables, where the layout can shift dramatically between breakpoints.
        </p>
        <Subsection title="Viewport widths">
          <ul>
            <li><Code>Desktop</Code> — 1280px wide, the default for most templates.</li>
            <li><Code>Tablet</Code> — 768px wide, useful for checking two-column collapses.</li>
            <li><Code>Mobile</Code> — 390px wide, the most common smartphone width.</li>
          </ul>
        </Subsection>
        <Tip>
          If a template looks broken at a particular width, open the source in
          a code editor and check the Tailwind breakpoint classes. The library
          follows the default Tailwind scale (<Code>sm</Code>, <Code>md</Code>,{" "}
          <Code>lg</Code>, <Code>xl</Code>, <Code>2xl</Code>), so the same
          rules apply here.
        </Tip>
      </Section>

      <Section title="Metadata panel">
        <p>
          To the right of (or below, on mobile) the preview is a panel with
          metadata about the current item: name, type, category, tags, source
          attribution, and the date it was added to the library. Tags are
          clickable — clicking one filters the current list to show only items
          with the same tag.
        </p>
        <p>
          The metadata panel also shows related items. The library computes
          these by matching on shared tags and category, so they are usually a
          good starting point when you want to explore variations of a layout
          you like.
        </p>
      </Section>

      <Section title="Copy, download, and open in new tab">
        <p>
          Three actions are always available from the toolbar above the
          preview:
        </p>
        <Step n={1} title="Copy source">
          <p>
            Copies the raw HTML, CSS, and JavaScript to your clipboard. Use
            this when you want to paste the item directly into an existing
            project or a code editor.
          </p>
        </Step>
        <Step n={2} title="Download file">
          <p>
            Downloads the item as a single self-contained HTML file. This is
            the easiest way to share a template with a teammate who just wants
            to open it in a browser and click around.
          </p>
        </Step>
        <Step n={3} title="Open in new tab">
          <p>
            Opens the item in its own browser tab at full width. Useful for
            testing on real devices, taking screenshots, or sending to a
            stakeholder for review.
          </p>
        </Step>
      </Section>

      <Section title="Editing inside the library">
        <p>
          The library is intentionally read-only — it is a collection, not a
          full design tool. To customize an item, copy or download it first,
          then edit in your preferred environment. This keeps the library
          stable and predictable, and it means your edits never get
          overwritten when the underlying item is updated.
        </p>
        <Callout title="A common workflow">
          <p>
            Find a template that is 80% of what you want, copy the source into
            a new Next.js or Vite project, then swap colors, fonts, and copy.
            This is usually faster than starting from scratch and tends to
            produce more polished results because the underlying structure is
            already battle-tested.
          </p>
        </Callout>
      </Section>

      <Section title="Tips for inspecting complex items">
        <p>
          For templates with many sections, the preview can be tall. Use the
          device toggle to drop to a smaller width — the layout will reflow
          and the page will be easier to scan. If you want to see the source
          for a specific section, open the downloaded file in a code editor
          and use the find-in-files feature to locate the section by its
          heading text.
        </p>
        <p>
          When you find a component you like but want to understand its
          structure, the browser devtools are your friend. Right-click the
          element in the preview, choose &quot;Inspect&quot; (note: this requires
          opening the item in a new tab first, since the in-page preview is
          isolated), and study the class names and element hierarchy.
        </p>
      </Section>
    </>
  ),
};
