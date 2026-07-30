import { NextRequest, NextResponse } from "next/server";
import { createSnapTransaction, generateOrderId } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

/**
 * POST /api/create-payment
 * 
 * Body: { email: string }
 * 
 * Creates a Midtrans Snap transaction and returns the redirect URL.
 * User is redirected to Midtrans payment page (QRIS/e-wallet/card).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email tidak valid" },
        { status: 400 },
      );
    }
    
    const price = 99000; // Rp 99.000
    const orderId = generateOrderId();
    
    const snap = await createSnapTransaction({
      orderId,
      price,
      customerEmail: email,
    });
    
    if (!snap) {
      return NextResponse.json(
        { success: false, error: "Gagal membuat transaksi. Coba lagi." },
        { status: 500 },
      );
    }
    
    return NextResponse.json({
      success: true,
      redirect_url: snap.redirectUrl,
      token: snap.token,
      order_id: orderId,
    });
  } catch (e) {
    console.error("Create payment error:", e);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan" },
      { status: 500 },
    );
  }
}
