/**
 * License key generation + signed cookie utilities.
 * 
 * Uses Web Crypto API (SubtleCrypto) for Edge Runtime compatibility.
 * All HMAC functions are async — callers must await.
 * 
 * License key format: ALX-XXXX-XXXX-XXXX-XXXX (20 chars + dashes)
 */

/**
 * Generate a unique license key: ALX-XXXX-XXXX-XXXX-XXXX
 * where X is alphanumeric (uppercase, excluding ambiguous chars like O/0/I/1).
 * Uses crypto.getRandomValues (works in both Edge + Node.js).
 */
export function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const segments: string[] = [];
  
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      const arr = new Uint8Array(1);
      crypto.getRandomValues(arr);
      segment += chars[arr[0] % chars.length];
    }
    segments.push(segment);
  }
  
  return `ALX-${segments.join("-")}`;
}

/**
 * Validate license key format.
 */
export function isValidLicenseKeyFormat(key: string): boolean {
  return /^ALX-(?:[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}|ADMIN-[A-Z0-9]{3}-LIFETIME-[A-Z0-9]{3})$/.test(key);
}

/**
 * Generate a device ID (UUID v4) — stored in localStorage on client.
 * crypto.randomUUID() works in both Edge + Node.js.
 */
export function generateDeviceId(): string {
  return crypto.randomUUID();
}

// === Base64URL helpers (Edge Runtime compatible — no Buffer) ===

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToString(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
  return atob(padded);
}

function stringToBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer.slice(0) as ArrayBuffer;
}

// === HMAC functions (async — Web Crypto API) ===

/**
 * Get HMAC key for signing (cached per request).
 */
async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.LICENSE_SIGNING_SECRET;
  if (!secret) throw new Error("LICENSE_SIGNING_SECRET env var not set");
  return crypto.subtle.importKey(
    "raw",
    stringToBuffer(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * Sign a payload with HMAC-SHA256. Returns base64url signature.
 * ASYNC — uses Web Crypto API (Edge Runtime compatible).
 */
export async function signPayload(payload: string): Promise<string> {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, stringToBuffer(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Verify an HMAC signature. ASYNC.
 */
export async function verifySignature(payload: string, signature: string): Promise<boolean> {
  try {
    const key = await getHmacKey();
    // Convert base64url signature to ArrayBuffer
    const b64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
    const binary = atob(padded);
    const sigBuf = new ArrayBuffer(binary.length);
    const sigView = new Uint8Array(sigBuf);
    for (let i = 0; i < binary.length; i++) sigView[i] = binary.charCodeAt(i);
    
    return crypto.subtle.verify("HMAC", key, sigBuf, stringToBuffer(payload));
  } catch {
    return false;
  }
}

/**
 * Create a signed cookie value. ASYNC (uses signPayload).
 * Format: base64url(JSON({lk, did, exp})) + "." + signature
 */
export async function createSignedCookie(licenseKey: string, deviceId: string, expiryDays = 30): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + (expiryDays * 86400);
  const payload = JSON.stringify({ lk: licenseKey, did: deviceId, exp });
  const payloadB64 = bytesToBase64Url(new Uint8Array(stringToBuffer(payload)));
  const sig = await signPayload(payload);
  return `${payloadB64}.${sig}`;
}

/**
 * Parse and verify a signed cookie value. ASYNC.
 * Returns null if invalid, expired, or signature mismatch.
 */
export async function verifySignedCookie(cookieValue: string): Promise<{ licenseKey: string; deviceId: string; exp: number } | null> {
  try {
    const [payloadB64, sig] = cookieValue.split(".");
    if (!payloadB64 || !sig) return null;
    
    const payload = base64UrlToString(payloadB64);
    
    const isValid = await verifySignature(payload, sig);
    if (!isValid) return null;
    
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
