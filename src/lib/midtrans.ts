/**
 * Midtrans payment gateway integration.
 * 
 * Docs: https://docs.midtrans.com/
 * 
 * Flow:
 * 1. User clicks "Buy" → create Snap Token via Midtrans API
 * 2. Frontend redirect to Midtrans Snap payment page
 * 3. User pays (QRIS/e-wallet/card)
 * 4. Midtrans sends webhook to /api/webhook/midtrans
 * 5. Backend verifies signature + creates license
 */

import crypto from "crypto";

/**
 * Create a Midtrans Snap Transaction for Alextrix lifetime license.
 */
export async function createSnapTransaction(params: {
  orderId: string;
  price: number;
  customerEmail: string;
  customerName?: string;
}): Promise<{ token: string; redirectUrl: string } | null> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  
  if (!serverKey) {
    console.error("MIDTRANS_SERVER_KEY not set");
    return null;
  }
  
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  
  const authHeader = Buffer.from(serverKey + ":").toString("base64");
  
  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.price,
    },
    item_details: [
      {
        id: "alextrix-lifetime",
        name: "Alextrix Lifetime Access",
        price: params.price,
        quantity: 1,
        category: "Software License",
      },
    ],
    customer_details: {
      email: params.customerEmail,
      first_name: params.customerName || params.customerEmail.split("@")[0],
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.alextrix.dev"}/activate?order=${params.orderId}`,
    },
  };
  
  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      console.error("Midtrans API error:", res.status, await res.text());
      return null;
    }
    
    const data = await res.json();
    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  } catch (e) {
    console.error("Midtrans API exception:", e);
    return null;
  }
}

/**
 * Verify Midtrans webhook notification signature.
 * 
 * Midtrans Signature Key = SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;
  
  const expected = crypto
    .createHash("sha512")
    .update(params.orderId + params.statusCode + params.grossAmount + serverKey)
    .digest("hex");
  
  return expected === params.signatureKey;
}

/**
 * Generate a unique Midtrans order ID.
 * Format: ALX-ORDER-{timestamp}-{random}
 */
export function generateOrderId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ALX-ORDER-${ts}-${rand}`;
}
