"use client";

import { useState } from "react";

type SectionId =
  | "overview"
  | "setup-step-1-token"
  | "setup-step-2-cron"
  | "setup-step-3-sql"
  | "setup-step-4-deploy"
  | "setup-step-5-verify"
  | "verify-list"
  | "verify-create-license"
  | "verify-test-activation"
  | "operations-daily"
  | "operations-monthly"
  | "operations-faq"
  | "troubleshooting-404"
  | "troubleshooting-payment"
  | "troubleshooting-email"
  | "troubleshooting-cron"
  | "reference-env-vars"
  | "reference-license-formats"
  | "reference-urls";

const SECTIONS: Array<{ id: SectionId; title: string; group: string }> = [
  { id: "overview", title: "1. Gambaran Umum Sistem", group: "Setup Awal" },
  { id: "setup-step-1-token", title: "2. Buat ADMIN_TOKEN", group: "Setup Awal" },
  { id: "setup-step-2-cron", title: "3. Buat CRON_SECRET", group: "Setup Awal" },
  { id: "setup-step-3-sql", title: "4. Run SQL Migrations di Supabase", group: "Setup Awal" },
  { id: "setup-step-4-deploy", title: "5. Deploy ke Vercel", group: "Setup Awal" },
  { id: "setup-step-5-verify", title: "6. Verifikasi Setup Berhasil", group: "Setup Awal" },
  { id: "verify-list", title: "Cara Lihat Daftar License", group: "Operasional" },
  { id: "verify-create-license", title: "Cara Buat License Manual", group: "Operasional" },
  { id: "verify-test-activation", title: "Cara Test Aktivasi License", group: "Operasional" },
  { id: "operations-daily", title: "Operasional Harian", group: "Operasional" },
  { id: "operations-monthly", title: "Operasional Bulanan", group: "Operasional" },
  { id: "operations-faq", title: "FAQ Operasional", group: "Operasional" },
  { id: "troubleshooting-404", title: "Masalah: Halaman 404", group: "Troubleshooting" },
  { id: "troubleshooting-payment", title: "Masalah: Payment Gagal", group: "Troubleshooting" },
  { id: "troubleshooting-email", title: "Masalah: Email Tidak Diterima", group: "Troubleshooting" },
  { id: "troubleshooting-cron", title: "Masalah: Cron Tidak Jalan", group: "Troubleshooting" },
  { id: "reference-env-vars", title: "Daftar Env Vars", group: "Referensi" },
  { id: "reference-license-formats", title: "Format License Key", group: "Referensi" },
  { id: "reference-urls", title: "Daftar URL Penting", group: "Referensi" },
];

const GROUPS = ["Setup Awal", "Operasional", "Troubleshooting", "Referensi"];

export default function AdminGuidePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF7" }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff", borderBottom: "1px solid #E8E2D5",
        padding: "12px 24px", display: "flex", alignItems: "center", gap: 16,
      }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: "none", background: "none", border: "1px solid #D1D5DB",
            borderRadius: 6, padding: "6px 10px", cursor: "pointer",
          }}
          className="guide-mobile-toggle"
        >
          ☰
        </button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0A0A0A", flex: 1 }}>
          📖 Panduan Owner Alextrix
        </h1>
        <a
          href="/admin/licenses"
          style={{
            fontSize: 13, color: "#374151", textDecoration: "none",
            padding: "6px 12px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff",
          }}
        >
          ← Kelola License
        </a>
      </div>

      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto" }}>
        {/* Sidebar */}
        <aside
          className="guide-sidebar"
          style={{
            width: 280, background: "#fff", borderRight: "1px solid #E8E2D5",
            padding: 24, position: "sticky", top: 57, height: "calc(100vh - 57px)", overflowY: "auto",
          }}
        >
          {GROUPS.map((group) => (
            <div key={group} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#9CA3AF",
                textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
              }}>
                {group}
              </div>
              {SECTIONS.filter((s) => s.group === group).map((section) => (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 12px", marginBottom: 2,
                    background: activeSection === section.id ? "#FFF7ED" : "transparent",
                    border: "none", borderRadius: 6, cursor: "pointer",
                    fontSize: 13, color: activeSection === section.id ? "#9A3412" : "#374151",
                    fontWeight: activeSection === section.id ? 600 : 400,
                  }}
                >
                  {section.title}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "32px 40px", maxWidth: 900 }}>
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "setup-step-1-token" && <SetupTokenSection />}
          {activeSection === "setup-step-2-cron" && <SetupCronSection />}
          {activeSection === "setup-step-3-sql" && <SetupSqlSection />}
          {activeSection === "setup-step-4-deploy" && <SetupDeploySection />}
          {activeSection === "setup-step-5-verify" && <SetupVerifySection />}
          {activeSection === "verify-list" && <VerifyListSection />}
          {activeSection === "verify-create-license" && <VerifyCreateLicenseSection />}
          {activeSection === "verify-test-activation" && <VerifyTestActivationSection />}
          {activeSection === "operations-daily" && <OperationsDailySection />}
          {activeSection === "operations-monthly" && <OperationsMonthlySection />}
          {activeSection === "operations-faq" && <OperationsFaqSection />}
          {activeSection === "troubleshooting-404" && <Troubleshooting404Section />}
          {activeSection === "troubleshooting-payment" && <TroubleshootingPaymentSection />}
          {activeSection === "troubleshooting-email" && <TroubleshootingEmailSection />}
          {activeSection === "troubleshooting-cron" && <TroubleshootingCronSection />}
          {activeSection === "reference-env-vars" && <ReferenceEnvVarsSection />}
          {activeSection === "reference-license-formats" && <ReferenceLicenseFormatsSection />}
          {activeSection === "reference-urls" && <ReferenceUrlsSection />}
        </main>
      </div>
    </div>
  );
}

// === Helper components ===

function Card({ title, children, type = "default" }: { title?: string; children: React.ReactNode; type?: "default" | "warning" | "info" | "success" | "danger" }) {
  const bg = type === "warning" ? "#FFFBEB" : type === "info" ? "#EFF6FF" : type === "success" ? "#F0FDF4" : type === "danger" ? "#FEF2F2" : "#FFFFFF";
  const border = type === "warning" ? "#FCD34D" : type === "info" ? "#93C5FD" : type === "success" ? "#86EFAC" : type === "danger" ? "#FCA5A5" : "#E8E2D5";
  const icon = type === "warning" ? "⚠️" : type === "info" ? "ℹ️" : type === "success" ? "✅" : type === "danger" ? "❌" : "";
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 12,
      padding: "16px 20px", marginBottom: 16,
    }}>
      {title && (
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0A", marginBottom: 8 }}>
          {icon} {title}
        </div>
      )}
      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      background: "#F3F4F6", padding: "2px 6px", borderRadius: 4,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 13, color: "#0A0A0A",
    }}>
      {children}
    </code>
  );
}

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <pre style={{
      background: "#0A0A0A", color: "#FAFAFA", padding: "16px 20px",
      borderRadius: 8, overflowX: "auto", fontSize: 13, lineHeight: 1.6,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      margin: "12px 0",
    }}>
      <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 8, textTransform: "uppercase" }}>{lang}</div>
      <code>{children}</code>
    </pre>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: "#E65C00",
        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>
        {num}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#0A0A0A" }}>{title}</h3>
        <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}

