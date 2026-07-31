import { NextRequest, NextResponse } from "next/server";
import { verifySignedCookie, COOKIE_NAME, needsRenewal, createSignedCookie, COOKIE_MAX_AGE } from "@/lib/license";

/**
 * Demo template slugs — accessible WITHOUT license.
 * User can preview these 3 templates before buying.
 */
const DEMO_SLUGS = [
  "interactive-globe-hero-section",
  "animated-gradient-beam",
  "community-hero-section",
];

/**
 * Public paths — accessible without license cookie.
 */
const PUBLIC_PATHS = [
  "/activate",
  "/thank-you",
  "/api/activate",
  "/api/deactivate",
  "/api/create-payment",
  "/api/webhook",
  "/api/stats",
  "/api/tags",
  "/api/image",
  "/api/skill-thumb",
  "/api/learn",
  "/api/design-systems", // design systems list is public
  "/api/admin/licenses", // admin panel uses its own token auth (ADMIN_TOKEN env var)
  "/api/admin/logout", // admin logout endpoint (clears cookie)
  "/api/admin/bootstrap", // one-time DB migration endpoint (auth via ADMIN_TOKEN)
  "/admin/licenses", // admin UI page (auth via token in URL ?token=XXX)
  "/admin/guide", // admin documentation page (public, no secrets shown)
  "/manage", // device management page (uses license key input, no cookie required)
  "/api/cron/cleanup-devices", // cron job endpoint (auth via CRON_SECRET env var)
];

/**
 * Check if a path is a demo template detail page.
 * Demo templates: /templates/interactive-globe-hero-section, etc.
 */
function isDemoTemplate(pathname: string): boolean {
  if (!pathname.startsWith("/templates/")) return false;
  const slug = pathname.replace("/templates/", "");
  return DEMO_SLUGS.includes(slug);
}

/**
 * Check if a path is public (no license required).
 */
function isPublicPath(pathname: string): boolean {
  // Exact match
  if (PUBLIC_PATHS.some((p) => pathname === p)) return true;
  // Prefix match (e.g., /api/webhook/midtrans matches /api/webhook)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  // Root homepage is public (landing page preview)
  if (pathname === "/") return true;
  // Demo templates
  if (isDemoTemplate(pathname)) return true;
  // Static assets
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon") || pathname.startsWith("/logo")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  try {
    // Check for license cookie
    const cookie = req.cookies.get(COOKIE_NAME)?.value;

    if (!cookie) {
      // No cookie → redirect to activation page
      const activateUrl = new URL("/activate", req.url);
      activateUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(activateUrl);
    }

    // Verify cookie (async — Web Crypto API)
    const decoded = await verifySignedCookie(cookie);

    if (!decoded) {
      // Invalid/expired cookie → redirect to activation
      const activateUrl = new URL("/activate", req.url);
      activateUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(activateUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Auto-renew cookie if close to expiry (sliding window)
    if (needsRenewal(decoded.exp)) {
      const newCookie = await createSignedCookie(decoded.licenseKey, decoded.deviceId);
      const response = NextResponse.next();
      response.cookies.set(COOKIE_NAME, newCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
      return response;
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    // On any middleware error, redirect to activation page (safer than 500)
    const activateUrl = new URL("/activate", req.url);
    activateUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(activateUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

/**
 * Configure which paths the middleware runs on.
 * Runs on all paths EXCEPT static assets and Next.js internals.
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (static assets)
     * - favicon.ico, logo.svg
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt|sitemap.xml).*)",
  ],
};
