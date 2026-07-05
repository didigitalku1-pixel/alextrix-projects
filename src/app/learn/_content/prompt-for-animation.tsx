import type { LearnPageContent } from "./types";
import {
  DocH1, DocLead, DocH2, DocH3, DocH4, DocP, DocUL, DocOL, DocLI,
  DocFeatureBlock, DocStep, DocProTip, DocCodeBlock, DocLink, DocNote, DocEmbed,
} from "../_components/Doc";

/* ============================================================================
   Animation Prompting — rebuilt as native React docs.
   Content preserved EXACTLY as scraped from aura.build/learn/prompt-for-animation.
   ========================================================================== */

const tocItems = [
  { id: "introduction", label: "Introduction to Animation", level: 2 },
  { id: "text-animation", label: "Text Animation", level: 2 },
  { id: "card-animation", label: "Card Animation", level: 2 },
  { id: "button-animation", label: "Button Animation", level: 2 },
  { id: "alert-animation", label: "Alert Animation", level: 2 },
  { id: "animation-timing", label: "Animation Timing", level: 2 },
  { id: "animation-examples", label: "Animation Examples", level: 2 },
  { id: "prompt-builder", label: "Animation Prompt Builder", level: 2 },
  { id: "examples", label: "Example Animation Prompts", level: 2 },
];