// === Sections ===

function OverviewSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Gambaran Umum Sistem Alextrix
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        Selamat datang di panduan lengkap Alextrix! Dokumen ini akan membantu Anda dari setup awal hingga
        operasional harian. Alextrix adalah platform jual-beli template dengan sistem <strong>sekali bayar, akses seumur hidup</strong>.
        Pembeli membayar Rp 99.000, lalu mendapatkan license key yang bisa dipakai di 10 perangkat.
      </p>

      <Card title="Cara Kerja Sistem (Otomatis)" type="success">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Pembeli klik &quot;Beli Sekarang&quot; di landing page</li>
          <li>Popup email muncul → pembeli masukkan email</li>
          <li>Redirect ke Midtrans → bayar Rp 99.000 (QRIS/GoPay/CC)</li>
          <li>Midtrans kirim webhook ke backend Alextrix</li>
          <li>Backend <strong>otomatis generate license key</strong> + simpan ke database</li>
          <li>Backend <strong>otomatis kirim email</strong> berisi license key via Resend</li>
          <li>Pembeli redirect ke <Code>/thank-you</Code></li>
          <li>Pembeli cek email → klik link aktivasi → buka <Code>/activate</Code></li>
          <li>Pembeli aktivasi perangkat → redirect ke <Code>/dashboard</Code></li>
          <li>Pembeli mulai pakai Alextrix (akses 21.563+ template)</li>
        </ol>
      </Card>

      <Card title="Apakah Perlu Email & Password Login?" type="info">
        <p style={{ margin: "0 0 8px" }}>
          <strong>Tidak perlu.</strong> Sistem Alextrix menggunakan <strong>License Key sebagai otentikasi</strong>.
          Alasannya:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>License key sudah menjadi &quot;password&quot; pembeli — cukup 1 rahasia, tidak perlu 2 (email + password)</li>
          <li>Tidak ada masalah &quot;lupa password&quot; — license key dikirim ulang via email kapan saja</li>
          <li>Lebih sederhana untuk user awam (cukup copy-paste license key dari email)</li>
          <li>Lebih aman: license key 24-karakter random, sulit ditebak</li>
        </ul>
        <p style={{ margin: "12px 0 0" }}>
          <strong>Nanti kalau sudah 1000+ user</strong> dan banyak yang komplain &quot;lupa license key&quot;,
          baru tambahkan fitur &quot;Lihat license key via email&quot; (input email → kirim license key ke email itu).
        </p>
      </Card>

      <Card title="Skala untuk 1000+ Pembeli" type="success">
        <p style={{ margin: 0 }}>
          Sistem dirancang untuk skala berapa pun tanpa intervensi manual. Untuk 1000 pembeli pertama,
          <strong> Anda tidak perlu menyentuh admin panel sama sekali</strong> — semua jalan otomatis.
          Admin panel hanya untuk kasus khusus: giveaway, partner, refund, atau investigasi masalah.
        </p>
      </Card>

      <Card title="Yang Perlu Anda Lakukan Sekali Saja" type="warning">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Buat <Code>ADMIN_TOKEN</Code> di Vercel</li>
          <li>Buat <Code>CRON_SECRET</Code> di Vercel</li>
          <li>Run 2 SQL migrations di Supabase</li>
          <li>Deploy ke Vercel</li>
          <li>Verifikasi semua bekerja</li>
        </ol>
        <p style={{ margin: "12px 0 0" }}>
          Setelah itu, sistem berjalan otomatis. Anda cukup cek admin panel 1-2x per minggu untuk pantau.
        </p>
      </Card>
    </div>
  );
}

function SetupTokenSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Setup Step 1: Buat ADMIN_TOKEN
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        <Code>ADMIN_TOKEN</Code> adalah rahasia yang dipakai untuk masuk ke halaman admin.
        Bisa berupa string acak 32-karakter. Jangan gunakan license key format sebagai token!
      </p>

      <Card title="Cara Generate Token Acak" type="info">
        <p style={{ margin: "0 0 8px" }}>Buka terminal (di komputer Anda) dan jalankan salah satu perintah ini:</p>
        <CodeBlock lang="terminal">{`# Pilihan 1: pakai openssl
openssl rand -hex 16

# Pilihan 2: pakai node
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Pilihan 3: pakai Python
python3 -c "import secrets; print(secrets.token_hex(16))"`}</CodeBlock>
        <p style={{ margin: "8px 0 0" }}>
          Hasilnya: 32-karakter hex string seperti <Code>a8f3k2l9m4n7p1q6r5s8t0u3v2w9x1y4</Code>
        </p>
      </Card>

      <Step num={1} title="Buka Vercel Dashboard">
        <p>
          Buka <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>https://vercel.com/dashboard</a>
          {" "}→ klik project Alextrix Anda.
        </p>
      </Step>

      <Step num={2} title="Buka Settings → Environment Variables">
        <p>
          Di sidebar kiri project, klik <Code>Settings</Code> → <Code>Environment Variables</Code>.
        </p>
      </Step>

      <Step num={3} title="Tambah Variable Baru">
        <p>Isi form seperti ini:</p>
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li><strong>Name:</strong> <Code>ADMIN_TOKEN</Code></li>
          <li><strong>Value:</strong> (paste token acak yang sudah Anda generate)</li>
          <li><strong>Environments:</strong> centang <Code>Production</Code> saja (atau Production + Preview)</li>
        </ul>
        <p>Klik <Code>Save</Code>.</p>
      </Step>

      <Card title="Cara Akses Admin Panel Setelah Token Dibuat" type="success">
        <p style={{ margin: 0 }}>
          Buka URL ini di browser (ganti <code>TOKEN_ANDA</code> dengan token asli):
        </p>
        <CodeBlock lang="url">https://alextrix-projects.vercel.app/admin/licenses?token=TOKEN_ANDA</CodeBlock>
        <p style={{ margin: "8px 0 0" }}>
          Setelah masuk, browser akan simpan cookie (24 jam) — Anda tidak perlu input token lagi selama 24 jam.
        </p>
      </Card>

      <Card title="PENTING: Jangan Pakai License Key Format Sebagai Token" type="danger">
        <p style={{ margin: 0 }}>
          Token admin BUKAN format <Code>ALX-ADMIN-001-LIFETIME-001</Code>. Token adalah string hex acak 32-karakter.
          License key format dipakai untuk login user biasa, bukan untuk admin.
        </p>
      </Card>
    </div>
  );
}

function SetupCronSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Setup Step 2: Buat CRON_SECRET
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        <Code>CRON_SECRET</Code> dipakai untuk otentikasi cron job yang otomatis membersihkan device idle &gt;30 hari.
        Tanpa ini, perangkat yang sudah tidak dipakai akan terus menghitung kuota user.
      </p>

      <Step num={1} title="Generate Token Acak Baru (berbeda dari ADMIN_TOKEN)">
        <CodeBlock lang="terminal">{`# Generate token baru (jangan pakai yang sama dengan ADMIN_TOKEN)
openssl rand -hex 16`}</CodeBlock>
      </Step>

      <Step num={2} title="Tambah ke Vercel Env Vars">
        <p>Ulangi langkah yang sama seperti ADMIN_TOKEN, tapi:</p>
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li><strong>Name:</strong> <Code>CRON_SECRET</Code></li>
          <li><strong>Value:</strong> (token hex baru)</li>
          <li><strong>Environments:</strong> <Code>Production</Code></li>
        </ul>
      </Step>

      <Card title="Cara Test Cron Manual" type="info">
        <p style={{ margin: "0 0 8px" }}>Setelah deploy, test dengan curl atau browser:</p>
        <CodeBlock lang="url">https://alextrix-projects.vercel.app/api/cron/cleanup-devices?token=CRON_SECRET_ANDA</CodeBlock>
        <p style={{ margin: "8px 0 0" }}>
          Harusnya return JSON: <Code>{`{"success":true,"cleaned":0,"duration_ms":...}`}</Code> jika tidak ada device idle,
          atau <Code>{`{"success":true,"cleaned":N,...}`}</Code> jika ada N device yang dibersihkan.
        </p>
      </Card>

      <Card title="Cron Akan Otomatis Jalan Tiap Hari" type="success">
        <p style={{ margin: 0 }}>
          Setelah deploy, Vercel akan otomatis jalankan cron tiap hari jam 03:00 UTC (10:00 WIB).
          Anda tidak perlu setup apa-apa lagi — sudah dikonfigurasi di <Code>vercel.json</Code>.
        </p>
      </Card>
    </div>
  );
}

function SetupSqlSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Setup Step 3: Run SQL Migrations di Supabase
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        SQL migrations akan: (1) set <Code>max_devices=10</Code> sebagai default, (2) buat 5 license admin,
        (3) buat 1 license test, (4) buat function auto-cleanup device idle, (5) schedule cleanup tiap hari.
      </p>

      <Step num={1} title="Buka Supabase Dashboard">
        <p>
          Buka <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>https://supabase.com/dashboard</a>
          {" "}→ pilih project <Code>kvkwiekfdlaeeabkwmhp</Code>.
        </p>
      </Step>

      <Step num={2} title="Buka SQL Editor">
        <p>
          Di sidebar kiri, klik <Code>SQL Editor</Code> → <Code>+ New Query</Code>.
        </p>
      </Step>

      <Step num={3} title="Enable pg_cron Extension (satu kali saja)">
        <p>Sebelum run migration 0002, aktifkan dulu pg_cron:</p>
        <Card type="warning" title="Jalankan Query Ini">
          <CodeBlock lang="sql">{`-- Aktifkan pg_cron extension (jika belum)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Pastikan pg_cron jalan di schema public
CREATE SCHEMA IF NOT EXISTS cron;

-- Verifikasi
SELECT * FROM pg_extension WHERE extname = 'pg_cron';`}</CodeBlock>
          <p style={{ margin: "8px 0 0" }}>
            Klik <Code>Run</Code>. Harusnya muncul 1 row di hasil query.
          </p>
        </Card>
        <Card type="info" title="Alternatif via Dashboard">
          <p style={{ margin: 0 }}>
            Atau buka: <Code>Database</Code> → <Code>Extensions</Code> → cari <Code>pg_cron</Code> → klik <Code>Enable</Code>.
          </p>
        </Card>
      </Step>

      <Step num={4} title="Run Migration 0001: License Improvements">
        <p>Copy SQL di bawah ini, paste di SQL Editor, klik <Code>Run</Code>:</p>
        <CodeBlock lang="sql">{`-- === MIGRATION 0001: License Improvements ===

-- 1. Set default max_devices = 10
ALTER TABLE public.licenses
  ALTER COLUMN max_devices SET DEFAULT 10;

-- 2. Update existing licenses (except admin/test) to max_devices = 10
UPDATE public.licenses
SET max_devices = 10,
    updated_at = now()
WHERE license_key NOT LIKE 'ALX-ADMIN-%'
  AND license_key NOT LIKE 'ALX-TEST-%'
  AND max_devices < 10;

-- 3. Insert 5 admin licenses (ALX-ADMIN-001-LIFETIME-01 sampai -05)
INSERT INTO public.licenses (
  license_key, email, status, price, currency,
  max_devices, midtrans_order_id, device_ids, active_devices
) VALUES
  ('ALX-ADMIN-001-LIFETIME-01', 'admin01@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-001', '{}', 0),
  ('ALX-ADMIN-002-LIFETIME-02', 'admin02@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-002', '{}', 0),
  ('ALX-ADMIN-003-LIFETIME-03', 'admin03@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-003', '{}', 0),
  ('ALX-ADMIN-004-LIFETIME-04', 'admin04@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-004', '{}', 0),
  ('ALX-ADMIN-005-LIFETIME-05', 'admin05@alextrix.dev', 'active', 0, 'IDR', 999, 'ADMIN-005', '{}', 0)
ON CONFLICT (license_key) DO UPDATE
SET max_devices = 999,
    status = 'active',
    updated_at = now();

-- 4. Insert/update test license
INSERT INTO public.licenses (
  license_key, email, status, price, currency,
  max_devices, midtrans_order_id, device_ids, active_devices
) VALUES
  ('ALX-TEST-TEST-TEST-TEST', 'test@alextrix.dev', 'active', 0, 'IDR', 999, 'TEST-LICENSE', '{}', 0)
ON CONFLICT (license_key) DO UPDATE
SET max_devices = 999,
    status = 'active',
    updated_at = now();

-- 5. Verifikasi
SELECT license_key, email, status, max_devices
FROM licenses
WHERE license_key LIKE 'ALX-ADMIN-%' OR license_key LIKE 'ALX-TEST-%'
ORDER BY license_key;`}</CodeBlock>
        <Card type="success" title="Hasil yang Diharapkan">
          <p style={{ margin: 0 }}>
            Query terakhir harusnya menampilkan 6 baris: 5 admin licenses + 1 test license,
            semua ber-status <Code>active</Code> dengan <Code>max_devices = 999</Code>.
          </p>
        </Card>
      </Step>

      <Step num={5} title="Run Migration 0002: Auto-Cleanup Devices">
        <p>Buka new query, copy SQL di bawah, klik <Code>Run</Code>:</p>
        <CodeBlock lang="sql">{`-- === MIGRATION 0002: Auto-Cleanup Idle Devices ===

-- 1. Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_idle_devices(
  idle_days INTEGER DEFAULT 30,
  batch_size INTEGER DEFAULT 500
)
RETURNS TABLE(
  cleaned_count INTEGER,
  licenses_updated INTEGER,
  cutoff_timestamp TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ := now() - (idle_days || ' days')::INTERVAL;
  v_cleaned INTEGER := 0;
  v_licenses_updated INTEGER := 0;
  v_device RECORD;
  v_current_device_ids TEXT[];
  v_new_device_ids TEXT[];
  v_new_active_count INTEGER;
BEGIN
  FOR v_device IN
    SELECT ld.id, ld.license_id, ld.device_id
    FROM public.license_devices ld
    WHERE ld.deactivated_at IS NULL
      AND ld.last_seen_at < v_cutoff
    LIMIT batch_size
  LOOP
    UPDATE public.license_devices
    SET deactivated_at = now()
    WHERE id = v_device.id;

    v_cleaned := v_cleaned + 1;

    SELECT device_ids, active_devices
      INTO v_current_device_ids, v_new_active_count
    FROM public.licenses
    WHERE id = v_device.license_id;

    IF v_current_device_ids IS NOT NULL THEN
      v_new_device_ids := ARRAY(
        SELECT unnest(v_current_device_ids) WHERE unnest != v_device.device_id
      );
      v_new_active_count := GREATEST(0, COALESCE(v_new_active_count, 0) - 1);

      UPDATE public.licenses
      SET device_ids = v_new_device_ids,
          active_devices = v_new_active_count,
          updated_at = now()
      WHERE id = v_device.license_id;

      v_licenses_updated := v_licenses_updated + 1;
    END IF;
  END LOOP;

  RETURN QUERY
    SELECT v_cleaned, v_licenses_updated, v_cutoff;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_idle_devices(INTEGER, INTEGER)
  TO authenticated, service_role;

-- 2. Schedule daily cleanup (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'alextrix-cleanup-idle-devices'
  ) THEN
    UPDATE cron.job
    SET schedule = '0 3 * * *'
    WHERE jobname = 'alextrix-cleanup-idle-devices';
  ELSE
    PERFORM cron.schedule(
      'alextrix-cleanup-idle-devices',
      '0 3 * * *',
      $$SELECT * FROM public.cleanup_idle_devices(30, 500);$$
    );
  END IF;
END $$;

-- 3. Verifikasi
SELECT jobname, schedule, active FROM cron.job
WHERE jobname = 'alextrix-cleanup-idle-devices';`}</CodeBlock>
        <Card type="success" title="Hasil yang Diharapkan">
          <p style={{ margin: 0 }}>
            Query terakhir harusnya menampilkan 1 baris: jobname <Code>alextrix-cleanup-idle-devices</Code>,
            schedule <Code>0 3 * * *</Code>, active <Code>true</Code>.
          </p>
        </Card>
      </Step>

      <Step num={6} title="(Optional) Test Cleanup Function Manual">
        <p>Untuk test apakah function jalan dengan benar:</p>
        <CodeBlock lang="sql">{`-- Test cleanup function (akan return 0 jika tidak ada device idle)
SELECT * FROM public.cleanup_idle_devices(30, 500);

-- Atau test dengan threshold 0 hari (akan cleanup SEMUA device aktif — HATI-HATI!)
-- JANGAN dijalankan di production kecuali Anda yakin.
-- SELECT * FROM public.cleanup_idle_devices(0, 10);`}</CodeBlock>
      </Step>
    </div>
  );
}

