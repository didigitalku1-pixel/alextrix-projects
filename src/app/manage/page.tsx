"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface Device {
  device_id: string;
  device_name: string | null;
  activated_at: string;
  last_seen_at: string;
}

function ManageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [licenseKey, setLicenseKey] = useState(searchParams.get("key") || "");

  useEffect(() => {
    if (!licenseKey) {
      setError("License key tidak ditemukan. Akses halaman ini melalui link di email Anda.");
      setLoading(false);
      return;
    }
    fetchDevices();
  }, [licenseKey]);

  const fetchDevices = async () => {
    try {
      // Get device ID from localStorage
      const deviceId = localStorage.getItem("alextrix_device_id");
      
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: licenseKey, device_id: deviceId }),
      });
      
      const data = await res.json();
      if (data.success) {
        setDevices(data.devices || []);
      } else {
        setError(data.error || "Gagal memuat data device");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (deviceId: string) => {
    if (!confirm("Nonaktifkan device ini? Anda bisa mengaktifkan kembali nanti.")) return;
    
    try {
      const res = await fetch("/api/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId, license_key: licenseKey }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Refresh device list
        fetchDevices();
      } else {
        setError(data.error || "Gagal menonaktifkan device");
      }
    } catch {
      setError("Terjadi kesalahan");
    }
  };

  if (loading) {
    return <div className="manage-loading">Memuat data device...</div>;
  }

  return (
    <div className="manage-content">
      {error && <p className="manage-error">{error}</p>}
      
      {!error && (
        <>
          <div className="manage-license-info">
            <p className="manage-license-label">License Key</p>
            <p className="manage-license-key">{licenseKey}</p>
          </div>
          
          <h2 className="manage-section-title">Perangkat Aktif ({devices.length}/3)</h2>
          
          {devices.length === 0 ? (
            <p className="manage-empty">Belum ada perangkat yang teraktivasi.</p>
          ) : (
            <div className="manage-device-list">
              {devices.map((device) => (
                <div key={device.device_id} className="manage-device-card">
                  <div className="manage-device-info">
                    <span className="manage-device-name">
                      {device.device_name || "Perangkat Tidak Dikenal"}
                    </span>
                    <span className="manage-device-meta">
                      Aktif sejak: {new Date(device.activated_at).toLocaleDateString("id-ID")}
                    </span>
                    <span className="manage-device-meta">
                      Terakhir dilihat: {new Date(device.last_seen_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <button
                    className="manage-deactivate-btn"
                    onClick={() => handleDeactivate(device.device_id)}
                  >
                    Nonaktifkan
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="manage-actions">
            <a href="/" className="manage-back-btn">← Kembali ke Alextrix</a>
          </div>
        </>
      )}
    </div>
  );
}

export default function ManagePage() {
  return (
    <div className="manage-page">
      <div className="activate-content">
        <h1 className="activate-title">Kelola Perangkat</h1>
        <p className="activate-subtitle">
          Anda dapat mengaktifkan Alextrix di maksimal 3 perangkat
        </p>
        
        <Suspense fallback={<div className="manage-loading">Memuat...</div>}>
          <ManageContent />
        </Suspense>
      </div>
    </div>
  );
}
