import { NextRequest, NextResponse } from "next/server";
import { getLicenseClient } from "@/lib/license-db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/cron/cleanup-devices
 *
 * Auto-deactivates devices that have not been seen for >30 days.
 *
 * Auth: caller must send CRON_SECRET env var via:
 *   - Header: Authorization: Bearer <CRON_SECRET>
 *   - Or query: ?token=<CRON_SECRET>
 *
 * This endpoint is idempotent — safe to call multiple times.
 *
 * Recommended triggers (configure BOTH for redundancy):
 *
 * 1. Vercel Cron (vercel.json):
 *    {
 *      "crons": [
 *        { "path": "/api/cron/cleanup-devices?token=XXX", "schedule": "0 3 * * *" }
 *      ]
 *    }
 *    NOTE: Vercel Cron on Hobby plan is limited to 2 cron jobs daily.
 *
 * 2. UptimeRobot / cron-job.org (free, more reliable):
 *    - URL: https://alextrix-projects.vercel.app/api/cron/cleanup-devices?token=XXX
 *    - Method: POST (or GET)
 *    - Schedule: daily at 10:00 (WIB) = 03:00 UTC
 *
 * 3. Supabase pg_cron (alternative, runs in DB):
 *    See: supabase/migrations/0003_auto_cleanup.sql
 */
function checkCronAuth(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    if (auth.slice(7).trim() === expected) return true;
  }

  const url = new URL(req.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken === expected) return true;

  return false;
}

export async function POST(req: NextRequest) {
  if (!checkCronAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return runCleanup();
}

// Also allow GET for simple uptime-monitor triggers (e.g. UptimeRobot only supports GET/HEAD)
export async function GET(req: NextRequest) {
  if (!checkCronAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return runCleanup();
}

async function runCleanup() {
  const startedAt = Date.now();
  try {
    const client = getLicenseClient();

    // 1. Find all device rows that:
    //    - Are still active (deactivated_at IS NULL)
    //    - Have last_seen_at older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: staleDevices, error: fetchError } = await client
      .from("license_devices")
      .select("id, license_id, device_id, last_seen_at, licenses!inner(license_key, max_devices, active_devices, device_ids)")
      .is("deactivated_at", null)
      .lt("last_seen_at", thirtyDaysAgo)
      .limit(500); // batch limit to avoid timeout

    if (fetchError) {
      console.error("Cleanup fetch error:", fetchError);
      return NextResponse.json({ success: false, error: "Database fetch error" }, { status: 500 });
    }

    if (!staleDevices || staleDevices.length === 0) {
      return NextResponse.json({
        success: true,
        cleaned: 0,
        duration_ms: Date.now() - startedAt,
        message: "No stale devices found",
      });
    }

    // 2. Deactivate each stale device
    let cleanedCount = 0;
    const errors: string[] = [];
    const licensesToUpdate = new Map<string, { removedDeviceId: string }>();

    for (const device of staleDevices) {
      try {
        // Mark device as deactivated
        const { error: updateDeviceError } = await client
          .from("license_devices")
          .update({ deactivated_at: new Date().toISOString() })
          .eq("id", device.id);

        if (updateDeviceError) {
          errors.push(`Device ${device.device_id}: ${updateDeviceError.message}`);
          continue;
        }

        // Track which licenses need their device_ids / active_devices columns updated
        const licenseData = device.licenses as any;
        if (licenseData && licenseData.license_key) {
          const existing = licensesToUpdate.get(licenseData.license_key);
          if (!existing) {
            licensesToUpdate.set(licenseData.license_key, { removedDeviceId: device.device_id });
          }
        }

        cleanedCount++;
      } catch (err: any) {
        errors.push(`Device ${device.device_id}: ${err.message}`);
      }
    }

    // 3. Update licenses table: remove device_id from device_ids array + decrement active_devices
    for (const [licenseKey, info] of licensesToUpdate.entries()) {
      try {
        const { data: license } = await client
          .from("licenses")
          .select("id, device_ids, active_devices")
          .eq("license_key", licenseKey)
          .single();

        if (!license) continue;

        const currentDeviceIds: string[] = Array.isArray(license.device_ids) ? license.device_ids : [];
        const newDeviceIds = currentDeviceIds.filter((id) => id !== info.removedDeviceId);
        const newActiveCount = Math.max(0, license.active_devices - 1);

        await client
          .from("licenses")
          .update({
            device_ids: newDeviceIds,
            active_devices: newActiveCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", license.id);
      } catch (err: any) {
        errors.push(`License ${licenseKey} sync: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      cleaned: cleanedCount,
      licenses_updated: licensesToUpdate.size,
      duration_ms: Date.now() - startedAt,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (e: any) {
    console.error("Cleanup exception:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Internal error", duration_ms: Date.now() - startedAt },
      { status: 500 },
    );
  }
}