function SetupDeploySection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Setup Step 4: Deploy ke Vercel
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        Setelah env vars ditambah + SQL migrations dijalankan, deploy code terbaru ke Vercel.
      </p>

      <Card title="Cara Deploy" type="info">
        <p style={{ margin: "0 0 8px" }}>Ada 2 cara:</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>Otomatis via Git Push</strong> — push commit ke branch <Code>main</Code> → Vercel auto-deploy</li>
          <li><strong>Manual via Vercel Dashboard</strong> → project → <Code>Deployments</Code> → <Code>Redeploy</Code></li>
        </ul>
      </Card>

      <Step num={1} title="Push Code ke GitHub">
        <CodeBlock lang="bash">{`cd web-library-fresh
git add .
git commit -m "feat: license validation fix + admin panel + auto-cleanup"
git push origin main`}</CodeBlock>
      </Step>

      <Step num={2} title="Tunggu Deploy Selesai">
        <p>
          Buka <Code>https://vercel.com/dashboard</Code> → project Alextrix → tab <Code>Deployments</Code>.
          Tunggu hingga status berubah dari <Code>Building</Code> ke <Code>Ready</Code> (biasanya 2-5 menit).
        </p>
      </Step>

      <Step num={3} title="Verifikasi Deploy Berhasil">
        <p>Buka URL berikut di browser (ganti dengan token Anda):</p>
        <CodeBlock lang="url">https://alextrix-projects.vercel.app/admin/licenses?token=TOKEN_ANDA</CodeBlock>
        <p>Jika halaman admin terbuka (bukan 404), deploy berhasil.</p>
      </Step>

      <Card title="Vercel Project Sering Kena BLOCKED State" type="warning">
        <p style={{ margin: "0 0 8px" }}>
          Kalau deploy gagal dengan status &quot;BLOCKED&quot;, jangan panik — site tetap berfungsi.
          Biasanya ini terjadi karena:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Limit build minutes habis (Hobby plan: 6000 menit/bulan)</li>
          <li>Ada deploy lama yang masih running</li>
        </ul>
        <p style={{ margin: "8px 0 0" }}>
          Solusi: tunggu 5-10 menit, lalu coba redeploy manual. Atau upgrade ke Vercel Pro ($20/bulan).
        </p>
      </Card>
    </div>
  );
}

