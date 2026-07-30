/**
 * Supabase client for license operations (server-side only).
 * Uses service role key for full DB access.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getLicenseClient(): SupabaseClient {
  if (_client) return _client;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.USER_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase env vars for license client");
  }
  
  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

/**
 * License record from database.
 */
export interface LicenseRecord {
  id: string;
  license_key: string;
  email: string;
  status: "active" | "revoked" | "expired";
  price: number;
  currency: string;
  purchase_date: string;
  midtrans_order_id: string | null;
  midtrans_transaction_id: string | null;
  max_devices: number;
  active_devices: number;
  device_ids: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch a license by key.
 */
export async function getLicenseByKey(key: string): Promise<LicenseRecord | null> {
  const client = getLicenseClient();
  const { data, error } = await client
    .from("licenses")
    .select("*")
    .eq("license_key", key)
    .single();
  
  if (error || !data) return null;
  return data as LicenseRecord;
}

/**
 * Insert a new license record.
 */
export async function createLicense(params: {
  licenseKey: string;
  email: string;
  price: number;
  midtransOrderId?: string;
  midtransTransactionId?: string;
}): Promise<LicenseRecord | null> {
  const client = getLicenseClient();
  const { data, error } = await client
    .from("licenses")
    .insert({
      license_key: params.licenseKey,
      email: params.email,
      status: "active",
      price: params.price,
      currency: "IDR",
      midtrans_order_id: params.midtransOrderId || null,
      midtrans_transaction_id: params.midtransTransactionId || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Failed to create license:", error);
    return null;
  }
  return data as LicenseRecord;
}

/**
 * Activate a device for a license.
 * Returns { success, error?, license? }
 */
export async function activateDevice(
  licenseKey: string,
  deviceId: string,
  deviceName?: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<{ success: boolean; error?: string; license?: LicenseRecord }> {
  const client = getLicenseClient();
  
  // 1. Fetch license
  const license = await getLicenseByKey(licenseKey);
  if (!license) return { success: false, error: "License key tidak ditemukan" };
  if (license.status !== "active") return { success: false, error: "License telah dicabut atau kedaluwarsa" };
  
  // 2. Check if device already activated
  const deviceIds: string[] = Array.isArray(license.device_ids) ? license.device_ids : [];
  if (deviceIds.includes(deviceId)) {
    // Device already registered — update last_seen
    await client
      .from("license_devices")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("license_id", license.id)
      .eq("device_id", deviceId);
    return { success: true, license };
  }
  
  // 3. Check device limit
  if (license.active_devices >= license.max_devices) {
    return {
      success: false,
      error: `Batas device tercapai (${license.max_devices}). Nonaktifkan salah satu device di halaman /manage`,
    };
  }
  
  // 4. Add device
  const newDeviceIds = [...deviceIds, deviceId];
  const { error: updateError } = await client
    .from("licenses")
    .update({
      device_ids: newDeviceIds,
      active_devices: license.active_devices + 1,
    })
    .eq("id", license.id);
  
  if (updateError) return { success: false, error: "Gagal mengaktifkan device" };
  
  // 5. Log device activation
  await client.from("license_devices").insert({
    license_id: license.id,
    device_id: deviceId,
    device_name: deviceName || null,
    user_agent: userAgent || null,
    ip_address: ipAddress || null,
  });
  
  // 6. Return updated license
  const updated = await getLicenseByKey(licenseKey);
  return { success: true, license: updated || undefined };
}

/**
 * Deactivate a device for a license.
 */
export async function deactivateDevice(
  licenseKey: string,
  deviceId: string,
): Promise<{ success: boolean; error?: string }> {
  const client = getLicenseClient();
  
  const license = await getLicenseByKey(licenseKey);
  if (!license) return { success: false, error: "License tidak ditemukan" };
  
  const deviceIds: string[] = Array.isArray(license.device_ids) ? license.device_ids : [];
  if (!deviceIds.includes(deviceId)) {
    return { success: false, error: "Device tidak ditemukan" };
  }
  
  const newDeviceIds = deviceIds.filter((id) => id !== deviceId);
  const { error } = await client
    .from("licenses")
    .update({
      device_ids: newDeviceIds,
      active_devices: Math.max(0, license.active_devices - 1),
    })
    .eq("id", license.id);
  
  if (error) return { success: false, error: "Gagal menonaktifkan device" };
  
  // Update device log
  await client
    .from("license_devices")
    .update({ deactivated_at: new Date().toISOString() })
    .eq("license_id", license.id)
    .eq("device_id", deviceId);
  
  return { success: true };
}

/**
 * Revoke a license (for refunds).
 */
export async function revokeLicense(licenseKey: string): Promise<boolean> {
  const client = getLicenseClient();
  const { error } = await client
    .from("licenses")
    .update({ status: "revoked" })
    .eq("license_key", licenseKey);
  
  return !error;
}

/**
 * Get all devices for a license.
 */
export async function getDevices(licenseKey: string): Promise<any[]> {
  const client = getLicenseClient();
  const license = await getLicenseByKey(licenseKey);
  if (!license) return [];
  
  const { data } = await client
    .from("license_devices")
    .select("*")
    .eq("license_id", license.id)
    .is("deactivated_at", null)
    .order("activated_at", { ascending: false });
  
  return data || [];
}
