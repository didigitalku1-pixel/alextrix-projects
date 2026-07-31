"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState, useEffect } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "";
  const [checking, setChecking] = useState(true);
  const [found, setFound] = useState(false);

  return (
    <div className="activate-page">
      <div className="activate-content">
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: "#16A34A",
          color: "#FFFFFF", fontSize: 36, display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 24px",
        }}>✓</div>
        
        <h1 className="activate-title">Pembayaran Berhasil!</h1>
        <p className="activate-subtitle" style={{ maxWidth: 420 }}>
          Terima kasih telah membeli Alextrix. License key telah dikirim ke email Anda.
        </p>

        <div className="activate-card" style={{ textAlign: "center" }}>
          <div style={{
            background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 12,
            padding: "16px 20px", marginBottom: 20,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
              📧 Cek email Anda (cek folder spam juga)
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#92400E" }}>
              Email biasanya tiba dalam 1-2 menit setelah pembayaran
            </p>
          </div>

          <a href="/activate" className="activate-btn" style={{ display: "block", textDecoration: "none" }}>
            Sudah dapat license key? Aktivasi →
          </a>

          {orderId && (
            <p style={{ marginTop: 16, fontSize: 11, color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
              Order ID: {orderId}
            </p>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/" style={{ color: "#6B7280", fontSize: 13, textDecoration: "none" }}>
            ← Kembali ke beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="activate-page"><div className="activate-content"><p>Memuat...</p></div></div>}>
      <ThankYouContent />
    </Suspense>
  );
}