function SetupVerifySection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Setup Step 5: Verifikasi Setup Berhasil
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        Setelah semua setup selesai, jalankan checklist verifikasi ini satu-per-satu.
      </p>

      <Card title="Checklist Verifikasi" type="info">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>✅ <Code>ADMIN_TOKEN</Code> ada di Vercel env vars</li>
          <li>✅ <Code>CRON_SECRET</Code> ada di Vercel env vars</li>
          <li>✅ SQL migration 0001 sudah dijalankan (5 admin licenses + 1 test license ada di DB)</li>
          <li>✅ SQL migration 0002 sudah dijalankan (function + pg_cron job ada)</li>
          <li>✅ Deploy terbaru sudah Live</li>
          <li>✅ Halaman <Code>/admin/licenses?token=XXX</Code> bisa diakses (bukan 404)</li>
          <li>✅ Halaman <Code>/manage</Code> menampilkan form input license key (bukan error)</li>
          <li>✅ Stats di homepage menampilkan angka penuh: 21.563 / 2.829 / 30.682 (bukan 21.6 / 2.8 / 30.7)</li>
          <li>✅ Cron cleanup jalan: test dengan <Code>/api/cron/cleanup-devices?token=XXX</Code></li>
          <li>✅ License admin bisa diaktivasi: test dengan <Code>ALX-ADMIN-001-LIFETIME-01</Code></li>
        </ol>
      </Card>

      <Card title="Cara Test Aktivasi License Admin" type="success">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Buka <Code>https://alextrix-projects.vercel.app/activate</Code></li>
          <li>Masukkan: <Code>ALX-ADMIN-001-LIFETIME-01</Code></li>
          <li>Klik <Code>Aktivasi Sekarang →</Code></li>
          <li>Harusnya muncul &quot;Aktivasi Berhasil!&quot; dan redirect ke <Code>/dashboard</Code></li>
          <li>Setelah masuk dashboard, Anda bisa akses semua template, komponen, dll.</li>
        </ol>
      </Card>

      <Card title="Cara Test Halaman /manage" type="success">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Buka <Code>https://alextrix-projects.vercel.app/manage</Code> (tanpa parameter apa pun)</li>
          <li>Harusnya muncul form input license key (bukan error)</li>
          <li>Masukkan: <Code>ALX-ADMIN-001-LIFETIME-01</Code></li>
          <li>Klik <Code>Lihat Perangkat →</Code></li>
          <li>Harusnya muncul daftar device yang teraktivasi (atau &quot;Belum ada perangkat&quot; jika baru pertama kali)</li>
        </ol>
      </Card>

      <Card title="Cara Test Cron Cleanup" type="success">
        <p style={{ margin: 0 }}>Buka URL ini di browser (ganti token):</p>
        <CodeBlock lang="url">https://alextrix-projects.vercel.app/api/cron/cleanup-devices?token=CRON_SECRET_ANDA</CodeBlock>
        <p style={{ margin: "8px 0 0" }}>
          Response harusnya <Code>{`{"success":true,"cleaned":0,"duration_ms":N,...}`}</Code>
        </p>
      </Card>
    </div>
  );
}

function VerifyListSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Cara Lihat Daftar License
      </h2>

      <Step num={1} title="Buka Halaman Admin">
        <CodeBlock lang="url">https://alextrix-projects.vercel.app/admin/licenses?token=TOKEN_ANDA</CodeBlock>
      </Step>

      <Step num={2} title="Lihat Statistik di Atas">
        <p>Di bagian atas halaman, ada 4 kartu statistik:</p>
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li><strong>Total License</strong> — jumlah semua license di database</li>
          <li><strong>Active</strong> — license yang masih aktif (di halaman ini)</li>
          <li><strong>Revoked</strong> — license yang sudah dicabut (di halaman ini)</li>
          <li><strong>Total Revenue</strong> — total pendapatan dari license di halaman ini</li>
        </ul>
      </Step>

      <Step num={3} title="Cari License Tertentu">
        <p>Di form pencarian, ketik:</p>
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li>Email pembeli, contoh: <Code>budi@gmail.com</Code></li>
          <li>Atau license key, contoh: <Code>ALX-ABCD-EFGH-JKMN-PQRS</Code></li>
        </ul>
        <p>Lalu klik <Code>Cari</Code>.</p>
      </Step>

      <Step num={4} title="Filter Berdasarkan Status">
        <p>Di dropdown <Code>Semua Status</Code>, pilih:</p>
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li><Code>Active</Code> — hanya yang aktif</li>
          <li><Code>Revoked</Code> — hanya yang dicabut</li>
          <li><Code>Expired</Code> — hanya yang kedaluwarsa</li>
        </ul>
      </Step>

      <Step num={5} title="Navigasi Pagination">
        <p>Di bawah tabel, ada tombol <Code>Sebelumnya</Code> / <Code>Berikutnya</Code>. Default 50 license per halaman.</p>
      </Step>

      <Step num={6} title="Copy License Key">
        <p>Klik license key di tabel → otomatis tercopy ke clipboard. Anda bisa paste ke email/chat untuk kirim ke user.</p>
      </Step>
    </div>
  );
}

function VerifyCreateLicenseSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Cara Buat License Manual
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        License manual dipakai untuk: <strong>giveaway</strong>, <strong>partner</strong>, <strong>reviewer</strong>,
        <strong>promo marketing</strong>, atau kebutuhan khusus lainnya.
      </p>

      <Step num={1} title="Klik Tombol + Buat License Manual">
        <p>Di pojok kanan atas halaman admin, klik tombol orange <Code>+ Buat License Manual</Code>.</p>
      </Step>

      <Step num={2} title="Isi Form">
        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
          <li><strong>Email Penerima *</strong> — email orang yang akan menerima license (wajib)</li>
          <li><strong>Max Devices</strong> — jumlah perangkat yang bisa dipakai (default 10)</li>
          <li><strong>Custom License Key (opsional)</strong> — kalau kosong, sistem akan generate otomatis</li>
          <li><strong>Catatan (opsional)</strong> — untuk reminder Anda sendiri, contoh: &quot;Giveaway Twitter Des 2025&quot;</li>
        </ul>
      </Step>

      <Step num={3} title="Klik Buat License">
        <p>License key akan muncul di tabel. <strong>Anda harus kirim license key ini manual</strong> ke email penerima (karena ini tidak otomatis lewat Midtrans).</p>
      </Step>

      <Card title="Contoh Custom License Key untuk Promo" type="info">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><Code>ALX-PROMO-2025-DEC-0001</Code> — untuk promo Desember 2025</li>
          <li><Code>ALX-VIP-2025</Code> — untuk customer VIP</li>
          <li><Code>ALX-GIVEAWAY-TWITTER-001</Code> — untuk giveaway Twitter</li>
          <li><Code>ALX-PARTNER-COMPANY-001</Code> — untuk partner reseller</li>
        </ul>
      </Card>

      <Card title="Format License Key yang Diterima Sistem" type="success">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Harus diawali <Code>ALX-</Code></li>
          <li>Diikuti 3-6 segment, dipisah tanda hubung <Code>-</Code></li>
          <li>Tiap segment 1-8 karakter (huruf besar + angka)</li>
          <li>Contoh valid: <Code>ALX-ABCD-EFGH-JKMN-PQRS</Code>, <Code>ALX-VIP-2025</Code>, <Code>ALX-PROMO-2025-DEC-0001</Code></li>
        </ul>
      </Card>
    </div>
  );
}

function VerifyTestActivationSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Cara Test Aktivasi License
      </h2>

      <Step num={1} title="Buka Halaman Aktivasi">
        <CodeBlock lang="url">https://alextrix-projects.vercel.app/activate</CodeBlock>
      </Step>

      <Step num={2} title="Masukkan License Key">
        <p>Pakai salah satu dari 5 license admin yang sudah dibuat SQL migration:</p>
        <CodeBlock lang="license key">{`ALX-ADMIN-001-LIFETIME-01
ALX-ADMIN-002-LIFETIME-02
ALX-ADMIN-003-LIFETIME-03
ALX-ADMIN-004-LIFETIME-04
ALX-ADMIN-005-LIFETIME-05

Atau license test:
ALX-TEST-TEST-TEST-TEST`}</CodeBlock>
      </Step>

      <Step num={3} title="Klik Aktivasi Sekarang">
        <p>Harusnya muncul &quot;Aktivasi Berhasil!&quot; dan otomatis redirect ke <Code>/dashboard</Code> setelah 2 detik.</p>
      </Step>

      <Step num={4} title="Test Akses Template">
        <p>Setelah di dashboard, klik <Code>Lihat Template →</Code>. Anda harus bisa akses 21.563+ template tanpa redirect ke <Code>/activate</Code> lagi.</p>
      </Step>

      <Step num={5} title="Test Logout (Opsional)">
        <p>Buka <Code>/manage</Code> → masukkan license key yang sama → klik tombol <Code>Nonaktifkan Saya</Code>.
        Setelah itu, akses <Code>/templates</Code> lagi → harus redirect ke <Code>/activate</Code>.</p>
      </Step>
    </div>
  );
}

