import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocOL, DocLI,
  DocFeatureBlock, DocStep, DocProTip, DocCodeBlock, DocLink, DocCardLink,
  DocButtonLink, DocNote,
} from "../_components/Doc";

/* ============================================================================
   How to Edit Designs — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/how-to-design.
   ========================================================================== */

const tocItems = [
  { id: "modes", label: "View Modes", level: 2 },
  { id: "styling", label: "Styling & Assets", level: 2 },
  { id: "advanced-editing", label: "Advanced Editing", level: 2 },
  { id: "responsive", label: "Responsive Design", level: 2 },
  { id: "animations", label: "Animations", level: 2 },
];

export const howToDesignContent: LearnPageContent = {
  slug: "how-to-design",
  title: "How to Edit Designs",
  description: "How to use Aura's editor to edit and customize designs.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>How to Edit Designs</DocH1>
        <DocLead>
          Master the Aura editor to edit and customize designs. Learn how to switch modes, customize styles, manage assets, and fine-tune every detail.
        </DocLead>
      </header>

      {/* ===== View Modes ===== */}
      <DocH2 id="modes">View Modes</DocH2>
      <DocFeatureBlock title="Preview Mode">
        See your site exactly as visitors will. Interact with buttons, links, and animations without editing distractions.
      </DocFeatureBlock>
      <DocFeatureBlock title="Design Mode">
        The visual builder. Click elements to edit text, swap images, and adjust styles using the sidebar controls.
      </DocFeatureBlock>
      <DocFeatureBlock title="Code Mode">
        For full control. Edit the raw HTML and Tailwind classes directly. Changes update in real-time.
      </DocFeatureBlock>

      {/* ===== Styling & Assets ===== */}
      <DocH2 id="styling">Styling & Assets</DocH2>
      <DocH3 id="setting-fonts-typography">Setting Fonts &amp; Typography</DocH3>
      <DocP>
        The Selection Fonts panel (accessible from the toolbar) provides comprehensive typography management. It automatically detects fonts used in your design and offers powerful bulk editing capabilities.
      </DocP>

      <DocH4>Imported Fonts</DocH4>
      <DocP>View all Google Fonts currently loaded in your page. Fonts are automatically imported when you use them. You can remove unused fonts to optimize page load.</DocP>
      <DocUL>
        <DocLI>See which fonts are actively used vs unused</DocLI>
        <DocLI>Remove individual fonts or bulk remove unused fonts</DocLI>
        <DocLI>Fonts load automatically when selected from the font picker</DocLI>
      </DocUL>

      <DocH4>Font Pairings</DocH4>
      <DocP>Quick presets that apply complementary fonts to headings and body text simultaneously. Includes popular combinations like Inter/Inter, Playfair/Geist, and more.</DocP>
      <DocUL>
        <DocLI>One-click application of heading + body font combinations</DocLI>
        <DocLI>Automatically sets appropriate font weights</DocLI>
        <DocLI>Removes unused fonts after applying a pairing</DocLI>
      </DocUL>

      <DocH4>Change Fonts by Style</DocH4>
      <DocP>Bulk edit fonts based on text size:</DocP>
      <DocUL>
        <DocLI title="Headings:">Change all text larger than 20px at once</DocLI>
        <DocLI title="Body Text:">Change all text 20px or smaller at once</DocLI>
        <DocLI>Adjust font weight and letter spacing (tracking) for each style group</DocLI>
        <DocLI>Hover to highlight matching elements in the preview</DocLI>
      </DocUL>

      <DocH4>Detected Font Styles</DocH4>
      <DocP>Automatically detects all unique font style combinations used in your design based on computed styles:</DocP>
      <DocUL>
        <DocLI>Shows font family, size, weight, style, and letter spacing</DocLI>
        <DocLI>Displays usage count for each style</DocLI>
        <DocLI>Edit weight and tracking for each detected style</DocLI>
        <DocLI>Hover to highlight all elements using that style</DocLI>
      </DocUL>

      <DocH4>Detected Fonts</DocH4>
      <DocP>Lists all font family classes found in your HTML (e.g., font-sans, font-playfair):</DocP>
      <DocUL>
        <DocLI>Change font family for all elements using a specific font class</DocLI>
        <DocLI>Adjust weight and letter spacing per font</DocLI>
        <DocLI>Supports both predefined fonts and arbitrary values like font-[Space_Mono]</DocLI>
        <DocLI>Hover to highlight elements using each font</DocLI>
      </DocUL>

      <DocH3 id="setting-colors">Setting Colors</DocH3>
      <DocP>
        The Selection Colors panel (accessible from the toolbar) automatically detects all colors used in your design and provides powerful color management tools.
      </DocP>

      <DocH4>Color Mode Toggle</DocH4>
      <DocP>Switch between Light and Dark mode. When switching, color intensities are automatically inverted (e.g., text-gray-200 becomes text-gray-800) to maintain proper contrast.</DocP>
      <DocUL>
        <DocLI>Automatically detects current mode based on text colors</DocLI>
        <DocLI>Inverts color intensities when switching modes</DocLI>
        <DocLI>Preserves opacity values (e.g., white/70)</DocLI>
        <DocLI>Flips white/black colors appropriately</DocLI>
      </DocUL>

      <DocH4>Theme Colors</DocH4>
      <DocP>Detects base color names (e.g., "blue", "red", "gray") used throughout your design:</DocP>
      <DocUL>
        <DocLI>Shows usage count for each color name</DocLI>
        <DocLI>Replace all instances of a color name with another (e.g., replace all "blue" with "indigo")</DocLI>
        <DocLI>Color presets: Quick theme swaps (Neutral, Gray, Stone, Indigo, Blue, Orange, Green)</DocLI>
        <DocLI>Hover to highlight all elements using a theme color</DocLI>
      </DocUL>

      <DocH4>Detected Colors</DocH4>
      <DocP>Automatically finds all color classes used in your design:</DocP>
      <DocUL>
        <DocLI title="Types:">Text colors, background colors, border colors, gradients, hover states</DocLI>
        <DocLI title="Filters:">All, Color, Gradient, Text, Background, Border, Hover</DocLI>
        <DocLI>Shows usage count for each color class</DocLI>
        <DocLI>Change individual colors using the Color Picker</DocLI>
        <DocLI>Supports Tailwind classes, hex codes, RGB/RGBA, HSL/HSLA</DocLI>
        <DocLI>Handles gradients (linear, radial, conic) as single units</DocLI>
        <DocLI>Hover to highlight elements using each color</DocLI>
      </DocUL>

      <DocH4>Text Gradients</DocH4>
      <DocP>When changing a text color to a gradient, the system automatically applies bg-clip-text and text-transparent classes to enable gradient text effects.</DocP>

      <DocH3 id="changing-assets">Changing Assets</DocH3>
      <DocP>
        The Asset Picker (found in the Edit Popover's "Embed" section) lets you replace elements with pre-built components from Aura's library.
      </DocP>
      <DocUL>
        <DocLI title="Component Library:">Browse and insert buttons, cards, forms, and other UI components</DocLI>
        <DocLI title="Search & Filter:">Find components by name, category, or tags</DocLI>
        <DocLI title="Replace Elements:">Select an element and choose a component to replace it while maintaining positioning</DocLI>
        <DocLI title="Customize After Insert:">All inserted components can be edited like any other element</DocLI>
      </DocUL>

      <DocH3 id="image-picker">Image Picker</DocH3>
      <DocP>The Image Picker provides multiple ways to add images to your design. Access it from the Edit Popover when selecting an image element or background.</DocP>

      <DocH4>Aura Library</DocH4>
      <DocP>Browse curated, high-quality images from Aura's collection. Search by keywords and filter by category.</DocP>

      <DocH4>Unsplash</DocH4>
      <DocP>Access millions of free photos from Unsplash. Search by keywords and download directly.</DocP>

      <DocH4>My Images</DocH4>
      <DocP>View and reuse images you've previously uploaded. Organized by date for easy access.</DocP>

      <DocH4>Upload Options</DocH4>
      <DocUL>
        <DocLI title="Drag & Drop:">Drop image files directly onto the Image Picker for instant upload</DocLI>
        <DocLI title="Upload Button:">Click "Upload" to select one or multiple images from your device</DocLI>
        <DocLI title="Image URL:">Paste any image URL to use external images instantly</DocLI>
        <DocLI title="AI Analysis:">Uploaded images are automatically analyzed for metadata, colors, and keywords</DocLI>
      </DocUL>

      <DocH4>Remix Images</DocH4>
      <DocP>Generate AI-powered variations of your images using the Remix feature. Available in the Image Picker, this lets you:</DocP>
      <DocUL>
        <DocLI>Create style variations (e.g., "make it more vibrant", "add a vintage look")</DocLI>
        <DocLI>Adjust composition and framing</DocLI>
        <DocLI>Generate multiple options to choose from</DocLI>
        <DocLI>Use various AI models including Gemini 3 Pro, GPT Image, and Ideogram</DocLI>
      </DocUL>

      <DocH4>Selection Assets Panel</DocH4>
      <DocP>
        The Selection Assets button in the toolbar opens a panel that automatically detects all images in your design (both &lt;img&gt; tags and background images). You can:
      </DocP>
      <DocUL>
        <DocLI>View all images in one place with thumbnails</DocLI>
        <DocLI>Hover to highlight images in the preview</DocLI>
        <DocLI>Click thumbnails or use Image Picker to replace any image</DocLI>
        <DocLI>See image type (Image Tag vs Background) and instance numbers</DocLI>
        <DocLI>Access Background Section for setting page backgrounds</DocLI>
      </DocUL>

      <DocH3 id="setting-backgrounds">Setting Backgrounds</DocH3>
      <DocP>
        Backgrounds can be set for any element using the Background section in the Edit Popover or the Selection Assets panel. You can use Embed (3D), Video, or Image backgrounds, plus color overlays for layered effects.
      </DocP>

      <DocH4>Embed (3D)</DocH4>
      <DocUL>
        <DocLI>Spline 3D backgrounds</DocLI>
        <DocLI>Unicorn Studio embeds</DocLI>
        <DocLI>Interactive 3D scenes</DocLI>
        <DocLI>Paste Spline/Unicorn URLs</DocLI>
      </DocUL>

      <DocH4>Video</DocH4>
      <DocUL>
        <DocLI>YouTube/Vimeo URLs</DocLI>
        <DocLI>Direct video file URLs</DocLI>
        <DocLI>Autoplay and loop options</DocLI>
        <DocLI>Muted playback</DocLI>
      </DocUL>

      <DocH4>Image</DocH4>
      <DocUL>
        <DocLI>Upload or select from Image Picker</DocLI>
        <DocLI>Background size: cover, contain, auto</DocLI>
        <DocLI>Background position controls</DocLI>
        <DocLI>Fixed or absolute positioning</DocLI>
      </DocUL>

      <DocH4>Background Effects</DocH4>
      <DocP>All background types support visual effects:</DocP>
      <DocUL>
        <DocLI>Hue rotation, blur, saturation, brightness</DocLI>
        <DocLI>Opacity and blend modes</DocLI>
        <DocLI>Alpha masks for gradient fades</DocLI>
        <DocLI>Height controls (full, 3/4, half, custom)</DocLI>
        <DocLI>Z-index for layering</DocLI>
      </DocUL>

      <DocH4>Color Backgrounds</DocH4>
      <DocUL>
        <DocLI>Solid colors using hex codes or Tailwind classes</DocLI>
        <DocLI>Gradient backgrounds (linear, radial)</DocLI>
        <DocLI>Breakpoint-aware colors (different colors per device)</DocLI>
        <DocLI>Can be combined with image/video/embed backgrounds</DocLI>
      </DocUL>

      {/* ===== Advanced Editing ===== */}
      <DocH2 id="advanced-editing">Advanced Editing</DocH2>
      <DocH3 id="edit-popover">The Edit Popover</DocH3>
      <DocP>
        Clicking any element in Design Mode opens the Edit Popover on the right side. It's organized into collapsible sections that appear based on the element type and current classes.
      </DocP>

      <DocH4>Editing Tailwind Classes</DocH4>
      <DocP>The Tailwind Classes textarea lets you directly edit utility classes. The textarea auto-resizes as you type.</DocP>
      <DocUL>
        <DocLI title="Real-time Preview:">Changes apply instantly to the selected element</DocLI>
        <DocLI title="Visual Controls Sync:">Editing classes updates the visual controls (sliders, pickers) automatically</DocLI>
        <DocLI title="Breakpoint Filtering:">Filter classes by breakpoint to see only mobile, tablet, or desktop classes</DocLI>
        <DocLI title="Common Classes:">Examples include p-4, flex, rounded-lg, shadow-lg</DocLI>
      </DocUL>

      <DocH4>Editing CSS Styles</DocH4>
      <DocP>The Inline CSS section lets you write custom CSS that gets applied via the style attribute.</DocP>
      <DocUL>
        <DocLI title="Syntax:">Write standard CSS properties (e.g., transform: rotate(45deg);)</DocLI>
        <DocLI title="Merge with Existing:">New styles merge with existing inline styles</DocLI>
        <DocLI title="Use Cases:">Complex transforms, custom animations, properties not in Tailwind</DocLI>
        <DocLI title="Auto-expand:">The textarea expands when inline styles are detected</DocLI>
      </DocUL>

      <DocH4>Visual Edits</DocH4>
      <DocP>Visual controls provide intuitive sliders, pickers, and dropdowns for common properties. All changes apply in real-time.</DocP>
      <DocUL>
        <DocLI>Width &amp; Height (with max/min)</DocLI>
        <DocLI>Margins (all sides or individual)</DocLI>
        <DocLI>Padding (all sides or individual)</DocLI>
        <DocLI>Position (static, relative, absolute)</DocLI>
        <DocLI>Z-index</DocLI>
      </DocUL>
      <DocUL>
        <DocLI>Border (color, width, radius)</DocLI>
        <DocLI>Shadow (multiple presets)</DocLI>
        <DocLI>Opacity &amp; Blend modes</DocLI>
        <DocLI>Filters (blur, grayscale, brightness)</DocLI>
        <DocLI>Transforms (rotate, scale, translate)</DocLI>
      </DocUL>

      <DocH4>Measurements</DocH4>
      <DocP>The Measurements panel shows computed dimensions and spacing values for the selected element.</DocP>
      <DocUL>
        <DocLI title="Dimensions:">Actual width and height in pixels</DocLI>
        <DocLI title="Spacing:">Computed margins and padding values</DocLI>
        <DocLI title="Position:">Top, right, bottom, left offsets for positioned elements</DocLI>
        <DocLI title="Use Cases:">Ensure consistent spacing, align elements precisely, debug layout issues</DocLI>
      </DocUL>

      <DocH4>Breakpoint-Aware Editing</DocH4>
      <DocP>Most visual controls support breakpoint-specific values. Use the breakpoint filter dropdown to set different values for desktop, tablet, and mobile. The Edit Popover shows a breakpoint indicator when editing breakpoint-specific properties.</DocP>

      {/* ===== Responsive ===== */}
      <DocH2 id="responsive">Responsive</DocH2>
      <DocFeatureBlock title="Breakpoints">
        Switch between Desktop, Tablet, and Mobile views using the device mode toggle in the top bar. The editor adapts the preview to match each breakpoint.
      </DocFeatureBlock>

      <DocH4>Responsive Prefixes</DocH4>
      <DocP>Use Tailwind's responsive prefixes to target specific breakpoints:</DocP>
      <DocUL>
        <DocLI title="sm:">Small screens (640px+)</DocLI>
        <DocLI title="md:">Medium screens (768px+)</DocLI>
        <DocLI title="lg:">Large screens (1024px+)</DocLI>
        <DocLI title="xl:">Extra large (1280px+)</DocLI>
      </DocUL>

      <DocH4>Breakpoint-Aware Controls</DocH4>
      <DocP>When editing in a specific device mode, visual controls automatically apply breakpoint prefixes. For example, changing font size in mobile mode adds text-sm while desktop keeps text-xl.</DocP>
      <DocUL>
        <DocLI>Preview layouts on all devices</DocLI>
        <DocLI>Adjust typography for mobile readability</DocLI>
        <DocLI>Change layout direction (flex-col on mobile)</DocLI>
        <DocLI>Hide/show elements per breakpoint</DocLI>
      </DocUL>

      {/* ===== Animations ===== */}
      <DocH2 id="animations">Animations</DocH2>
      <DocFeatureBlock title="Animations">
        Add smooth animations to elements using the Animations section in the Edit Popover. Animations enhance user experience and draw attention to important content.
      </DocFeatureBlock>

      <DocH4>Entry Animations</DocH4>
      <DocP>Elements animate in when they enter the viewport:</DocP>

      <DocH4>Hover Effects</DocH4>
      <DocP>Interactive animations on hover:</DocP>
      <DocUL>
        <DocLI>Lift (translate up)</DocLI>
        <DocLI>Scale (grow/shrink)</DocLI>
        <DocLI>Shadow changes</DocLI>
        <DocLI>Color transitions</DocLI>
      </DocUL>

      <DocH4>Custom Animations</DocH4>
      <DocP>Use CSS transforms and transitions in the Inline CSS section for advanced animations like rotations, 3D transforms, and complex keyframe animations.</DocP>
    </article>
  ),
};
