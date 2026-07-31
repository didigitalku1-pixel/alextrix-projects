import { NextRequest, NextResponse } from "next/server";
import { getLicenseClient } from "@/lib/license-db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/bootstrap
 *
 * One-time endpoint to run database migrations (creates admin licenses,
 * sets default max_devices=10 for existing records, etc).
 *
 * This endpoint uses the Supabase service role key that's already configured
 * in Vercel env vars (SUPABASE_SERVICE_ROLE_KEY) — no manual SQL Editor needed
 * for the basic setup.
 *
 * Auth: same as /api/admin/licenses (ADMIN_TOKEN env var).
 *
 * Idempotent: safe to call multiple times. Uses select-then-insert-or-update.
 *
 * NOTE: This endpoint CANNOT:
 *   - ALTER TABLE (change default value of max_devices column)
 *   - CREATE FUNCTION (cleanup_idle_devices)
 *   - CREATE EXTENSION (pg_cron)
 *
 * For those, you must run /supabase/migrations/0002_auto_cleanup_devices.sql
 * in Supabase SQL Editor manually. But /api/cron/cleanup-devices works as
 * fallback (Vercel Cron triggers it daily).
 */
function checkAdminAuth(req: NextRequest): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ") && auth.slice(7).trim() === expected) return true;

  const url = new URL(req.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken === expected) return true;

  const cookie = req.cookies.get("alextrix_admin")?.value;
  if (cookie === expected) return true;

  return false;
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const results: Array<{ step: string; status: "ok" | "error"; message?: string; data?: any }> = [];

  try {
    const client = getLicenseClient();

    // === STEP 1: Update existing licenses (non-admin/test) to max_devices=10 ===
    try {
      const { data: updatedLicenses, error: updateError } = await client
        .from("licenses")
        .update({ max_devices: 10, updated_at: new Date().toISOString() })
        .lt("max_devices", 10)
        .not("license_key", "like", "ALX-ADMIN-%")
        .not("license_key", "like", "ALX-TEST-%")
        .select("license_key");

      if (updateError) throw updateError;

      results.push({
        step: "update_existing_licenses_max_devices",
        status: "ok",
        message: `Updated ${updatedLicenses?.length || 0} existing licenses to max_devices=10`,
        data: { count: updatedLicenses?.length || 0 },
      });
    } catch (e: any) {
      results.push({
        step: "update_existing_licenses_max_devices",
        status: "error",
        message: e.message,
      });
    }

    // === STEP 2: Insert 5 admin licenses ===
    const adminLicenses = [
      { license_key: "ALX-ADMIN-001-LIFETIME-01", email: "admin01@alextrix.dev", midtrans_order_id: "ADMIN-001" },
      { license_key: "ALX-ADMIN-002-LIFETIME-02", email: "admin02@alextrix.dev", midtrans_order_id: "ADMIN-002" },
      { license_key: "ALX-ADMIN-003-LIFETIME-03", email: "admin03@alextrix.dev", midtrans_order_id: "ADMIN-003" },
      { license_key: "ALX-ADMIN-004-LIFETIME-04", email: "admin04@alextrix.dev", midtrans_order_id: "ADMIN-004" },
      { license_key: "ALX-ADMIN-005-LIFETIME-05", email: "admin05@alextrix.dev", midtrans_order_id: "ADMIN-005" },
    ];

    try {
      for (const admin of adminLicenses) {
        const { data: existing } = await client
          .from("licenses")
          .select("id, license_key")
          .eq("license_key", admin.license_key)
          .maybeSingle();

        if (existing) {
          await client
            .from("licenses")
            .update({
              max_devices: 999,
              status: "active",
              updated_at: new Date().toISOString(),
              email: admin.email,
            })
            .eq("id", existing.id);
        } else {
          await client.from("licenses").insert({
            license_key: admin.license_key,
            email: admin.email,
            status: "active",
            price: 0,
            currency: "IDR",
            max_devices: 999,
            midtrans_order_id: admin.midtrans_order_id,
            device_ids: [],
            active_devices: 0,
          });
        }
      }

      results.push({
        step: "insert_admin_licenses",
        status: "ok",
        message: `Inserted/updated 5 admin licenses (ALX-ADMIN-001-LIFETIME-01 through -05)`,
        data: { keys: adminLicenses.map((a) => a.license_key) },
      });
    } catch (e: any) {
      results.push({
        step: "insert_admin_licenses",
        status: "error",
        message: e.message,
      });
    }

    // === STEP 3: Insert/update test license ===
    try {
      const testKey = "ALX-TEST-TEST-TEST-TEST";
      const { data: existing } = await client
        .from("licenses")
        .select("id, license_key")
        .eq("license_key", testKey)
        .maybeSingle();

      if (existing) {
        await client
          .from("licenses")
          .update({
            max_devices: 999,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await client.from("licenses").insert({
          license_key: testKey,
          email: "test@alextrix.dev",
          status: "active",
          price: 0,
          currency: "IDR",
          max_devices: 999,
          midtrans_order_id: "TEST-LICENSE",
          device_ids: [],
          active_devices: 0,
        });
      }

      results.push({
        step: "insert_test_license",
        status: "ok",
        message: "Test license ALX-TEST-TEST-TEST-TEST ready (max_devices=999)",
      });
    } catch (e: any) {
      results.push({
        step: "insert_test_license",
        status: "error",
        message: e.message,
      });
    }

    // === STEP 4: Verify admin + test licenses ===
    try {
      const { data: adminData } = await client
        .from("licenses")
        .select("license_key, email, status, max_devices")
        .like("license_key", "ALX-ADMIN-%")
        .order("license_key");

      const { data: testData } = await client
        .from("licenses")
        .select("license_key, status, max_devices")
        .eq("license_key", "ALX-TEST-TEST-TEST-TEST")
        .maybeSingle();

      results.push({
        step: "verify_licenses",
        status: "ok",
        data: { admin: adminData, test: testData },
      });
    } catch (e: any) {
      results.push({
        step: "verify_licenses",
        status: "error",
        message: e.message,
      });
    }

    // === STEP 5: Note about cleanup function ===
    results.push({
      step: "cleanup_function",
      status: "ok",
      message: "Skipped (needs Supabase SQL Editor). Vercel Cron at /api/cron/cleanup-devices is the primary trigger and works without this.",
    });

    const allOk = results.every((r) => r.status === "ok");

    return NextResponse.json({
      success: allOk,
      results,
      next_steps: allOk
        ? [
            "All admin licenses are ready in the database.",
            "You can now log in with: ALX-ADMIN-001-LIFETIME-01 through -05",
            "Or use test license: ALX-TEST-TEST-TEST-TEST",
            "(Optional) Run /supabase/migrations/0002_auto_cleanup_devices.sql in Supabase SQL Editor to enable pg_cron backup cleanup.",
          ]
        : ["Some steps failed. Check the 'results' array for details."],
    });
  } catch (e: any) {
    console.error("Bootstrap exception:", e);
    return NextResponse.json(
      { success: false, error: e.message, results },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