export const animationContent: LearnPageContent = {
  slug: "prompt-for-animation",
  title: "Animation Prompting",
  description: "Prompting for motion that adds polish without distraction.",
  group: "getting-started",
  toc: tocItems,
  body: () => (
    <article className="docs-article">
      <header className="docs-header">
        <DocH1>Prompt for Animation</DocH1>
        <DocLead>
          Learn how to craft effective prompts for animations and bring your interfaces to life with smooth, purposeful motion.
        </DocLead>
      </header>
      <DocP>
        Well-crafted animation prompts can significantly improve user experience by guiding attention, providing feedback, and adding character to your interfaces.
      </DocP>

      {/* ===== Introduction ===== */}
      <DocH2 id="introduction">Introduction to Animation</DocH2>
      <DocP>Effective animations provide context, guidance, and feedback to users, making interfaces more intuitive and engaging. When crafting prompts for animations, consider:</DocP>
      <DocUL>
        <DocLI title="Purpose">Is it to draw attention, show state change, provide feedback, or guide users through a process?</DocLI>
        <DocLI title="Timing">Duration, timing function, delay, and intensity all affect the feel of the animation.</DocLI>
        <DocLI title="Trigger">What causes the animation to start? Page load, user interaction, scroll position, or state changes?</DocLI>
        <DocLI title="Accessibility">Respect user preferences with reduced motion options, and ensure animations enhance rather than distract.</DocLI>
      </DocUL>

      <DocEmbed src="/s/sense-charity?embed=true" title="Aura Demo" aspect="16/9" />

      {/* ===== Text Animation ===== */}
      <DocH2 id="text-animation">Text Animation</DocH2>
      <DocP>Text animations can make your content more engaging and highlight important information. Here are various text animation techniques:</DocP>

      <DocH3>Character Reveal</DocH3>
      <DocP>Reveal text character by character, creating a typing effect. Perfect for headers and introductions.</DocP>
      <DocCodeBlock>Create a typing animation that reveals each character with a 50ms delay between characters for the main headline.</DocCodeBlock>

      <DocH4>Word Fade Up</DocH4>
      <DocCodeBlock>{`@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(20px); }
  10%, 80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}`}</DocCodeBlock>
      <DocP>Create a staggered fade-up animation for each word in the tagline, with 100ms delay between each word, moving from 10px below to their final position.</DocP>

      <DocH4>Letter by Letter</DocH4>
      <DocCodeBlock>{`@keyframes letterAppear {
  0%, 30% { opacity: 0; transform: scale(0.8); }
  40%, 80% { opacity: 1; transform: scale(1); }
  90%, 100% { opacity: 0; transform: scale(1.2); }
}`}</DocCodeBlock>
      <DocP>Create a letter-by-letter animation that reveals each character with a subtle scale effect and 80ms staggered delay.</DocP>

      <DocH4>Combined Animation</DocH4>
      <DocCodeBlock>{`@keyframes combinedAnim {
  0%, 30% { opacity: 0; transform: translateY(15px); filter: blur(8px); }
  40%, 80% { opacity: 1; transform: translateY(0); filter: blur(0); }
  90%, 100% { opacity: 0; transform: translateY(-15px); filter: blur(8px); }
}`}</DocCodeBlock>
      <DocP>Create a complex animation that fades in, slides up, and reduces blur for each letter with a 60ms staggered delay between characters.</DocP>

      <DocH4>Gradient Text</DocH4>
      <DocCodeBlock>{`@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`}</DocCodeBlock>
      <DocP>Apply a moving gradient background from blue to purple to the main heading, with the gradient animating horizontally over 3 seconds in a loop.</DocP>

      <DocH4>Blur Transition</DocH4>
      <DocCodeBlock>{`@keyframes blurText {
  0%, 100% { filter: blur(0); }
  50% { filter: blur(4px); }
}`}</DocCodeBlock>
      <DocP>Create a text transition that blurs from 0 to 5px and back when switching between content states, with a 400ms transition duration.</DocP>

      <DocH4>Clipped Slide In</DocH4>
      <DocCodeBlock>{`.clip-slide-animation {
  display: inline-block;
  position: relative;
  animation: clipSlide 3s ease-in-out infinite;
}`}</DocCodeBlock>
      <DocP>Create a text animation that slides in with a clipping mask effect that reveals the text from left to right over 800ms with an ease-out timing function.</DocP>

      <DocH4>3D Transform</DocH4>
      <DocCodeBlock>{`.perspective-container { perspective: 800px; }
.text-flip-3d {
  display: inline-block;
  animation: flip3D 1s ease-in-out;
}`}</DocCodeBlock>
      <DocP>Apply a 3D transformation to heading text that rotates around the Y-axis with proper perspective, creating a realistic 3D flip effect with 700ms duration.</DocP>

      <DocProTip label="Text Animation Considerations">
        Keep text animations subtle and brief to avoid distracting users from your content. Ensure animated text remains readable, and always provide a fallback for users who prefer reduced motion using the <code>prefers-reduced-motion</code> media query.
      </DocProTip>

      {/* ===== Card Animation ===== */}
      <DocH2 id="card-animation">Card Animation</DocH2>
      <DocP>Card animations add depth and interactivity to your UI, helping users understand interactions and hierarchy. Here are common card animation patterns:</DocP>

      <DocH3>Hover Scale Effect</DocH3>
      <DocP>A subtle scale effect on hover creates a sense of elevation and interactivity.</DocP>
      <DocCodeBlock>Add a hover effect to product cards that scales them to 1.05x their size and adds a subtle shadow with a smooth 300ms transition.</DocCodeBlock>

      <DocH3>Tilt Effect</DocH3>
      <DocP>A 3D tilt effect that follows the cursor creates an immersive, interactive feel.</DocP>
      <DocCodeBlock>{`Create a 3D tilt effect for feature cards that responds to cursor position,
with a maximum rotation of 10 degrees and a subtle shadow that shifts with the tilt angle.

.perspective-card {
  perspective: 1000px;
  transform-style: preserve-3d;
}`}</DocCodeBlock>

      <DocH3>Staggered Entrance</DocH3>
      <DocP>Cards that enter the viewport one after another with a slight delay create a pleasing cascade effect.</DocP>
      <DocCodeBlock>{`Implement a staggered entrance animation for testimonial cards where each card
fades in and moves up with a 100ms delay between each card.

@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  20%, 80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}`}</DocCodeBlock>

      <DocH3>Flip Cards</DocH3>
      <DocP>Flip cards reveal additional information or functionality with a 3D rotation effect.</DocP>
      <DocCodeBlock>{`Create flip cards that rotate 180 degrees on hover to reveal additional information
on the back side, with a smooth 3D rotation effect.

.flip-card { perspective: 1000px; }
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}`}</DocCodeBlock>

      {/* ===== Button Animation ===== */}
      <DocH2 id="button-animation">Button Animation</DocH2>
      <DocP>Interactive button animations provide critical feedback to users and enhance the feeling of responsiveness. Here are various button animation techniques:</DocP>

      <DocH3>Scale & Color</DocH3>
      <DocP>Combines subtle scale change with color shift for clear feedback.</DocP>
      <DocCodeBlock>Create a button that scales to 1.05x size and shifts from blue-500 to blue-600 on hover with a 250ms transition.</DocCodeBlock>

      <DocH3>Ripple Effect</DocH3>
      <DocP>Creates a ripple effect that radiates from the click point.</DocP>
      <DocCodeBlock>{`Add a Material Design-inspired ripple effect that expands from the click point
outward with a subtle fade-out animation.

.ripple-button { position: relative; overflow: hidden; }
.ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  background-color: rgba(255, 255, 255, 0.5);
  animation: ripple 0.6s linear;
}`}</DocCodeBlock>

      <DocH3>Border Animation</DocH3>
      <DocP>Create a button with an animated border that appears to draw around the button's perimeter on hover.</DocP>
      <DocCodeBlock>{`Create a button with an animated border that appears to draw around the button's
perimeter on hover, taking 1 second to complete the animation.

.border-button {
  position: relative;
  border: none;
  border-radius: 4px;
  z-index: 1;
}
.border-button:before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: inherit;
}`}</DocCodeBlock>

      <DocH3>Icon Slide</DocH3>
      <DocP>Create a button where the text slides left and an arrow icon appears from the right on hover, with a smooth 300ms transition.</DocP>
      <DocCodeBlock>{`.icon-slide-button {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100px;
}`}</DocCodeBlock>

      <DocH3>Pulse Glow</DocH3>
      <DocP>Add a pulsing glow effect to the CTA button that expands and fades out repeatedly to draw attention to important actions.</DocP>
      <DocCodeBlock>{`.pulse-button {
  position: relative;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}`}</DocCodeBlock>

      <DocH3>Loading State</DocH3>
      <DocP>Create a button that shows a loading spinner when clicked, with text fading out and spinner fading in during the loading state.</DocP>
      <DocCodeBlock>{`.loading-button { position: relative; min-width: 100px; }
.loading-spinner {
  display: none;
  position: absolute;
  width: 20px;
  height: 20px;
  top: calc(50% - 10px);
  left: calc(50% - 10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}`}</DocCodeBlock>

      <DocEmbed src="/share/Op7CKy3?embed=true" title="Aura Demo" aspect="16/9" />

      {/* ===== Alert Animation ===== */}
      <DocH2 id="alert-animation">Alert Animation</DocH2>
      <DocP>Alert animations help draw attention to important messages and provide feedback to users. Effective alert animations are noticeable without being disruptive:</DocP>

      <DocH3>Slide Down Alert</DocH3>
      <DocP>Alert slides down from the top of the container and automatically dismisses.</DocP>
      <DocCodeBlock>{`Create a success alert that slides down from the top of the page, remains visible
for 5 seconds, then slides back up and out of view.

.slide-down-enter { animation: slideDownEnter 0.3s forwards; }
.slide-up-exit { animation: slideUpExit 0.3s forwards; }

@keyframes slideDownEnter {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}`}</DocCodeBlock>

      <DocH3>Shake Animation (Error)</DocH3>
      <DocP>Alert fades in with a shake animation to draw attention to critical errors.</DocP>
      <DocCodeBlock>{`Create an error alert that fades in and shakes horizontally three times to draw
attention to critical errors or warnings.

.fade-in { animation: fadeIn 0.3s forwards; }
.fade-out { animation: fadeOut 0.3s forwards; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }`}</DocCodeBlock>

      <DocH3>Toast Notification</DocH3>
      <DocP>Toast notification slides in from the right with an auto-dismiss progress indicator.</DocP>
      <DocCodeBlock>{`Create a toast notification that slides in from the right edge, shows a progress
bar indicating how long until it auto-dismisses, then slides out to the right.

.slide-left-enter { animation: slideLeftEnter 0.3s forwards; }
.slide-right-exit { animation: slideRightExit 0.3s forwards; }`}</DocCodeBlock>

      <DocH3>Stacked Notifications</DocH3>
      <DocP>Create a system for stacked notifications where new alerts appear at the bottom and push existing alerts upward, with animations for both entrance and exit.</DocP>
      <DocCodeBlock>{`.scale-in {
  animation: scaleIn 0.3s forwards;
  transform-origin: bottom right;
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`}</DocCodeBlock>

      {/* ===== Animation Timing ===== */}
      <DocH2 id="animation-timing">Animation Timing</DocH2>
      <DocP>Timing functions and duration choices can dramatically affect how animations feel. The right timing creates natural, pleasing motion that enhances user experience:</DocP>

      <DocH3>Easing Functions</DocH3>
      <DocP>Different easing functions create different feelings of movement and impact how natural animations feel.</DocP>
      <DocCodeBlock>{`Apply an ease-in-out timing function to create smooth, natural movement for UI
elements that slide into view, with acceleration at the start and deceleration at the end.

.linear-demo { animation: moveRight 3s linear infinite; }
.ease-demo { animation: moveRight 3s ease infinite; }
.ease-in-demo { animation: moveRight 3s ease-in infinite; }
.ease-out-demo { animation: moveRight 3s ease-out infinite; }
.ease-in-out-demo { animation: moveRight 3s ease-in-out infinite; }`}</DocCodeBlock>

      <DocProTip label="Animation Timing Best Practices">
        Match the timing function to the animation's purpose. Use shorter durations (150-250ms) for small element interactions like button hover effects to maintain responsiveness, and longer durations (400-500ms) for entrance animations to create emphasis.
      </DocProTip>

      <DocEmbed src="/share/AiWgXq0?embed=true" title="Aura Demo" aspect="16/9" />

      {/* ===== Animation Examples ===== */}
      <DocH2 id="animation-examples">Animation Examples</DocH2>
      <DocP>Visual examples of common animation patterns you can implement with CSS:</DocP>

      <DocProTip label="Animation Performance Tips">
        For optimal performance, animate only <code>transform</code> and <code>opacity</code> properties when possible. These properties can be hardware-accelerated and don't trigger layout recalculations. Avoid animating properties like <code>width</code>, <code>height</code>, or <code>margin</code> that cause layout reflows.
      </DocProTip>

      {/* ===== Animation Prompt Builder ===== */}
      <DocH2 id="prompt-builder">Animation Prompt Builder</DocH2>
      <DocP>Build effective animation prompts by customizing key parameters below. This tool helps you generate clear, detailed instructions for creating animations.</DocP>
      <DocUL>
        <DocLI title="Animation Type">Fade, Slide, Scale, Rotate, Blur</DocLI>
        <DocLI title="Duration">800ms (Fast / Medium / Slow)</DocLI>
        <DocLI title="Delay">0ms (None / Medium / Long)</DocLI>
        <DocLI title="Easing Function">Linear, Ease, Ease In, Ease Out, Ease In-Out, Bounce</DocLI>
        <DocLI title="Iterations">1 (Once), 2 (Twice), 3 (Thrice), ∞ (Infinite)</DocLI>
        <DocLI title="Direction">Normal, Reverse, Alternate, Alternate-Reverse</DocLI>
      </DocUL>
      <DocP muted>Generated Prompt example:</DocP>
      <DocCodeBlock>Create a fade in animation for all elements on the page that transitions from opacity 0 to 1 over 800ms with ease-in-out timing function and a 0ms delay.</DocCodeBlock>

      <DocProTip label="Prompt Builder Tips">
        Be specific about what elements should animate. Combine animation properties for complex effects. Always consider performance and accessibility when implementing animations.
      </DocProTip>

      {/* ===== Example Animation Prompts ===== */}
      <DocH2 id="examples">Example Animation Prompts</DocH2>
      <DocP>Use these example prompts as starting points for your own animation requests. These examples cover various common animation scenarios:</DocP>

      <DocH3>Hero Section Entrance</DocH3>
      <DocCodeBlock>{`Create a staggered entrance animation for the hero section where the heading
fades in and slides up from 20px below, followed by the subheading 200ms later,
and finally the CTA button 300ms after that. Use an ease-out timing function
with a 600ms duration.`}</DocCodeBlock>

      <DocH3>Page Transition</DocH3>
      <DocCodeBlock>{`Create a smooth page transition effect where the current page fades out while
sliding slightly to the left (transform: translateX(-20px)), and the new page
fades in while sliding from the right (transform: translateX(20px) to 0).
Use a 350ms duration with ease-in-out timing.`}</DocCodeBlock>

      <DocH3>Interactive Button Animation</DocH3>
      <DocCodeBlock>{`Add a multi-state animation to call-to-action buttons where on hover, the button
scales to 1.03x with a subtle shadow increase (box-shadow: 0 4px 12px rgba(0,0,0,0.1)),
and on click, it scales down to 0.98x momentarily before returning to hover state.
Use a quick 150ms duration for the click animation.`}</DocCodeBlock>

      <DocH3>Loading Animation</DocH3>
      <DocCodeBlock>{`Create a loading animation using three dots that fade and scale in sequence.
Each dot should scale from 0.5 to 1.2 and back while fading from 0.2 to 1 opacity,
with a 200ms delay between each dot. The animation should loop infinitely to
indicate ongoing loading.`}</DocCodeBlock>

      <DocH3>Card Hover Effects</DocH3>
      <DocCodeBlock>{`Add hover animations to feature cards where the card subtly elevates
(transform: translateY(-5px)) with an increased shadow, while the icon within
the card scales up to 1.1x and changes color. The card background should also
have a subtle gradient shift effect. Implement with a 300ms transition.`}</DocCodeBlock>

      <DocH3>Scroll-Triggered Animations</DocH3>
      <DocCodeBlock>{`Implement scroll-triggered animations for content sections where elements slide
in from different directions as they enter the viewport. Left side content should
slide in from left (-30px), right side content from right (30px), and center content
should fade in while moving up from 20px below. Use IntersectionObserver to trigger
the animations.`}</DocCodeBlock>

      <DocProTip label="Customizing Example Prompts">
        Use these examples as templates, adapting the specific values, timing, and properties to match your project needs. Combine elements from different examples to create complex animation systems. Always consider performance impact and accessibility when implementing animations.
      </DocProTip>
    </article>
  ),
};
