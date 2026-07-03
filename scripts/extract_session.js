// === SCRIPT EXTRACT COOKIES & JWT UNTUK AKUN ULTRA ===
// Cara pakai:
// 1. Login ke https://www.aura.build/ dengan akun Ultra Anda
// 2. Buka DevTools (F12) → tab Console
// 3. Copy-paste SEMUA kode di bawah ini ke Console
// 4. Tekan Enter
// 5. Copy output yang muncul (JSON lengkap)
// 6. Paste ke chat saya

(async function() {
  console.log("=== AURA BUILD - EXTRACT SESSION ===\n");

  // 1. Get full session object from localStorage
  const sessionKey = 'sb-hoirqrkdgbmvpwutwuwj-auth-token';
  const sessionStr = localStorage.getItem(sessionKey);

  if (!sessionStr) {
    console.error("❌ Session tidak ditemukan! Pastikan Anda sudah login di aura.build");
    return;
  }

  let session;
  try {
    session = JSON.parse(sessionStr);
  } catch {
    console.error("❌ Format session tidak valid");
    return;
  }

  // 2. Extract key fields
  const result = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
      aud: session.user?.aud,
    },
    extracted_at: new Date().toISOString(),
  };

  // 3. Decode JWT payload untuk cek expiry
  const jwtParts = session.access_token.split('.');
  if (jwtParts.length === 3) {
    const payload = JSON.parse(atob(jwtParts[1]));
    result.jwt_payload = {
      iss: payload.iss,
      sub: payload.sub,
      exp: new Date(payload.exp * 1000).toISOString(),
      iat: new Date(payload.iat * 1000).toISOString(),
      email: payload.email,
      role: payload.role,
      aal: payload.aal,
      session_id: payload.session_id,
    };
  }

  // 4. Get cookies juga (untuk backup)
  const cookies = document.cookie;
  result.cookies = cookies;

  // 5. Print hasil
  console.log("✅ SESSION BERHASIL DI-EXTRACT!\n");
  console.log(`Email: ${result.user.email}`);
  console.log(`Role: ${result.user.role}`);
  console.log(`Token expires: ${result.jwt_payload?.exp}`);
  console.log(`Refresh token: ${result.refresh_token}`);
  console.log("\n=== COPY SEMUA OUTPUT DI BAWAH INI ===\n");

  // Copy to clipboard automatically
  const jsonStr = JSON.stringify(result, null, 2);
  console.log(jsonStr);

  // Try to copy to clipboard
  try {
    await navigator.clipboard.writeText(jsonStr);
    console.log("\n✅ Sudah di-copy ke clipboard! Paste langsung ke chat.");
  } catch {
    console.log("\n⚠️ Tidak bisa auto-copy. Copy manual output di atas.");
  }

  // Also try to copy just the session object (for direct use)
  console.log("\n=== ATAU COPY JSON INI (versi compact) ===\n");
  const compact = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user: { id: session.user?.id, email: session.user?.email }
  });
  console.log(compact);
})();
