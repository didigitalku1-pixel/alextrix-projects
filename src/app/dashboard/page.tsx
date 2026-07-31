"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  return (
    <div className="app alextrix-app">
      <main className="main alextrix-homepage">
        <section className="alextrix-hero-section" style={{ paddingBottom: 32 }}>
          <div className="alextrix-hero-content">
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "#16A34A",
              color: "#FFFFFF", fontSize: 32, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px",
            }}>✓</div>
            <p className="alextrix-hero-eyebrow">AKUN AKTIF</p>
            <h1 className="alextrix-hero-headline" style={{ fontSize: 32 }}>Selamat! Akun Anda Aktif</h1>
            <p className="alextrix-hero-subheadline">
              Anda sekarang memiliki akses penuh ke semua template, komponen, dan design system.
            </p>
          </div>
        </section>

        <section className="alextrix-featured-section">
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16, marginBottom: 32,
          }}>
            {[
              { num: "21.563", label: "Template" },
              { num: "2.829", label: "Komponen" },
              { num: "128", label: "AI Prompt" },
              { num: "725", label: "Design System" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "#FFFFFF", border: "1px solid #E8E2D5", borderRadius: 16,
                padding: "20px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#E65C00" }}>{stat.num}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <h2 className="alextrix-section-title" style={{ marginBottom: 16 }}>Panduan Penggunaan</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { title: "Cara Menggunakan Alextrix", desc: "Pelajari cara mencari dan mengunduh template" },
              { title: "Cara Download Template", desc: "Unduh HTML, CSS, atau React code" },
              { title: "Cara Copy Prompt AI", desc: "Gunakan prompt AI untuk Lovable, Bolt, Cursor, Claude" },
            ].map((video, i) => (
              <div key={i} style={{
                background: "#0A0A0A", borderRadius: 16, overflow: "hidden",
                border: "1px solid #27272A",
              }}>
                <div style={{
                  height: 180, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, #0A0A0A 0%, #18181B 100%)",
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", background: "rgba(230, 92, 0, 0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #E65C00",
                  }}>
                    <span style={{ color: "#E65C00", fontSize: 24 }}>▶</span>
                  </div>
                </div>
                <div style={{ padding: "12px 16px" }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#FAFAFA" }}>{video.title}</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>{video.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="alextrix-section-title" style={{ marginBottom: 16 }}>Mulai</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/templates" className="alextrix-cta-primary">Lihat Template →</a>
            <a href="/prompt-ai" className="alextrix-cta-secondary">Lihat Prompt.AI →</a>
            <a href="/design-systems" className="alextrix-cta-secondary">Lihat Design System →</a>
          </div>

          <div style={{
            marginTop: 32, padding: "16px 20px", background: "#F9FAFB",
            border: "1px solid #E8E2D5", borderRadius: 12,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
              <strong>Butuh bantuan?</strong> Kelola perangkat di <a href="/manage" style={{ color: "#E65C00" }}>halaman kelola perangkat</a> atau email <a href="mailto:support@alextrix.dev" style={{ color: "#E65C00" }}>support@alextrix.dev</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
