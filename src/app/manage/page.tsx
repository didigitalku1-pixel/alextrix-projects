"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Device {
  device_id: string;
  device_name: string | null;
  activated_at: string;
  last_seen_at: string;
  user_agent?: string | null;
  ip_address?: string | null;
}

function ManageContent() {
  const searchParams = useSearchParams();
  const [inputKey, setInputKey] = useState(searchParams.get("key") || "");
  const [activeKey, setActiveKey] = useState<string | null>(searchParams.get("key") || null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [maxDevices, setMaxDevices] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // If license key from URL, auto-load
  useEffect(() => {
    if (activeKey) {
      fetchDevices(activeKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDevices = async (key: string) => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const deviceId = typeof window !== "undefined" ? localStorage.getItem("alextrix_device_id") : null;

      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: key, device_id: deviceId }),
      });

      const data = await res.json();
      if (data.success) {
        setDevices(data.devices || []);
        setMaxDevices(data.max_devices || 3);
      } else {
        setError(data.error || "Gagal memuat data device");
        setDevices([]);
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const key = inputKey.trim().toUpperCase();
    if (!key) {
      setError("Masukkan license key terlebih dahulu");
      return;
    }
    setActiveKey(key);
    fetchDevices(key);
  };

  const handleDeactivate = async (deviceId: string) => {
    if (!activeKey) return;
    if (!confirm("Nonaktifkan device ini? Anda bisa mengaktifkan kembali nanti dari /activate.")) return;

    try {
      const res = await fetch("/api/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId, license_key: activeKey }),
      });

      const data = await res.json();
      if (data.success) {
        setInfo("Device berhasil dinonaktifkan");
        fetchDevices(activeKey);
      } else {
        setError(data.error || "Gagal menonaktifkan device");
      }
    } catch {
      setError("Terjadi kesalahan");
    }
  };

  return (
    <div className="manage-content">
      {/* License key input — accessible WITHOUT login */}
      {!activeKey && (
        <form onSubmit={handleLookup} className="manage-lookup-form" style={{
          background: "#fff",
          border: "1px solid #E8E2D5",
          borderRadius: 16,
          padding: 28,
          marginBottom: 24,
          maxWidth: 560,
          margin: "0 auto 24px",
        }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0A0A0A" }}>
            Kelola Perangkat Anda
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
            Masukkan license key Anda untuk melihat dan mengelola perangkat yang teraktivasi.
            Tidak perlu login — cukup ketik license key yang Anda terima di email.
          </p>

          <label htmlFor="manage-key-input" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            License Key
          </label>
          <input
            id="manage-key-input"
            type="text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value.toUpperCase())}
            placeholder="ALX-XXXX-XXXX-XXXX-XXXX"
            maxLength={40}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: "100%", padding: "12px 14px", border: "1px solid #D1D5DB",
              borderRadius: 8, fontSize: 14, outline: "none",
              fontFamily: "ui-monospace, monospace", boxSizing: "border-box",
            }}
            required
          />
          {error && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#DC2626" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 16, width: "100%", padding: "12px 20px",
              background: "#E65C00", color: "#fff", border: "none",
              borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600, fontSize: 14,
            }}
          >
            {loading ? "Memuat..." : "Lihat Perangkat →"}
          </button>

          <p style={{ margin: "16px 0 0", fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>
            💡 License key ada di email konfirmasi pembelian Anda. Subject: &quot;License Key Alextrix Anda&quot;.
          </p>
        </form>
      )}

      {/* Active key banner — show entered key with option to change */}
      {activeKey && (
        <div style={{
          background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12,
          padding: "12px 16px", marginBottom: 16, display: "flex",
          justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#9A3412", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
              License Key Aktif
            </div>
            <div style={{ fontSize: 14, fontFamily: "ui-monospace, monospace", fontWeight: 600, color: "#7C2D12" }}>
              {activeKey}
            </div>
          </div>
          <button
            onClick={() => { setActiveKey(null); setInputKey(""); setDevices([]); setError(""); setInfo(""); }}
            style={{
              padding: "6px 12px", background: "#fff", color: "#9A3412",
              border: "1px solid #FED7AA", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500,
            }}
          >
            Ganti Key
          </button>
        </div>
      )}

      {/* Status messages */}
      {error && (
        <div style={{
          padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FCA5A5",
          borderRadius: 8, color: "#DC2626", fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}
      {info && (
        <div style={{
          padding: "12px 16px", background: "#F0FDF4", border: "1px solid #86EFAC",
          borderRadius: 8, color: "#16A34A", fontSize: 13, marginBottom: 16,
        }}>
          {info}
        </div>
      )}

      {/* Devices list */}
      {activeKey && (
        <>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 12, flexWrap: "wrap", gap: 8,
          }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0A0A0A" }}>
              Perangkat Aktif ({devices.length}/{maxDevices})
            </h2>
            <button
              onClick={() => activeKey && fetchDevices(activeKey)}
              disabled={loading}
              style={{
                padding: "6px 12px", background: "#fff", color: "#374151",
                border: "1px solid #D1D5DB", borderRadius: 6, cursor: "pointer", fontSize: 12,
              }}
            >
              {loading ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6B7280", fontSize: 14 }}>
              Memuat data device...
            </div>
          ) : devices.length === 0 ? (
            <div style={{
              padding: 32, textAlign: "center", color: "#6B7280", fontSize: 14,
              background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12,
            }}>
              <p style={{ margin: "0 0 12px" }}>Belum ada perangkat yang teraktivasi dengan license key ini.</p>
              <a href={`/activate?key=${activeKey}`} style={{
                display: "inline-block", padding: "8px 16px", background: "#E65C00",
                color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 600,
              }}>
                Aktivasi perangkat ini →
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {devices.map((device, idx) => {
                const isCurrent = typeof window !== "undefined" && device.device_id === localStorage.getItem("alextrix_device_id");
                const lastSeen = new Date(device.last_seen_at);
                const daysSinceSeen = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
                const willAutoCleanup = daysSinceSeen > 25; // warn if approaching 30-day limit

                return (
                  <div key={device.device_id} style={{
                    background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12,
                    padding: "16px 20px", display: "flex", justifyContent: "space-between",
                    alignItems: "center", gap: 16, flexWrap: "wrap",
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 4 }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0A" }}>
                          {device.device_name || "Perangkat Tidak Dikenal"}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#16A34A", background: "#DCFCE7", padding: "2px 8px", borderRadius: 4 }}>
                            Perangkat Ini
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
                        Aktif sejak: {new Date(device.activated_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                      <div style={{ fontSize: 12, color: willAutoCleanup ? "#DC2626" : "#6B7280", lineHeight: 1.6 }}>
                        Terakhir aktif: {lastSeen.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} ({daysSinceSeen} hari lalu)
                        {willAutoCleanup && " ⚠️ Akan otomatis dinonaktifkan dalam 5 hari jika tidak digunakan"}
                      </div>
                      {device.ip_address && (
                        <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.6, marginTop: 4 }}>
                          IP: {device.ip_address}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeactivate(device.device_id)}
                      style={{
                        padding: "8px 16px", background: isCurrent ? "#F3F4F6" : "#FEF2F2",
                        color: isCurrent ? "#6B7280" : "#DC2626",
                        border: isCurrent ? "1px solid #D1D5DB" : "1px solid #FCA5A5",
                        borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500,
                      }}
                    >
                      {isCurrent ? "Nonaktifkan Saya" : "Nonaktifkan"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Auto-cleanup notice */}
          <div style={{
            marginTop: 24, padding: "12px 16px", background: "#FFFBEB",
            border: "1px solid #FCD34D", borderRadius: 8,
            fontSize: 12, color: "#92400E", lineHeight: 1.6,
          }}>
            <strong>ℹ️ Auto-Cleanup:</strong> Perangkat yang tidak aktif lebih dari 30 hari akan otomatis dinonaktifkan oleh sistem untuk mengamankan akun Anda. Anda bisa mengaktifkan kembali kapan saja dari halaman <a href={`/activate?key=${activeKey}`} style={{ color: "#92400E", textDecoration: "underline" }}>/activate</a>.
          </div>
        </>
      )}

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a href="/" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>
          ← Kembali ke Alextrix
        </a>
      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <div className="manage-page" style={{ minHeight: "100vh", background: "#FAFAF7", padding: "32px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0A0A0A", margin: "0 0 8px" }}>
            Kelola Perangkat
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Lihat dan kelola perangkat yang teraktivasi dengan license key Anda
          </p>
        </div>

        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Memuat...</div>}>
          <ManageContent />
        </Suspense>
      </div>
    </div>
  );
}
