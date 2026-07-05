import { Section, Subsection, Tip, Callout, Code } from "../_components/blocks";

export const layoutContent = {
  slug: "prompt-for-layout",
  title: "Layout Prompting",
  description:
    "How to prompt AI tools for layout that holds together — grid systems, container widths, responsive breakpoints, and the structural rules that prevent a page from feeling random.",
  group: "getting-started" as const,
  body: () => (
    <>
      <p className="learn-lead">
        Layout is the skeleton underneath every page. When it is right, the
        design feels solid even before any visual styling is applied. When
        it is wrong, no amount of color or typography will save it. This
        page covers the prompting patterns that produce coherent layouts
        from AI tools.
      </p>

      <Section title="Container and grid">
        <p>
          Define a single container width and a single grid system and ask
          the model to use them everywhere. A common baseline:
        </p>
        <pre className="learn-code-block"><code>{`/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;  /* mobile */
}

/* 12-column grid */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}`}</code></pre>
        <p>
          With these defined, the model has a structural answer to &quot;how do
          I lay out N items?&quot; — it reaches for the grid instead of
          inventing a new flex pattern for each section.
        </p>
      </Section>

      <Section title="Section anatomy">
        <p>
          A landing page section is almost always some variation of:
        </p>
        <ul>
          <li><strong>Container</strong> — sets the maximum width and horizontal padding.</li>
          <li><strong>Header</strong> — eyebrow label, heading, optional subheading, optional CTA.</li>
          <li><strong>Body</strong> — the content itself (cards, columns, feature rows, gallery).</li>
          <li><strong>Footer</strong> — optional summary or links.</li>
        </ul>
        <p>
          Tell the model to use this anatomy for every section, and to keep
          the header aligned consistently (usually left-aligned for
          editorial layouts, centered for marketing sections with a small
          number of items). Mixing alignments within the same page is a
          classic AI mistake.
        </p>
      </Section>

      <Section title="Responsive breakpoints">
        <p>
          Use the default Tailwind breakpoints and ask the model to design
          mobile-first. The most common AI failure here is designing
          desktop-first and then collapsing to mobile as an afterthought,
          which produces cramped mobile layouts.
        </p>
        <pre className="learn-code-block"><code>{`/* Mobile-first defaults */
.col { grid-template-columns: 1fr; }

/* Tablet and up */
@media (min-width: 768px) {
  .col-2 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .col-3 { grid-template-columns: repeat(3, 1fr); }
  .col-4 { grid-template-columns: repeat(4, 1fr); }
}`}</code></pre>
        <Tip>
          Ask the model to write the mobile layout first in the prompt,
          then explicitly add the tablet and desktop variants. This forces
          mobile to be a real design target rather than a fallback.
        </Tip>
      </Section>

      <Section title="Vertical rhythm between sections">
        <p>
          Section padding should be consistent across the page. A common
          scale:
        </p>
        <ul>
          <li>Mobile: 64px top and bottom</li>
          <li>Tablet: 96px top and bottom</li>
          <li>Desktop: 128px top and bottom</li>
        </ul>
        <p>
          The hero section is the exception — it often gets more padding
          (up to 192px on desktop) to give the page room to breathe at the
          top. Tell the model which sections get hero treatment so it does
          not apply it everywhere.
        </p>
      </Section>

      <Section title="Common section patterns">
        <Subsection title="Feature grid">
          <p>
            3 or 4 columns of cards on desktop, collapsing to 2 on tablet
            and 1 on mobile. Each card has an icon, a title, and 2–3 lines
            of body copy. Cards should be equal height with top-aligned
            content — never vertically centered.
          </p>
        </Subsection>
        <Subsection title="Feature rows (alternating)">
          <p>
            Two columns: text on one side, image on the other. Alternate
            sides between rows. On mobile, stack with the image first (so
            the text has visual context above it).
          </p>
        </Subsection>
        <Subsection title="Pricing table">
          <p>
            3 columns on desktop, 1 on mobile. Highlight the middle plan
            with a slightly elevated card (subtle shadow or border
            emphasis). Never use scale to emphasize — it breaks the grid.
          </p>
        </Subsection>
        <Subsection title="Testimonials">
          <p>
            Single column with a large quote, attribution, and avatar.
            Avoid grids of testimonial cards unless you have a specific
            reason — they tend to feel cluttered.
          </p>
        </Subsection>
      </Section>

      <Section title="Navigation and footer">
        <p>
          Navigation should be sticky on desktop and a slide-in drawer on
          mobile. Keep nav items to 5–7 — anything more becomes
          overwhelming. Footer is the place for the full sitemap, organized
          into 3–5 columns by category.
        </p>
        <Callout title="Logo placement">
          <p>
            The logo goes on the left of the nav on desktop and centers on
            mobile. Clicking it always returns to the home page. Do not
            wrap the logo in a button or add hover state beyond a subtle
            opacity change — logos are not interactive elements.
          </p>
        </Callout>
      </Section>

      <Section title="Prompt template">
        <pre className="learn-code-block"><code>{`Layout rules for this project:
- Container: max-width 1200px, padding 0 24px
- Grid: 12 columns, 24px gap
- Section anatomy: container → header → body → footer (header left-aligned)
- Section padding: 64px / 96px / 128px (mobile / tablet / desktop)
- Hero padding: up to 192px on desktop
- Breakpoints: mobile-first, then md (768px), lg (1024px), xl (1280px)
- Card grids: 4 cols desktop → 2 cols tablet → 1 col mobile,
  equal height, top-aligned content
- Feature rows: alternating sides on desktop, image-first on mobile
- Nav: sticky on desktop, drawer on mobile, max 7 items
- Footer: 3–5 columns organized by category

Do not introduce other container widths, grid systems, or breakpoints.`}</code></pre>
      </Section>
    </>
  ),
};
