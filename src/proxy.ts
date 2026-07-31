import { NextRequest, NextResponse } from "next/server";

/**
 * Demo template slugs — accessible WITHOUT license.
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
  "/api/design-systems",
  "/api/admin/licenses",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/bootstrap",
  "/admin/licenses",
  "/admin/guide",
  "/manage",
  "/api/cron/cleanup-devices",
];

function isDemoTemplate(pathname: string): boolean {
  if (!pathname.startsWith("/templates/")) return false;
  const slug = pathname.replace("/templates/", "");
  return DEMO_SLUGS.includes(slug);
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p)) return true;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (pathname === "/") return true;
  if (isDemoTemplate(pathname)) return true;
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon") || pathname.startsWith("/logo")) return true;
  return false;
}

/**
 * Proxy (Next.js 16 — formerly "middleware") — verifies license cookie for protected paths.
 *
 * Note: In Next.js 16, the `middleware.ts` file convention was renamed to `proxy.ts`.
 * The export is now `proxy` (instead of `middleware`), and the config is `proxyMatcher`
 * (instead of `matcher`). See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Lazy-imports the license module so that if the module has any init error
 * (e.g., env var missing), it only affects protected paths, not public ones.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public paths (no license required)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  try {
    // Lazy import to avoid edge runtime init issues
    const { verifySignedCookie, COOKIE_NAME, needsRenewal, createSignedCookie, COOKIE_MAX_AGE } =
      await import("@/lib/license");

    const cookie = req.cookies.get(COOKIE_NAME)?.value;

    if (!cookie) {
      const activateUrl = new URL("/activate", req.url);
      activateUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(activateUrl);
    }

    const decoded = await verifySignedCookie(cookie);

    if (!decoded) {
      const activateUrl = new URL("/activate", req.url);
      activateUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(activateUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

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
    console.error("Proxy error:", err);
    // On any error, redirect to activation page
    const activateUrl = new URL("/activate", req.url);
    activateUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(activateUrl);
    response.cookies.delete("alextrix_license");
    return response;
  }
}

export const config = {
  proxyMatcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt|sitemap.xml).*)",
  ],
};
