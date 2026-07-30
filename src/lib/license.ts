/**
 * License key generation + signed cookie utilities.
 * 
 * License key format: ALX-XXXX-XXXX-XXXX-XXXX (20 chars + dashes)
 * Uses crypto.randomUUID() for uniqueness, formatted to readable pattern.
 */

import crypto from "crypto";

/**
 * Generate a unique license key: ALX-XXXX-XXXX-XXXX-XXXX
 * where X is alphanumeric (uppercase, excluding ambiguous chars like O/0/I/1).
 */
export function generateLicenseKey(): string {
  // Safe alphabet: no O, 0, I, 1, L to avoid confusion
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const segments: string[] = [];
  
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars[crypto.randomInt(chars.length)];
    }
    segments.push(segment);
  }
  
  return `ALX-${segments.join("-")}`;
}

/**
 * Validate license key format.
 */
export function isValidLicenseKeyFormat(key: string): boolean {
  return /^ALX-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(key);
}

/**
 * Generate a device ID (UUID v4) — stored in localStorage on client.
 */
export function generateDeviceId(): string {
  return crypto.randomUUID();
}

/**
 * Sign a payload with HMAC-SHA256 using LICENSE_SIGNING_SECRET.
 * Returns base64url signature.
 */
export function signPayload(payload: string): string {
  const secret = process.env.LICENSE_SIGNING_SECRET;
  if (!secret) throw new Error("LICENSE_SIGNING_SECRET env var not set");
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Verify an HMAC signature.
 */
export function verifySignature(payload: string, signature: string): boolean {
  try {
    const expected = signPayload(payload);
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

/**
 * Create a signed cookie value containing license + device info.
 * Format: base64url(JSON({license_key, device_id, exp})) + "." + signature
 */
export function createSignedCookie(licenseKey: string, deviceId: string, expiryDays = 30): string {
  const exp = Math.floor(Date.now() / 1000) + (expiryDays * 86400);
  const payload = JSON.stringify({ lk: licenseKey, did: deviceId, exp });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = signPayload(payload);
  return `${payloadB64}.${sig}`;
}

/**
 * Parse and verify a signed cookie value.
 * Returns null if invalid, expired, or signature mismatch.
 */
export function verifySignedCookie(cookieValue: string): { licenseKey: string; deviceId: string; exp: number } | null {
  try {
    const [payloadB64, sig] = cookieValue.split(".");
    if (!payloadB64 || !sig) return null;
    
    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    
    if (!verifySignature(payload, sig)) return null;
    
    const data = JSON.parse(payload);
    if (!data.lk || !data.did || !data.exp) return null;
    
    // Check expiry
    if (Date.now() / 1000 > data.exp) return null;
    
    return {
      licenseKey: data.lk,
      deviceId: data.did,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Check if cookie needs renewal (less than 7 days until expiry).
 */
export function needsRenewal(exp: number): boolean {
  const daysLeft = (exp - Date.now() / 1000) / 86400;
  return daysLeft < 7;
}

/**
 * Constants for cookie name + max age.
 */
export const COOKIE_NAME = "alextrix_license";
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
