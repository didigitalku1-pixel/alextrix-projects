import { introductionContent } from "./introduction";
import { howToDesignContent } from "./how-to-design";
import { customDomainContent } from "./custom-domain";
import { seoSettingsContent } from "./seo-settings";
import { sellingTemplatesContent } from "./selling-templates";
import { tipsForPromptingContent } from "./tips-for-prompting";
import { typographyContent } from "./prompt-for-typography";
import { stylingContent } from "./prompt-for-styling";
import { animationContent } from "./prompt-for-animation";
import { layoutContent } from "./prompt-for-layout";
import { videoTutorialsContent } from "./video-tutorials";
import { documentationContent } from "./documentation";
import { faqContent } from "./faq";
import type { LearnPageContent } from "./types";

/**
 * Registry of all learn page content.
 * Each entry's body HTML is scraped from https://www.aura.build/learn/<slug>
 * and rendered verbatim so the page is 100% identical to aura.build.
 *
 * Regenerate with: python3 /home/z/my-project/scripts/build_learn_content.py
 */
export const LEARN_PAGES: Record<string, LearnPageContent> = {
  "introduction": introductionContent,
  "how-to-design": howToDesignContent,
  "custom-domain": customDomainContent,
  "seo-settings": seoSettingsContent,
  "selling-templates": sellingTemplatesContent,
  "tips-for-prompting": tipsForPromptingContent,
  "prompt-for-typography": typographyContent,
  "prompt-for-styling": stylingContent,
  "prompt-for-animation": animationContent,
  "prompt-for-layout": layoutContent,
  "video-tutorials": videoTutorialsContent,
  "documentation": documentationContent,
  "faq": faqContent,
};

export function getLearnPage(slug: string): LearnPageContent | undefined {
  return LEARN_PAGES[slug];
}
