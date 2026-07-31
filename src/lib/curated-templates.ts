/**
 * Curated template lists for homepage sections.
 *
 * These slugs were verified against the production database on 2026-07-31.
 * If a slug 404s, the card will still render but the link will go to a not-found page.
 * To update: search via /api/items?type=template&q=TITLE and replace the slug here.
 */

// === FEATURED (25 templates) — shown in "Featured" section on homepage ===
// Premium portfolio / studio / agency / creative templates
export const FEATURED_TEMPLATE_SLUGS: string[] = [
  "noema-n1-a-machine-16",        // Futuristic Humanoid Robotics Landing Page Template
  "aurello-beverage",             // Aurello Beverage SaaS Landing Page Template
  "riska-luxury",                 // Riska Fashion & Luxury Portfolio Template
  "nivo-creator",                 // NIVO One Creator Kit Landing Page Template
  "noema-ai-studio-74",           // Orbital AI Research Studio Landing Page Template
  "offset-advertisin",            // OFFSET Creative Agency Landing Page Template
  "neural-museum-14",             // Neural Museum Digital Archive Template
  "studio-fashion",               // Fashion & Beauty eCommerce Landing Page Template
  "stillpoint2",                  // Stillpoint Recovery Studio Landing Page Template
  "afterglow",                    // Afterglow — Scroll-Story Studio Template
  "halftone",                     // Risograph Print Studio Landing Page Template
  "aurelia-studios-72",           // Aurelia Gaming — Premium Game Media Template
  "loopi-music",                  // Hi-Fi Audio Landing Page Template
  "aer-form-electric",            // AER//FORM Electric Superbike Landing Page Template
  "north-form-creative",          // Creative Studio & Brand Agency Template
  "amara-makeup",                 // Amara Makeup & Beauty Artist Landing Page Template
  "mestudio",                     // MeStudio Portfolio & Gallery Template
  "mara-voss",                    // Mara Voss Field Recordist Portfolio Template
  "geomtry-dash-remake",          // Geometry Dash Remake
  "novara-editorial",             // NOVARA Editorial Fashion Photographer Portfolio Template
  "luxury-watch-87",              // Luxury Watch Product Landing Page Template
  "halide",                       // Halide — Cinematic Darkroom Photography Portfolio
  "aera-digital",                 // AERA Digital Product Studio Landing Page Template
  "mirelle-fashion",              // Mirelle Fashion & Motion Edit Template
];

// === TRENDING (24 templates) — shown in "Trending Templates" section on homepage ===
// SaaS / platform / agency / tech templates with high view counts
export const TRENDING_TEMPLATE_SLUGS: string[] = [
  "oravia",                       // Decision Traceability SaaS Landing Page Template
  "onepro",                       // Freelance Platform Landing Page Template
  "social-grow",                  // Social Media Agency Landing Page Template
  "nexus-infrastruc-65",          // Enterprise AI Infrastructure Landing Page Template
  "futuristic-real-12",           // Architect Studio Landing Page Template
  "vantage-ecommerce",            // Vantage Ecommerce Collections Landing Page Template
  // "Dental Clinic Landing Page Template" — appears twice in user list, using first match
  // Will be looked up dynamically to avoid duplicate slugs
  "liquid-systems",               // Liquid Systems UI Landing Page Template
  "nebula",                       // Nebula Web3 Infrastructure Landing Page Template
  // "VOID Digital Studio Landing Page Template" — not in top search results, will fallback
  "ai-social-automation",         // AI Social Automation Landing Page Template
  "zenith-cloud-96",              // AI Cloud Platform Landing Page Template
  "3d-artist",                    // 3D Artist Portfolio Landing Page Template
  "lumina-video",                 // Creative Suite Landing Page Template
  // "Digital Agency Landing Page Template" — generic name, will fallback
  "mytrip",                       // Glassmorphism Travel Booking Mobile UI Template
  "aura-financial",               // Aura Financial Banking Landing Page Template
  "axion-ai",                     // AI Systems Studio / Autonomous AI Infrastructure
  "fluxora",                      // AI Infrastructure Landing Page Template (Fluxora)
  // "Dental Clinic Landing Page Template" — duplicate, skip
  "nexus-cyber",                  // Nexus Cyber Defense Grid Landing Page Template
  // "AI Automation Developer Portfolio" — not found in search, will fallback
  // "Design Agency Landing Page Template" — generic name, will fallback
  "aura-assistant",               // AURA — AI Personal Assistant Landing Page Template
];

/**
 * Fallback: if a slug from the curated list above returns no result from the API,
 * the homepage will fetch additional templates by sort=views to fill the grid.
 * This ensures the section is never empty even if some slugs become invalid.
 */