function OperationsDailySection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Operasional Harian (5 menit)
      </h2>
      <Card title="Yang Perlu Dicek Tiap Hari" type="info">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Cek Vercel Logs</strong> — buka Vercel → project → <Code>Logs</Code>.
            Cari error &quot;Midtrans webhook&quot; atau &quot;Failed to create license&quot;.
          </li>
          <li>
            <strong>Cek Resend Logs</strong> — buka <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>https://resend.com/emails</a>
            {" "}→ pastikan email license key terkirim ke pembeli.
          </li>
          <li>
            <strong>Cek Midtrans Dashboard</strong> — buka <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>https://dashboard.midtrans.com</a>
            {" "}→ lihat apakah ada payment yang &quot;settlement&quot; tapi webhook tidak masuk.
          </li>
        </ol>
      </Card>
      <Card title="Kapan Perlu Intervensi Manual?" type="warning">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Pembeli komplain tidak terima email license key → kirim manual dari admin panel (copy license key)</li>
          <li>Pembeli komplain &quot;device limit tercapai&quot; → cek di /manage user, atau naikkan max_devices dari admin panel</li>
          <li>Webhook Midtrans gagal → cari payment di Midtrans, lalu cari license by order_id di admin panel</li>
        </ul>
      </Card>
    </div>
  );
}

function OperationsMonthlySection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Operasional Bulanan
      </h2>
      <Card title="Yang Perlu Dicek Tiap Bulan" type="info">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>Backup Database</strong> — Supabase → Database → Backups → download snapshot bulanan</li>
          <li>
            <strong>Cek Pencapaian Revenue</strong> — di admin panel, scroll semua halaman dan jumlahkan revenue.
            Atau jalankan SQL: <Code>SELECT SUM(price) FROM licenses WHERE status = 'active' AND created_at &gt;= date_trunc('month', now());</Code>
          </li>
          <li>
            <strong>Cek Cron Job Masih Jalan</strong> — buka <Code>https://alextrix-projects.vercel.app/api/cron/cleanup-devices?token=CRON_SECRET</Code>.
            Harus return <Code>{`{"success":true,...}`}</Code>.
          </li>
          <li>
            <strong>Cek Vercel Cron History</strong> — Vercel → project → <Code>Cron Jobs</Code>.
            Pastikan cron jalan tiap hari jam 03:00 UTC.
          </li>
          <li>
            <strong>Update Env Vars Jika Perlu</strong> — ganti <Code>ADMIN_TOKEN</Code> setiap 6 bulan untuk keamanan.
          </li>
        </ol>
      </Card>
    </div>
  );
}

function OperationsFaqSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        FAQ Operasional
      </h2>

      <Card title="Q: Apakah saya perlu buat license key untuk tiap pembeli?">
        <p style={{ margin: 0 }}>
          <strong>TIDAK.</strong> Sistem otomatis generate license key saat Midtrans webhook masuk.
          Anda hanya perlu buat license manual untuk kasus khusus (giveaway, partner, promo).
        </p>
      </Card>

      <Card title="Q: Bagaimana kalau 1000 orang beli?">
        <p style={{ margin: 0 }}>
          Tidak masalah. Sistem dirancang untuk skala tak terbatas. Midtrans handle ribuan transaksi per detik.
          Resend bisa kirim 100 email/detik. Supabase bisa handle jutaan row.
          Anda cukup duduk manis dan cek admin panel sesekali.
        </p>
      </Card>

      <Card title="Q: Bagaimana kalau pembeli minta refund?">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Buka halaman admin → cari license key pembeli (by email)</li>
          <li>Klik tombol <Code>Cabut</Code> di kolom Aksi</li>
          <li>Status berubah jadi <Code>revoked</Code> — pembeli tidak bisa login lagi</li>
          <li>Refund uang via Midtrans Dashboard (manual)</li>
        </ol>
      </Card>

      <Card title="Q: Bagaimana kalau pembeli lupa license key?">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Buka halaman admin → cari by email pembeli</li>
          <li>Copy license key dari tabel</li>
          <li>Kirim manual via email/WhatsApp ke pembeli</li>
        </ol>
        <p style={{ margin: "8px 0 0" }}>
          <strong>Tip:</strong> Sistem sebenarnya sudah otomatis kirim email saat pembayaran.
          Tapi kadang masuk folder spam, jadi pembeli tidak sadar.
        </p>
      </Card>

      <Card title="Q: Bisakah saya pakai license key yang sama untuk multiple email?">
        <p style={{ margin: 0 }}>
          <strong>Tidak.</strong> Satu license key = satu email. Maksimal 10 perangkat per license key.
          Jika pembeli mau pakai di 11 perangkat, mereka perlu beli license baru.
        </p>
      </Card>

      <Card title="Q: Apakah perlu email & password login?">
        <p style={{ margin: 0 }}>
          <strong>Tidak perlu.</strong> License key sudah berfungsi sebagai &quot;password&quot;.
          Lebih sederhana, lebih aman (24-karakter random), dan tidak ada masalah &quot;lupa password&quot;.
          Nanti kalau sudah 1000+ user dan banyak komplain, baru tambah fitur &quot;Lihat license key via email&quot;.
        </p>
      </Card>
    </div>
  );
}

