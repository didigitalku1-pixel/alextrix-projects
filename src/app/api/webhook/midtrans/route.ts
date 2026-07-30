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
      console.error("Midtrans webhook: failed to create license");
      return NextResponse.json({ error: "Failed to create license" }, { status: 500 });
    }
    
    console.log(`✅ License created: ${licenseKey} for ${customerEmail}`);
    
    // 7. Send email with license key
    const emailSent = await sendLicenseEmail({
      email: customerEmail,
      licenseKey,
      orderId,
    });
    
    if (!emailSent) {
      console.warn(`⚠️ Email not sent to ${customerEmail} (license still created)`);
    }
    
    return NextResponse.json({
      status: "success",
      license_key: licenseKey,
      email_sent: emailSent,
    });
  } catch (e) {
    console.error("Midtrans webhook exception:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
