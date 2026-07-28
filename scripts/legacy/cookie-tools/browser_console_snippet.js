/**
 * ============================================================================
 * BROWSER CONSOLE SNIPPET — Dump Cookies, localStorage, JWT tokens
 * ============================================================================
 *
 * Cara pakai:
 * 1. Buka website target (e.g., https://www.aura.build/)
 * 2. Tekan F12 untuk buka DevTools
 * 3. Pilih tab "Console"
 * 4. Copy-paste SEMUA kode di bawah ini ke Console
 * 5. Tekan Enter
 * 6. Output akan muncul sebagai:
 *    - Tabel cookies di console
 *    - Tabel localStorage items
 *    - Tabel JWT tokens yang ter-decode
 *    - JSON lengkap untuk di-copy
 *
 * Alternatif: bookmarklet — buat bookmark baru, paste kode ini (compressed)
 * ke field URL. Klik bookmark di halaman mana pun untuk dump session.
 *
 * DISCLAIMER:
 * Hanya gunakan di website yang Anda miliki atau punya izin untuk debug.
 * Jangan jalankan di website pihak ketiga tanpa izin.
 */

javascript:void((function() {
  /* === 1. Cookies (document.cookie === HttpOnly cookies TIDAK bisa diakses dari JS) === */
  const cookies = document.cookie.split('; ').map(c => {
    const [name, ...rest] = c.split('=');
    return { name, value: decodeURIComponent(rest.join('=')) };
  });

  /* === 2. localStorage (semua key, dengan preview value) === */
  const localStorageItems = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    localStorageItems.push({
      key,
      value_preview: value.length > 100 ? value.slice(0, 100) + '…' : value,
      value_length: value.length,
      value: value
    });
  }

  /* === 3. sessionStorage (sama seperti localStorage tapi session-scope) === */
  const sessionStorageItems = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    sessionStorageItems.push({
      key,
      value_preview: value.length > 100 ? value.slice(0, 100) + '…' : value,
      value_length: value.length,
      value: value
    });
  }

  /* === 4. Cari JWT tokens (di cookies, localStorage, sessionStorage) === */
  const jwtPattern = /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  const decodedJWTs = [];

  function tryDecodeJWT(value, source) {
    if (typeof value !== 'string' || !jwtPattern.test(value)) return;
    try {
      const parts = value.split('.');
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      decodedJWTs.push({
        source,
        header,
        payload,
        expires_at: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
        issued_at: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
        is_expired: payload.exp ? (Date.now() > payload.exp * 1000) : null,
        raw: value
      });
    } catch (e) { /* not a valid JWT */ }
  }

  cookies.forEach(c => tryDecodeJWT(c.value, `cookie:${c.name}`));
  localStorageItems.forEach(item => tryDecodeJWT(item.value, `localStorage:${item.key}`));
  sessionStorageItems.forEach(item => tryDecodeJWT(item.value, `sessionStorage:${item.key}`));

  /* === 5. Khusus Supabase auth token (sb-XXX-auth-token) === */
  const supabaseSessions = [];
  for (const item of localStorageItems) {
    if (item.key.startsWith('sb-') && item.key.endsWith('-auth-token')) {
      try {
        const session = JSON.parse(item.value);
        supabaseSessions.push({
          storage_key: item.key,
          access_token_preview: session.access_token?.slice(0, 50) + '…',
          refresh_token_preview: session.refresh_token?.slice(0, 30) + '…',
          expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          is_expired: session.expires_at ? (Date.now() > session.expires_at * 1000) : null,
          user: session.user ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            aud: session.user.aud
          } : null,
          full_session: session
        });
      } catch (e) {
        /* not JSON */ }
    }
  }

  /* === 6. Print ke console === */
  console.log('%c=== 🍪 COOKIES ===', 'color: #f59e0b; font-weight: bold; font-size: 14px');
  console.table(cookies);

  console.log('%c=== 💾 localStorage ===', 'color: #3b82f6; font-weight: bold; font-size: 14px');
  console.table(localStorageItems.map(({value, ...rest}) => rest));

  console.log('%c=== 💾 sessionStorage ===', 'color: #8b5cf6; font-weight: bold; font-size: 14px');
  console.table(sessionStorageItems.map(({value, ...rest}) => rest));

  if (decodedJWTs.length > 0) {
    console.log('%c=== 🔑 JWT TOKENS ===', 'color: #ef4444; font-weight: bold; font-size: 14px');
    console.table(decodedJWTs.map(j => ({
      source: j.source,
      iss: j.payload.iss,
      sub: j.payload.sub,
      email: j.payload.email,
      role: j.payload.role,
      expires_at: j.expires_at,
      is_expired: j.is_expired
    })));
  }

  if (supabaseSessions.length > 0) {
    console.log('%c=== 🔐 SUPABASE SESSIONS ===', 'color: #10b981; font-weight: bold; font-size: 14px');
    console.table(supabaseSessions.map(s => ({
      storage_key: s.storage_key,
      email: s.user?.email,
      role: s.user?.role,
      expires_at: s.expires_at,
      is_expired: s.is_expired
    })));
  }

  /* === 7. Build full JSON output untuk copy-paste === */
  const output = {
    extracted_at: new Date().toISOString(),
    url: window.location.href,
    cookies,
    localStorage: localStorageItems,
    sessionStorage: sessionStorageItems,
    jwt_tokens: decodedJWTs.map(j => ({
      source: j.source,
      header: j.header,
      payload: j.payload,
      expires_at: j.expires_at,
      is_expired: j.is_expired,
      raw: j.raw
    })),
    supabase_sessions: supabaseSessions.map(s => ({
      storage_key: s.storage_key,
      expires_at: s.expires_at,
      is_expired: s.is_expired,
      user: s.user,
      full_session: s.full_session
    }))
  };

  /* Copy ke clipboard jika browser mendukung */
  try {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    console.log('%c✅ Full JSON copied to clipboard!', 'color: #10b981; font-weight: bold');
  } catch (e) {
    console.log('%c📋 Copy JSON manual dari output di bawah:', 'color: #f59e0b');
  }

  console.log('%c=== 📋 FULL JSON OUTPUT ===', 'color: #10b981; font-weight: bold; font-size: 14px');
  console.log(JSON.stringify(output, null, 2));

  /* Return untuk dapat di-assign ke variable jika perlu */
  return output;
})());