function Troubleshooting404Section() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Masalah: Halaman 404
      </h2>
      <Card title="Gejala" type="danger">
        <p style={{ margin: 0 }}>Membuka <Code>/admin/licenses?token=XXX</Code> muncul &quot;404 - This page could not be found.&quot;</p>
      </Card>
      <Card title="Penyebab" type="warning">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Deploy belum selesai atau belum push code terbaru</li>
          <li>Token di URL salah (pakai license key format, contoh: <Code>ALX-ADMIN-001-LIFETIME-001</Code>)</li>
          <li>Browser cache masih versi lama</li>
        </ol>
      </Card>
      <Card title="Solusi">
        <Step num={1} title="Cek Deploy Status">
          <p>Vercel → project → <Code>Deployments</Code>. Pastikan deploy terbaru status <Code>Ready</Code>.</p>
        </Step>
        <Step num={2} title="Pastikan Code Sudah Di-push">
          <CodeBlock lang="bash">{`cd web-library-fresh
git log --oneline -5
# Pastikan ada commit dengan pesan "feat: license validation fix + admin panel..."`}</CodeBlock>
        </Step>
        <Step num={3} title="Hard Refresh Browser">
          <p>Tekan <Code>Ctrl+Shift+R</Code> (Windows/Linux) atau <Code>Cmd+Shift+R</Code> (Mac).</p>
        </Step>
        <Step num={4} title="Coba Buka Incognito Mode">
          <p>Buka URL di tab incognito/private. Kalau bisa dibuka, berarti cache browser Anda yang bermasalah.</p>
        </Step>
        <Step num={5} title="Pakai Token yang Benar">
          <p>
            <strong>JANGAN</strong> pakai <Code>ALX-ADMIN-001-LIFETIME-001</Code> sebagai token!
            Token admin adalah string hex acak 32-karakter yang Anda set di env var <Code>ADMIN_TOKEN</Code>.
          </p>
          <p>URL yang benar:</p>
          <CodeBlock lang="url">https://alextrix-projects.vercel.app/admin/licenses?token=a8f3k2l9m4n7p1q6r5s8t0u3v2w9x1y4</CodeBlock>
          <p>Bukan:</p>
          <CodeBlock lang="url">https://alextrix-projects.vercel.app/admin/licenses?token=ALX-ADMIN-001-LIFETIME-001</CodeBlock>
        </Step>
      </Card>
    </div>
  );
}

function TroubleshootingPaymentSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Masalah: Payment Link Gagal Dibuat
      </h2>
      <Card title="Gejala" type="danger">
        <p style={{ margin: 0 }}>Saat user klik &quot;Beli Sekarang&quot;, muncul error &quot;Failed to create payment link. A technical error has occurred.&quot;</p>
      </Card>
      <Card title="Penyebab Paling Umum" type="warning">
        <p style={{ margin: "0 0 8px" }}>
          <strong>Midtrans account masih dalam proses review</strong> (Business review = In progress).
          Selama proses review, fitur Snap Payment Link tidak bisa dipakai untuk transaksi real.
        </p>
        <p style={{ margin: 0 }}>
          Midtrans biasanya selesai review dalam 1-3 hari kerja. Anda akan dapat email notifikasi kalau sudah approved.
        </p>
      </Card>
      <Card title="Solusi">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Tunggu sampai review selesai.</strong> Cek email secara berkala (termasuk folder spam).
            Midtrans akan kirim email &quot;Akun Anda Telah Aktif&quot;.
          </li>
          <li>
            <strong>Sambil menunggu, test di Sandbox.</strong> Ubah env var <Code>MIDTRANS_IS_PRODUCTION</Code> ke <Code>false</Code>,
            lalu ganti <Code>MIDTRANS_SERVER_KEY</Code> dan <Code>MIDTRANS_CLIENT_KEY</Code> ke versi Sandbox (SB-Mid-...).
          </li>
          <li>
            <strong>Cek status di Dashboard Midtrans</strong> → <Code>Settings</Code> → <Code>Activation</Code>.
            Pastikan semua metode payment yang Anda inginkan sudah aktif.
          </li>
        </ol>
      </Card>
      <Card title="Cara Test Pakai Kartu Sandbox" type="info">
        <p style={{ margin: "0 0 8px" }}>Kalau pakai Sandbox, test dengan kartu dummy ini:</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>Nomor Kartu:</strong> <Code>4811 1111 1111 1114</Code></li>
          <li><strong>CVV:</strong> <Code>123</Code></li>
          <li><strong>Expiry:</strong> <Code>01/25</Code> atau lebih</li>
        </ul>
      </Card>
    </div>
  );
}

function TroubleshootingEmailSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Masalah: Email Tidak Diterima Pembeli
      </h2>
      <Card title="Gejala" type="danger">
        <p style={{ margin: 0 }}>Pembeli bilang sudah bayar tapi tidak terima email license key.</p>
      </Card>
      <Card title="Penyebab">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Email masuk folder <strong>Spam</strong> / <strong>Promotions</strong> (terutama Gmail)</li>
          <li>Email pembeli salah ketik saat checkout</li>
          <li>Resend rate limit tercapai (rare untuk volume rendah)</li>
          <li>Domain <Code>onboarding@resend.dev</Code> diblokir provider (kalau pakai domain free tier)</li>
        </ol>
      </Card>
      <Card title="Solusi">
        <Step num={1} title="Cek Resend Logs">
          <p>Buka <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>https://resend.com/emails</a> → cari email ke alamat pembeli.</p>
        </Step>
        <Step num={2} title="Cek di Admin Panel">
          <p>Buka <Code>/admin/licenses?token=XXX</Code> → cari by email pembeli. Jika ada license key-nya, berarti webhook berhasil — hanya email yang gagal.</p>
        </Step>
        <Step num={3} title="Kirim Manual">
          <p>Copy license key dari tabel → paste ke email Anda → kirim manual ke pembeli.</p>
        </Step>
        <Step num={4} title="(Untuk Production) Setup Custom Domain di Resend">
          <p>
            Domain <Code>onboarding@resend.dev</Code> hanya untuk testing. Untuk production,
            daftarkan domain Anda (misal <Code>alextrix.dev</Code>) di Resend → verifikasi DNS → pakai
            <Code>noreply@alextrix.dev</Code> sebagai pengirim.
          </p>
        </Step>
      </Card>
    </div>
  );
}

function TroubleshootingCronSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Masalah: Cron Tidak Jalan
      </h2>
      <Card title="Gejala" type="danger">
        <p style={{ margin: 0 }}>Device idle &gt;30 hari masih aktif-aktif saja (tidak ter-cleanup).</p>
      </Card>
      <Card title="Diagnosa">
        <Step num={1} title="Test Cron Manual">
          <p>Buka URL ini di browser:</p>
          <CodeBlock lang="url">https://alextrix-projects.vercel.app/api/cron/cleanup-devices?token=CRON_SECRET_ANDA</CodeBlock>
          <p>Jika return <Code>{`{"success":true,"cleaned":0,...}`}</Code> → cron API bekerja, mungkin Vercel Cron scheduler yang bermasalah.</p>
          <p>Jika return <Code>401 Unauthorized</Code> → token salah.</p>
        </Step>
        <Step num={2} title="Cek Vercel Cron History">
          <p>Vercel → project → <Code>Cron Jobs</Code> → cek apakah ada history eksekusi.</p>
        </Step>
        <Step num={3} title="Test pg_cron di Supabase">
          <p>Buka Supabase SQL Editor, jalankan:</p>
          <CodeBlock lang="sql">{`SELECT jobname, schedule, active, last_run_status
FROM cron.job
WHERE jobname = 'alextrix-cleanup-idle-devices';`}</CodeBlock>
        </Step>
      </Card>
      <Card title="Solusi Alternatif: UptimeRobot" type="info">
        <p style={{ margin: "0 0 8px" }}>
          Kalau Vercel Cron + pg_cron sama-sama tidak jalan, pakai UptimeRobot sebagai backup:
        </p>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Daftar gratis di <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>https://uptimerobot.com</a></li>
          <li>Buat monitor baru: type <Code>HTTP(s)</Code></li>
          <li>URL: <Code>https://alextrix-projects.vercel.app/api/cron/cleanup-devices?token=CRON_SECRET_ANDA</Code></li>
          <li>Schedule: every 24 hours (atau 12 hours untuk lebih sering)</li>
          <li>Save</li>
        </ol>
      </Card>
    </div>
  );
}

function ReferenceEnvVarsSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Daftar Environment Variables
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        Semua env vars yang dipakai sistem Alextrix. Set di Vercel → <Code>Settings</Code> → <Code>Environment Variables</Code>.
      </p>

      <Card title="Wajib (sudah ada)">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li><Code>NEXT_PUBLIC_SUPABASE_URL</Code> — URL Supabase project</li>
          <li><Code>SUPABASE_SERVICE_ROLE_KEY</Code> — service role key (untuk akses DB server-side)</li>
          <li><Code>MIDTRANS_SERVER_KEY</Code> — <Code>Mid-server-...</Code></li>
          <li><Code>MIDTRANS_CLIENT_KEY</Code> — <Code>Mid-client-...</Code></li>
          <li><Code>MIDTRANS_IS_PRODUCTION</Code> — <Code>true</Code> untuk production</li>
          <li><Code>RESEND_API_KEY</Code> — <Code>re_...</Code></li>
          <li><Code>LICENSE_SIGNING_SECRET</Code> — secret 64-char hex untuk HMAC cookie</li>
          <li><Code>NEXT_PUBLIC_APP_URL</Code> — <Code>https://alextrix-projects.vercel.app</Code></li>
        </ul>
      </Card>

      <Card title="Wajib (BARU — perlu Anda tambahkan)" type="warning">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li><Code>ADMIN_TOKEN</Code> — token acak 32-char hex untuk akses admin panel</li>
          <li><Code>CRON_SECRET</Code> — token acak 32-char hex untuk cron job auth</li>
        </ul>
      </Card>

      <Card title="Opsional" type="info">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li><Code>RESEND_FROM_EMAIL</Code> — kalau sudah setup custom domain di Resend (default: <Code>onboarding@resend.dev</Code>)</li>
        </ul>
      </Card>
    </div>
  );
}

function ReferenceLicenseFormatsSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Format License Key
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        Sistem menerima beberapa format license key. Aturan validasi:
      </p>

      <Card title="Aturan Validasi" type="info">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Harus diawali <Code>ALX-</Code></li>
          <li>Diikuti 3-6 segment, dipisah tanda hubung <Code>-</Code></li>
          <li>Tiap segment 1-8 karakter (huruf besar A-Z atau angka 0-9)</li>
          <li>Panjang total: 12-40 karakter</li>
        </ul>
      </Card>

      <Card title="Contoh License Key Valid" type="success">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><Code>ALX-ABCD-EFGH-JKMN-PQRS</Code> — format reguler buyer (auto-generated)</li>
          <li><Code>ALX-ADMIN-001-LIFETIME-01</Code> — admin license</li>
          <li><Code>ALX-ADMIN-005-LIFETIME-05</Code> — admin license ke-5</li>
          <li><Code>ALX-TEST-TEST-TEST-TEST</Code> — license test</li>
          <li><Code>ALX-PROMO-2025-DEC-0001</Code> — promo code Desember 2025</li>
          <li><Code>ALX-VIP-2025</Code> — short code untuk VIP</li>
        </ul>
      </Card>

      <Card title="Contoh License Key TIDAK Valid" type="danger">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><Code>INVALID-KEY</Code> — tidak diawali ALX-</li>
          <li><Code>ALX-FOO</Code> — hanya 1 segment (perlu minimal 3)</li>
          <li><Code>ALX-ABCDEFGHIJK-LONG</Code> — segment &gt; 8 karakter</li>
          <li><Code>alx-admin-001-lifetime-01</Code> — lowercase (akan otomatis di-uppercase, jadi sebenarnya valid)</li>
        </ul>
      </Card>
    </div>
  );
}

function ReferenceUrlsSection() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A0A0A", marginBottom: 16 }}>
        Daftar URL Penting
      </h2>

      <Card title="URL Publik (tanpa login)">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><a href="https://alextrix-projects.vercel.app/" target="_blank" style={{ color: "#E65C00" }}>/</a> — Landing page</li>
          <li><a href="https://alextrix-projects.vercel.app/activate" target="_blank" style={{ color: "#E65C00" }}>/activate</a> — Halaman aktivasi license</li>
          <li><a href="https://alextrix-projects.vercel.app/manage" target="_blank" style={{ color: "#E65C00" }}>/manage</a> — Kelola perangkat (input license key)</li>
          <li><a href="https://alextrix-projects.vercel.app/thank-you" target="_blank" style={{ color: "#E65C00" }}>/thank-you</a> — Halaman setelah bayar</li>
        </ul>
      </Card>

      <Card title="URL Setelah Aktivasi (perlu cookie license)">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><a href="https://alextrix-projects.vercel.app/dashboard" target="_blank" style={{ color: "#E65C00" }}>/dashboard</a> — Dashboard utama</li>
          <li><a href="https://alextrix-projects.vercel.app/templates" target="_blank" style={{ color: "#E65C00" }}>/templates</a> — Browse template</li>
          <li><a href="https://alextrix-projects.vercel.app/components" target="_blank" style={{ color: "#E65C00" }}>/components</a> — Browse komponen</li>
          <li><a href="https://alextrix-projects.vercel.app/assets" target="_blank" style={{ color: "#E65C00" }}>/assets</a> — Browse aset</li>
          <li><a href="https://alextrix-projects.vercel.app/design-systems" target="_blank" style={{ color: "#E65C00" }}>/design-systems</a> — Browse design system</li>
          <li><a href="https://alextrix-projects.vercel.app/prompt-ai" target="_blank" style={{ color: "#E65C00" }}>/prompt-ai</a> — Browse AI prompts</li>
        </ul>
      </Card>

      <Card title="URL Admin (perlu token)" type="warning">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><Code>/admin/licenses?token=TOKEN_ANDA</Code> — Kelola semua license</li>
          <li><a href="https://alextrix-projects.vercel.app/admin/guide" target="_blank" style={{ color: "#E65C00" }}>/admin/guide</a> — Halaman panduan ini</li>
          <li><Code>/api/cron/cleanup-devices?token=CRON_SECRET_ANDA</Code> — Test cron cleanup manual</li>
        </ul>
      </Card>

      <Card title="URL Service Eksternal">
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li><a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>Vercel Dashboard</a> — deploy logs, env vars, cron jobs</li>
          <li><a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>Supabase Dashboard</a> — database, SQL editor</li>
          <li><a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>Midtrans Dashboard</a> — payment, settlement, refund</li>
          <li><a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" style={{ color: "#E65C00" }}>Resend Dashboard</a> — email logs</li>
        </ul>
      </Card>
    </div>
  );
}
