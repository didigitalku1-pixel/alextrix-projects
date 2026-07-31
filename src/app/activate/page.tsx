"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(searchParams.get("order") || "");

  // Pre-fill from URL query (?key=ALX-XXXX)
  useEffect(() => {
    const keyParam = searchParams.get("key");
    if (keyParam) setLicenseKey(keyParam.toUpperCase());
  }, [searchParams]);

  // Get or create device ID
  const getDeviceId = () => {
    let id = localStorage.getItem("alextrix_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("alextrix_device_id", id);
    }
    return id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const deviceId = getDeviceId();
      const deviceName = navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop";

      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: licenseKey.trim().toUpperCase(),
          device_id: deviceId,
          device_name: deviceName,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Aktivasi gagal");
        return;
      }

      setSuccess(true);
      // Redirect to app after 2 seconds
      const redirect = searchParams.get("redirect") || "/";
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="activate-success">
        <div className="activate-success-icon">✓</div>
        <h2>Aktivasi Berhasil!</h2>
        <p>Mengalihkan ke Alextrix...</p>
      </div>
    );
  }

  return (
    <div className="activate-card">
      {orderId && (
        <div className="activate-order-notice">
          <p>✅ Pembayaran diterima (Order: {orderId})</p>
          <p>Cek email Anda untuk license key, atau masukkan manual di bawah:</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="activate-form">
        <label className="activate-label" htmlFor="license-key">
          License Key
        </label>
        <input
          id="license-key"
          type="text"
          className="activate-input"
          placeholder="ALX-XXXX-XXXX-XXXX-XXXX atau ALX-ADMIN-001-LIFETIME-01"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
          maxLength={40}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          required
        />
        
        {error && <p className="activate-error">{error}</p>}
        
        <button
          type="submit"
          className="activate-btn"
          disabled={loading || !licenseKey}
        >
          {loading ? "Memproses..." : "Aktivasi Sekarang →"}
        </button>
      </form>
      
      <div className="activate-help">
        <p>💡 License key dikirim ke email Anda setelah pembayaran.</p>
        <p>Belum punya license? <a href="/" className="activate-link">Beli sekarang Rp 99.000</a></p>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="activate-page">
      <div className="activate-content">
        <h1 className="activate-title">Aktivasi License</h1>
        <p className="activate-subtitle">
          Masukkan license key Anda untuk mengakses 21.563+ template
        </p>
        
        <Suspense fallback={<div className="activate-card"><p>Memuat...</p></div>}>
          <ActivateForm />
        </Suspense>
      </div>
    </div>
  );
}
