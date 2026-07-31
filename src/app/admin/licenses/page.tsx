"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface License {
  id: string;
  license_key: string;
  email: string;
  status: "active" | "revoked" | "expired";
  price: number;
  currency: string;
  purchase_date: string | null;
  midtrans_order_id: string | null;
  max_devices: number;
  active_devices: number;
  created_at: string;
  updated_at: string;
}

function AdminPanelContent() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Create manual license form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    max_devices: "10",
    license_key: "",
    note: "",
  });
  const [creating, setCreating] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLicenses = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/licenses?${params.toString()}`, {
        credentials: "include", // send HttpOnly cookie
      });
      const data = await res.json();
      if (data.success) {
        setLicenses(data.licenses || []);
        setTotal(data.total || 0);
      } else {
        setError(data.error || "Gagal memuat data");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchLicenses();
  };

  const handleRevoke = async (licenseKey: string, revoke: boolean) => {
    const action = revoke ? "revoke" : "unrevoke";
    const confirmMsg = revoke
      ? `Cabut license ${licenseKey}? Pengguna tidak bisa login lagi.`
      : `Aktifkan kembali license ${licenseKey}?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, license_key: licenseKey }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", revoke ? "License dicabut" : "License diaktifkan kembali");
        fetchLicenses();
      } else {
        showToast("error", data.error || "Gagal");
      }
    } catch {
      showToast("error", "Terjadi kesalahan");
    }
  };

  const handleUpdateMaxDevices = async (licenseKey: string, currentMax: number) => {
    const input = prompt(`Set max_devices untuk ${licenseKey}:`, String(currentMax));
    if (!input) return;
    const max = parseInt(input, 10);
    if (isNaN(max) || max < 1 || max > 999) {
      showToast("error", "Nilai harus antara 1 dan 999");
      return;
    }
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "update_max_devices", license_key: licenseKey, max_devices: max }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Max devices diperbarui");
        fetchLicenses();
      } else {
        showToast("error", data.error || "Gagal");
      }
    } catch {
      showToast("error", "Terjadi kesalahan");
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "create_manual",
          email: createForm.email,
          max_devices: createForm.max_devices,
          license_key: createForm.license_key || undefined,
          note: createForm.note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `License dibuat: ${data.license.license_key}`);
        setShowCreateModal(false);
        setCreateForm({ email: "", max_devices: "10", license_key: "", note: "" });
        fetchLicenses();
      } else {
        showToast("error", data.error || "Gagal membuat license");
      }
    } catch {
      showToast("error", "Terjadi kesalahan");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Disalin ke clipboard");
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="admin-panel">
      {toast && (
        <div className={`admin-toast ${toast.type}`} style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 8, color: "#fff", fontSize: 14,
          background: toast.type === "success" ? "#16A34A" : "#DC2626",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Stats summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Total License</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginTop: 4 }}>{total}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Active</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#16A34A", marginTop: 4 }}>
            {licenses.filter((l) => l.status === "active").length}
          </div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>di halaman ini</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Revoked</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#DC2626", marginTop: 4 }}>
            {licenses.filter((l) => l.status === "revoked").length}
          </div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>di halaman ini</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Total Revenue</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#E65C00", marginTop: 4 }}>
            Rp {(licenses.reduce((sum, l) => sum + (l.price || 0), 0)).toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>di halaman ini</div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div style={{
        background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12,
        padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
      }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1, minWidth: 280 }}>
          <input
            type="text"
            placeholder="Cari by license key atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8,
              fontSize: 14, outline: "none",
            }}
          />
          <button type="submit" style={{
            padding: "10px 20px", background: "#0A0A0A", color: "#fff", border: "none",
            borderRadius: 8, cursor: "pointer", fontWeight: 500, fontSize: 14,
          }}>
            Cari
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          style={{
            padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8,
            fontSize: 14, background: "#fff", cursor: "pointer",
          }}
        >
          <option value="">Semua Status</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: "10px 20px", background: "#E65C00", color: "#fff", border: "none",
            borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14,
          }}
        >
          + Buat License Manual
        </button>
      </div>

      {error && (
        <div style={{ padding: 16, background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, color: "#DC2626", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* License Table */}
      <div style={{
        background: "#fff", border: "1px solid #E8E2D5", borderRadius: 12,
        overflow: "hidden", overflowX: "auto",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E8E2D5" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>License Key</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Devices</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Harga</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Dibuat</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
                  Memuat...
                </td>
              </tr>
            ) : licenses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
                  Tidak ada data license
                </td>
              </tr>
            ) : (
              licenses.map((license) => (
                <tr key={license.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => copyToClipboard(license.license_key)}
                      title="Klik untuk salin"
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                        fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#0A0A0A",
                        fontWeight: 600,
                      }}
                    >
                      {license.license_key}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{license.email}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "4px 10px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                      background: license.status === "active" ? "#DCFCE7" : license.status === "revoked" ? "#FEE2E2" : "#FEF3C7",
                      color: license.status === "active" ? "#16A34A" : license.status === "revoked" ? "#DC2626" : "#D97706",
                    }}>
                      {license.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "ui-monospace, monospace" }}>
                    <button
                      onClick={() => handleUpdateMaxDevices(license.license_key, license.max_devices)}
                      title="Klik untuk ubah max devices"
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: "2px 6px",
                        borderRadius: 4, color: license.active_devices >= license.max_devices ? "#DC2626" : "#374151",
                        fontWeight: 600,
                      }}
                    >
                      {license.active_devices}/{license.max_devices}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#374151" }}>
                    {license.price > 0 ? `Rp ${license.price.toLocaleString("id-ID")}` : "Manual"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>
                    {new Date(license.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {license.status === "active" ? (
                      <button
                        onClick={() => handleRevoke(license.license_key, true)}
                        style={{
                          padding: "6px 12px", background: "#FEF2F2", color: "#DC2626",
                          border: "1px solid #FCA5A5", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500,
                        }}
                      >
                        Cabut
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevoke(license.license_key, false)}
                        style={{
                          padding: "6px 12px", background: "#F0FDF4", color: "#16A34A",
                          border: "1px solid #86EFAC", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500,
                        }}
                      >
                        Aktifkan
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#6B7280" }}>
            Menampilkan {offset + 1}-{Math.min(offset + limit, total)} dari {total} license
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              style={{
                padding: "8px 16px", border: "1px solid #D1D5DB", background: "#fff",
                borderRadius: 6, cursor: offset === 0 ? "not-allowed" : "pointer", fontSize: 13,
                opacity: offset === 0 ? 0.5 : 1,
              }}
            >
              ← Sebelumnya
            </button>
            <span style={{ padding: "8px 12px", fontSize: 13, color: "#374151" }}>
              Hal. {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              style={{
                padding: "8px 16px", border: "1px solid #D1D5DB", background: "#fff",
                borderRadius: 6, cursor: offset + limit >= total ? "not-allowed" : "pointer", fontSize: 13,
                opacity: offset + limit >= total ? 0.5 : 1,
              }}
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}

      {/* Create Manual License Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 16, padding: 32, maxWidth: 480, width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#0A0A0A" }}>
              Buat License Manual
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6B7280" }}>
              Untuk giveaway, partner, atau promo. License key akan otomatis generate jika dikosongkan.
            </p>

            <form onSubmit={handleCreateManual} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Email Penerima *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="partner@email.com"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Max Devices
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={createForm.max_devices}
                  onChange={(e) => setCreateForm({ ...createForm, max_devices: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Custom License Key (opsional)
                </label>
                <input
                  type="text"
                  value={createForm.license_key}
                  onChange={(e) => setCreateForm({ ...createForm, license_key: e.target.value.toUpperCase() })}
                  placeholder="ALX-PROMO-2025-DEC-0001"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "ui-monospace, monospace" }}
                />
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9CA3AF" }}>
                  Format: ALX-XXXX-XXXX-XXXX-XXXX. Kosongkan untuk auto-generate.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={createForm.note}
                  onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                  placeholder="Giveaway Twitter Des 2025"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "10px 20px", background: "#fff", color: "#374151", border: "1px solid #D1D5DB", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ padding: "10px 20px", background: "#E65C00", color: "#fff", border: "none", borderRadius: 8, cursor: creating ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? "Membuat..." : "Buat License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPageContent() {
  const [authed, setAuthed] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // On mount, check if already authed (cookie set)
  useEffect(() => {
    fetch("/api/admin/licenses", { credentials: "include" })
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthed(true);
        setTokenInput(""); // clear from memory
      } else {
        setAuthError(data.error || "Login gagal");
      }
    } catch {
      setAuthError("Terjadi kesalahan jaringan");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Logout dari admin panel? Anda perlu memasukkan token lagi untuk masuk.")) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAuthed(false);
      setTokenInput("");
    } catch {
      setAuthed(false);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!authed) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 8 }}>
          Admin Panel
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
          Masukkan admin token untuk mengakses halaman kelola license.
          Token akan disimpan di cookie HttpOnly (tidak terlihat di URL atau JS).
        </p>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin token (32-char hex string)..."
            style={{ padding: "12px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "ui-monospace, monospace" }}
            required
            autoFocus
          />
          {authError && (
            <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>{authError}</p>
          )}
          <button
            type="submit"
            disabled={authenticating}
            style={{ padding: "12px 20px", background: "#0A0A0A", color: "#fff", border: "none", borderRadius: 8, cursor: authenticating ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, opacity: authenticating ? 0.7 : 1 }}
          >
            {authenticating ? "Memverifikasi..." : "Masuk →"}
          </button>
        </form>
        <div style={{ marginTop: 24, padding: "12px 16px", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8, fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
          <strong>💡 Belum punya token?</strong> Lihat panduan setup di{" "}
          <a href="/admin/guide" style={{ color: "#92400E", textDecoration: "underline" }}>
            /admin/guide
          </a>{" "}
          — cara membuat ADMIN_TOKEN, mengaktifkan SQL migration, dan lainnya.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", margin: 0 }}>
            Kelola License
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
            Semua license yang terbuat di sistem (otomatis dari pembayaran + manual)
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href="/admin/guide"
            style={{
              fontSize: 13, color: "#374151", textDecoration: "none",
              padding: "8px 14px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff",
            }}
          >
            📖 Panduan
          </a>
          <a
            href="/"
            style={{
              fontSize: 13, color: "#374151", textDecoration: "none",
              padding: "8px 14px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff",
            }}
          >
            ← Alextrix
          </a>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              fontSize: 13, color: "#DC2626", textDecoration: "none",
              padding: "8px 14px", border: "1px solid #FCA5A5", borderRadius: 6, background: "#FEF2F2",
              cursor: loggingOut ? "not-allowed" : "pointer",
              opacity: loggingOut ? 0.7 : 1,
            }}
          >
            {loggingOut ? "Logging out..." : "🚪 Logout"}
          </button>
        </div>
      </div>

      <AdminPanelContent />
    </div>
  );
}

export default function AdminLicensesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Memuat...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
