import { NextRequest, NextResponse } from "next/server";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { generateLicenseKey } from "@/lib/license";
import { createLicense } from "@/lib/license-db";
import { sendLicenseEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Midtrans webhook handler.
 * 
 * Midtrans sends HTTP POST notification when transaction status changes.
 * We verify the signature, then create a license + send email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Midtrans notification body fields
    const {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      transaction_id: transactionId,
      fraud_status: fraudStatus,
    } = body;
    
    // 1. Verify signature
    if (!verifyMidtransSignature({ orderId, statusCode, grossAmount, signatureKey })) {
      console.error("Midtrans webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    // 2. Check transaction status — only process successful payments
    const successStatuses = ["settlement", "capture"];
    if (!successStatuses.includes(transactionStatus)) {
      console.log(`Midtrans webhook: status=${transactionStatus}, skipping`);
      return NextResponse.json({ status: "ignored", reason: `status=${transactionStatus}` });
    }
    
    // 3. Check fraud status (if applicable)
    if (fraudStatus && fraudStatus !== "accept") {
      console.error(`Midtrans webhook: fraud_status=${fraudStatus}`);
      return NextResponse.json({ error: "Fraud detected" }, { status: 403 });
    }
    
    // 4. Extract customer email from body
    const customerEmail = body.customer_email || body.email;
    if (!customerEmail) {
      console.error("Midtrans webhook: no customer email in payload");
      return NextResponse.json({ error: "No customer email" }, { status: 400 });
    }
    
    // 5. Generate license key
    const licenseKey = generateLicenseKey();
    const price = parseInt(grossAmount, 10) || 99000;
    
    // 6. Create license in database
    const license = await createLicense({
      licenseKey,
      email: customerEmail,
      price,
      midtransOrderId: orderId,
      midtransTransactionId: transactionId,
    });
    
    if (!license) {
      console.error("Midtrans webhook: failed to create license for order " + orderId);
      return NextResponse.json({ error: "Failed to create license" }, { status: 500 });
    }

    // SECURITY: Do NOT log license key or customer email (PII leak to Vercel logs / observability tools)
    // Only log order ID + status (order IDs are already in Midtrans logs)
    console.log(`[webhook] License created for order ${orderId}`);

    // 7. Send email with license key
    const emailSent = await sendLicenseEmail({
      email: customerEmail,
      licenseKey,
      orderId,
    });

    if (!emailSent) {
      // SECURITY: Don't log email address. Just log order ID + failure reason.
      console.warn(`[webhook] Email send failed for order ${orderId} (license still created)`);
    }

    // SECURITY: Don't return license_key in response body.
    // Midtrans doesn't need it (they only need 200 OK), and the response goes through
    // Vercel's edge network where it could be logged.
    return NextResponse.json({
      status: "success",
      order_id: orderId,
      email_sent: emailSent,
    });
  } catch (e) {
    // SECURITY: Don't log full error object (may contain email/key in stack trace)
    console.error("[webhook] Midtrans webhook exception:", e instanceof Error ? e.message : "Unknown error");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
