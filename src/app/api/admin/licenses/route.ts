import { NextRequest, NextResponse } from "next/server";
import { getLicenseClient } from "@/lib/license-db";
import { generateLicenseKey, isValidLicenseKeyFormat } from "@/lib/license";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Admin authentication: simple Bearer token check.
 *
 * Set ADMIN_TOKEN in Vercel env vars (any random 32-char string).
 * Access via: /admin/licenses?token=XXX or Authorization: Bearer XXX
 *
 * For production-grade auth, replace with Supabase Auth + RBAC.
 */
function checkAdminAuth(req: NextRequest): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false; // admin disabled if no token set

  // 1. Check Authorization: Bearer XXX
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token === expected) return true;
  }

  // 2. Check ?token=XXX query param (for browser URL access)
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken && queryToken === expected) return true;

  // 3. Check cookie (set after first URL access)
  const cookie = req.cookies.get("alextrix_admin")?.value;
  if (cookie && cookie === expected) return true;

  return false;
}

/**
 * GET /api/admin/licenses?token=XXX
 *
 * Query params:
 *   - search: filter by license_key or email (substring match)
 *   - status: filter by status (active | revoked | expired)
 *   - limit: page size (default 50, max 200)
 *   - offset: pagination offset (default 0)
 *
 * Returns list of licenses (without device_ids array for performance).
 */
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = getLicenseClient();
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status") || "";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);

    let query = client
      .from("licenses")
      .select("id, license_key, email, status, price, currency, purchase_date, midtrans_order_id, max_devices, active_devices, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ["active", "revoked", "expired"].includes(status)) {
      query = query.eq("status", status);
    }

    if (search) {
      // OR filter on license_key OR email (case-insensitive)
      query = query.or(`license_key.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin licenses GET error:", error);
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      licenses: data || [],
      total: count || 0,
      limit,
      offset,
    });

    // Set admin cookie if accessed via ?token= URL (so subsequent requests work without re-sending token)
    if (url.searchParams.get("token")) {
      response.cookies.set("alextrix_admin", url.searchParams.get("token")!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });
    }

    return response;
  } catch (e) {
    console.error("Admin licenses GET exception:", e);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/licenses
 *
 * Body:
 *   - action: "create_manual" | "revoke" | "unrevoke" | "update_max_devices"
 *   - For create_manual: { email, max_devices?, license_key?, note? }
 *   - For revoke: { license_key }
 *   - For unrevoke: { license_key }
 *   - For update_max_devices: { license_key, max_devices }
 *
 * Returns the affected license record.
 */
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json({ success: false, error: "Missing action" }, { status: 400 });
    }

    const client = getLicenseClient();

    if (action === "create_manual") {
      // === Create a manual license (for giveaways, promos, partners) ===
      const email = (body.email || "").trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: "Email tidak valid" }, { status: 400 });
      }

      const maxDevices = Math.min(Math.max(parseInt(body.max_devices || "10", 10), 1), 999);
      const note = (body.note || "").slice(0, 500);

      // Use provided license_key (must pass format check) or generate one
      let licenseKey: string | undefined;
      if (body.license_key) {
        const candidateKey = String(body.license_key).trim().toUpperCase();
        if (!isValidLicenseKeyFormat(candidateKey)) {
          return NextResponse.json({ success: false, error: "Format license key tidak valid" }, { status: 400 });
        }
        // Check for duplicate
        const existing = await client.from("licenses").select("id").eq("license_key", candidateKey).maybeSingle();
        if (existing.data) {
          return NextResponse.json({ success: false, error: "License key sudah ada di database" }, { status: 409 });
        }
        licenseKey = candidateKey;
      } else {
        // Generate unique key (retry on rare collision)
        for (let attempt = 0; attempt < 5; attempt++) {
          const candidate = generateLicenseKey();
          const existing = await client.from("licenses").select("id").eq("license_key", candidate).maybeSingle();
          if (!existing.data) {
            licenseKey = candidate;
            break;
          }
        }
      }

      if (!licenseKey) {
        return NextResponse.json({ success: false, error: "Gagal generate unique key" }, { status: 500 });
      }

      const { data, error } = await client
        .from("licenses")
        .insert({
          license_key: licenseKey,
          email,
          status: "active",
          price: 0,
          currency: "IDR",
          max_devices: maxDevices,
          midtrans_order_id: note ? `MANUAL-${Date.now()}` : null,
        })
        .select()
        .single();

      if (error) {
        console.error("Create manual license error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
      }

      return NextResponse.json({ success: true, license: data });
    }

    if (action === "revoke" || action === "unrevoke") {
      const licenseKey = (body.license_key || "").trim().toUpperCase();
      if (!licenseKey) {
        return NextResponse.json({ success: false, error: "license_key required" }, { status: 400 });
      }

      const newStatus = action === "revoke" ? "revoked" : "active";
      const { error } = await client
        .from("licenses")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("license_key", licenseKey);

      if (error) {
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
      }

      // If revoking, also deactivate all devices
      if (action === "revoke") {
        const license = await client.from("licenses").select("id").eq("license_key", licenseKey).single();
        if (license.data) {
          await client
            .from("license_devices")
            .update({ deactivated_at: new Date().toISOString() })
            .eq("license_id", license.data.id)
            .is("deactivated_at", null);
          await client
            .from("licenses")
            .update({ device_ids: [], active_devices: 0 })
            .eq("license_key", licenseKey);
        }
      }

      return NextResponse.json({ success: true, status: newStatus });
    }

    if (action === "update_max_devices") {
      const licenseKey = (body.license_key || "").trim().toUpperCase();
      const maxDevices = parseInt(body.max_devices, 10);
      if (!licenseKey || isNaN(maxDevices) || maxDevices < 1 || maxDevices > 999) {
        return NextResponse.json({ success: false, error: "Invalid params" }, { status: 400 });
      }

      const { error } = await client
        .from("licenses")
        .update({ max_devices: maxDevices, updated_at: new Date().toISOString() })
        .eq("license_key", licenseKey);

      if (error) {
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
      }

      return NextResponse.json({ success: true, max_devices: maxDevices });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("Admin licenses POST exception:", e);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
