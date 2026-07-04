// ============================================================================
// AURA BUILD — SESSION EXTRACTOR v2
// ============================================================================
// Cara pakai:
// 1. Login ke https://www.aura.build/ menggunakan akun Google (atau email)
// 2. Tunggu sampai dashboard fully loaded
// 3. Buka DevTools: tekan F12 (atau Cmd+Option+i di Mac)
// 4. Pilih tab "Console"
// 5. Copy SEMUA kode ini (Ctrl+A → Ctrl+C)
// 6. Paste ke Console (Ctrl+V)
// 7. Tekan Enter
// 8. Modal popup akan muncul dengan:
//    - Info session (email, role, expiry)
//    - 3 tab: JSON | .env | cURL
//    - Tombol Copy untuk masing-masing format
//    - Tombol Download .env file
//    - Tombol "Test token" untuk verify via API
//
// Jika modal tidak muncul (popup blocked), output tetap ke console + clipboard.
// ============================================================================

(async function() {
  'use strict';

  const STYLE = {
    header: 'color: #f59e0b; font-weight: bold; font-size: 16px; background: #1a1a1a; padding: 8px 12px; display: block;',
    success: 'color: #10b981; font-weight: bold; font-size: 13px;',
    error: 'color: #ef4444; font-weight: bold; font-size: 13px;',
    info: 'color: #3b82f6; font-size: 12px;',
    label: 'color: #8b5cf6; font-weight: 500;',
  };

  console.log('%c🚀 AURA BUILD — SESSION EXTRACTOR v2', STYLE.header);
  console.log('%c   Extracting session from localStorage + cookies...', STYLE.info);

  // ==========================================================================
  // 1. Extract Supabase auth session dari localStorage
  // ==========================================================================

  // Cari semua key yang match pattern sb-*-auth-token
  const sbKeys = Object.keys(localStorage).filter(k =>
    k.startsWith('sb-') && k.endsWith('-auth-token')
  );

  if (sbKeys.length === 0) {
    console.error('%c❌ Session tidak ditemukan!', STYLE.error);
    console.log('%c   Pastikan Anda sudah login di https://www.aura.build/', STYLE.info);
    console.log('%c   Coba refresh halaman lalu jalankan script lagi.', STYLE.info);
    return;
  }

  console.log('%c✅ Found ' + sbKeys.length + ' Supabase auth key(s):', STYLE.success);
  sbKeys.forEach(k => console.log('   • ' + k));

  // Ambil session pertama
  const sessionKey = sbKeys[0];
  let session;
  try {
    session = JSON.parse(localStorage.getItem(sessionKey));
  } catch (e) {
    console.error('%c❌ Failed to parse session JSON: ' + e.message, STYLE.error);
    return;
  }

  if (!session.access_token || !session.refresh_token) {
    console.error('%c❌ Session tidak memiliki access_token/refresh_token!', STYLE.error);
    console.log('%c   Anda mungkin login sebagai anonymous. Coba logout lalu login lagi dengan Google.', STYLE.info);
    return;
  }

  // ==========================================================================
  // 2. Decode JWT access_token
  // ==========================================================================

  function decodeJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return { header, payload, signature: parts[2] };
    } catch { return null; }
  }

  const jwt = decodeJWT(session.access_token);
  if (!jwt) {
    console.error('%c❌ Gagal decode JWT access_token', STYLE.error);
    return;
  }

  // ==========================================================================
  // 3. Cek expiry
  // ==========================================================================

  const now = Date.now();
  const expiresAtMs = (session.expires_at || jwt.payload.exp) * 1000;
  const expiresInSec = Math.floor((expiresAtMs - now) / 1000);
  const isExpired = now > expiresAtMs;
  const expiresSoon = !isExpired && expiresInSec < 300; // < 5 menit

  // ==========================================================================
  // 4. Extract semua cookies (document.cookie — non-HttpOnly only)
  // ==========================================================================

  const cookies = document.cookie.split('; ').map(c => {
    const idx = c.indexOf('=');
    return {
      name: c.slice(0, idx),
      value: decodeURIComponent(c.slice(idx + 1)),
    };
  }).filter(c => c.name);

  // ==========================================================================
  // 5. Extract user info
  // ==========================================================================

  const user = session.user || {};
  const userInfo = {
    id: user.id,
    email: user.email || jwt.payload.email,
    role: user.role || jwt.payload.role,
    aud: user.aud || jwt.payload.aud,
    name: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    provider: user.app_metadata?.provider || user.app_metadata?.providers?.[0],
    created_at: user.created_at,
  };

  // ==========================================================================
  // 6. Build output objects
  // ==========================================================================

  const sessionData = {
    extracted_at: new Date().toISOString(),
    extracted_from: window.location.href,
    supabase_url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co',
    supabase_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvaXJxcmtkZ2JtdnB3dXR3dXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc2NTAsImV4cCI6MjA1OTI1MzY1MH0._UsCSHsTELn7m54tOhX3ySm67WEhcyHAPbuxEQZsl3c',
    storage_key: sessionKey,
    user: userInfo,
    tokens: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
    },
    jwt: {
      header: jwt.header,
      payload: jwt.payload,
      iss: jwt.payload.iss,
      sub: jwt.payload.sub,
      exp: new Date(jwt.payload.exp * 1000).toISOString(),
      iat: new Date(jwt.payload.iat * 1000).toISOString(),
      is_expired: isExpired,
      expires_in_seconds: expiresInSec,
      expires_in_human: formatDuration(expiresInSec),
    },
    cookies: cookies,
    cookie_count: cookies.length,
  };

  function formatDuration(sec) {
    if (sec < 0) return 'EXPIRED ' + Math.abs(Math.round(sec / 60)) + ' min ago';
    if (sec < 60) return sec + 's';
    if (sec < 3600) return Math.round(sec / 60) + ' min';
    if (sec < 86400) return Math.round(sec / 3600) + ' jam';
    return Math.round(sec / 86400) + ' hari';
  }

  // ==========================================================================
  // 7. Print summary ke console
  // ==========================================================================

  console.log('\n%c📋 SESSION SUMMARY', 'color: #f59e0b; font-weight: bold; font-size: 14px;');
  console.log('%c   Email:      ' + STYLE.label + userInfo.email, '');
  console.log('%c   User ID:    ' + userInfo.id, '');
  console.log('%c   Role:       ' + userInfo.role, '');
  console.log('%c   Provider:   ' + (userInfo.provider || 'unknown'), '');
  if (userInfo.name) console.log('%c   Name:       ' + userInfo.name, '');
  console.log('%c   Expires:    ' + new Date(expiresAtMs).toISOString(), '');
  console.log('%c   Status:     ' + (isExpired ? '❌ EXPIRED' : expiresSoon ? '⚠️  EXPIRES SOON (' + formatDuration(expiresInSec) + ')' : '✅ Valid (' + formatDuration(expiresInSec) + ')'), '');
  console.log('%c   Cookies:    ' + cookies.length + ' non-HttpOnly cookies captured', '');
  console.log('');

  // ==========================================================================
  // 8. Generate 3 format output
  // ==========================================================================

  // Format 1: JSON (untuk debugging)
  const jsonOutput = JSON.stringify(sessionData, null, 2);

  // Format 2: .env file (untuk scraper)
  const envOutput = [
    '# Aura Build session — extracted ' + sessionData.extracted_at,
    '# Source: ' + sessionData.extracted_from,
    '# User: ' + userInfo.email + ' (' + userInfo.role + ')',
    '# Expires: ' + new Date(expiresAtMs).toISOString() + ' (' + formatDuration(expiresInSec) + ')',
    '',
    '# Supabase config',
    'USER_SUPABASE_URL=' + sessionData.supabase_url,
    'USER_SUPABASE_ANON_KEY=' + sessionData.supabase_anon_key,
    '',
    '# Aura auth (for scraper — refresh otomatis jika expired)',
    'AURA_REFRESH_TOKEN=' + session.refresh_token,
    'AURA_ACCESS_TOKEN=' + session.access_token,
    'AURA_USER_EMAIL=' + (userInfo.email || ''),
    'AURA_USER_ID=' + (userInfo.id || ''),
    '',
    '# Expiry info (untuk monitoring)',
    'AURA_TOKEN_EXPIRES_AT=' + session.expires_at,
    'AURA_TOKEN_EXPIRES_ISO=' + new Date(expiresAtMs).toISOString(),
  ].join('\n');

  // Format 3: cURL command (untuk test API manual)
  const curlOutput = [
    '# Test API call dengan access token',
    'curl -s "https://hoirqrkdgbmvpwutwuwj.supabase.co/rest/v1/components?select=id,slug,title&limit=3" \\',
    '  -H "apikey: ' + sessionData.supabase_anon_key + '" \\',
    '  -H "Authorization: Bearer ' + session.access_token + '"',
    '',
    '# Refresh token (dapatkan access_token baru)',
    'curl -s -X POST "https://hoirqrkdgbmvpwutwuwj.supabase.co/auth/v1/token?grant_type=refresh_token" \\',
    '  -H "apikey: ' + sessionData.supabase_anon_key + '" \\',
    '  -H "Content-Type: application/json" \\',
    '  -d \'{"refresh_token": "' + session.refresh_token + '"}\'',
  ].join('\n');

  // ==========================================================================
  // 9. Copy JSON ke clipboard
  // ==========================================================================

  try {
    await navigator.clipboard.writeText(jsonOutput);
    console.log('%c📋 JSON session copied to clipboard!', STYLE.success);
  } catch (e) {
    console.log('%c⚠️  Clipboard access denied. Copy manual dari output di bawah.', STYLE.error);
  }

  // ==========================================================================
  // 10. Tampilkan modal popup dengan UI yang bagus
  // ==========================================================================

  // Hapus modal lama jika ada
  const oldModal = document.getElementById('aura-session-extractor-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'aura-session-extractor-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6); z-index: 2147483647;
    display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    backdrop-filter: blur(4px);
  `;

  const statusColor = isExpired ? '#ef4444' : expiresSoon ? '#f59e0b' : '#10b981';
  const statusIcon = isExpired ? '❌' : expiresSoon ? '⚠️' : '✅';
  const statusText = isExpired ? 'EXPIRED' : expiresSoon ? 'EXPIRES SOON' : 'VALID';

  modal.innerHTML = `
    <div style="background: #1a1a1a; color: #e5e5e5; border-radius: 16px;
                width: 90%; max-width: 720px; max-height: 90vh; overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
      <!-- Header -->
      <div style="padding: 20px 24px; border-bottom: 1px solid #333;
                  background: linear-gradient(135deg, #1f2937, #111827);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #f59e0b;">
              🚀 Aura Session Extracted
            </h2>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
              ${userInfo.email} • ${userInfo.role}
            </div>
          </div>
          <button id="aura-close-btn" style="background: none; border: none; color: #9ca3af;
                  font-size: 24px; cursor: pointer; padding: 4px 10px;">×</button>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 12px;">
          <div>
            <span style="color: #9ca3af;">Status: </span>
            <span style="color: ${statusColor}; font-weight: 600;">${statusIcon} ${statusText}</span>
          </div>
          <div>
            <span style="color: #9ca3af;">Expires in: </span>
            <span style="color: #e5e5e5;">${formatDuration(expiresInSec)}</span>
          </div>
          <div>
            <span style="color: #9ca3af;">Cookies: </span>
            <span style="color: #e5e5e5;">${cookies.length}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div style="display: flex; background: #0f0f0f; border-bottom: 1px solid #333;">
        <button class="aura-tab" data-tab="env" style="flex: 1; padding: 12px; background: #1f2937;
                color: #f59e0b; border: none; cursor: pointer; font-size: 13px; font-weight: 500;
                border-bottom: 2px solid #f59e0b;">📄 .ENV</button>
        <button class="aura-tab" data-tab="json" style="flex: 1; padding: 12px; background: transparent;
                color: #9ca3af; border: none; cursor: pointer; font-size: 13px; font-weight: 500;
                border-bottom: 2px solid transparent;">📋 JSON</button>
        <button class="aura-tab" data-tab="curl" style="flex: 1; padding: 12px; background: transparent;
                color: #9ca3af; border: none; cursor: pointer; font-size: 13px; font-weight: 500;
                border-bottom: 2px solid transparent;">🔧 CURL</button>
      </div>

      <!-- Content -->
      <div style="flex: 1; overflow: auto; padding: 16px 20px;">
        <pre id="aura-content-env" style="margin: 0; font-family: 'SF Mono', Monaco, Consolas, monospace;
              font-size: 12px; line-height: 1.6; color: #d4d4d4; white-space: pre-wrap;
              word-break: break-all;">${escapeHtml(envOutput)}</pre>
        <pre id="aura-content-json" style="display: none; margin: 0; font-family: 'SF Mono', Monaco, Consolas, monospace;
              font-size: 11px; line-height: 1.5; color: #d4d4d4; white-space: pre-wrap;
              word-break: break-all;">${escapeHtml(jsonOutput)}</pre>
        <pre id="aura-content-curl" style="display: none; margin: 0; font-family: 'SF Mono', Monaco, Consolas, monospace;
              font-size: 12px; line-height: 1.6; color: #d4d4d4; white-space: pre-wrap;
              word-break: break-all;">${escapeHtml(curlOutput)}</pre>
      </div>

      <!-- Footer -->
      <div style="padding: 12px 20px; border-top: 1px solid #333; background: #0f0f0f;
                  display: flex; gap: 8px; justify-content: flex-end;">
        <button id="aura-test-btn" style="padding: 8px 16px; background: #1f2937; color: #e5e5e5;
                border: 1px solid #374151; border-radius: 6px; cursor: pointer; font-size: 12px;">
          🧪 Test Token
        </button>
        <button id="aura-download-btn" style="padding: 8px 16px; background: #1f2937; color: #e5e5e5;
                border: 1px solid #374151; border-radius: 6px; cursor: pointer; font-size: 12px;">
          ⬇️ Download .env
        </button>
        <button id="aura-copy-btn" style="padding: 8px 16px; background: #f59e0b; color: #1a1a1a;
                border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
          📋 Copy
        </button>
      </div>
    </div>
  `;

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  document.body.appendChild(modal);

  // ==========================================================================
  // 11. Event handlers
  // ==========================================================================

  // Close button
  modal.querySelector('#aura-close-btn').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  // Tab switching
  let currentTab = 'env';
  modal.querySelectorAll('.aura-tab').forEach(btn => {
    btn.onclick = () => {
      currentTab = btn.dataset.tab;
      modal.querySelectorAll('.aura-tab').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#9ca3af';
        b.style.borderBottom = '2px solid transparent';
      });
      btn.style.background = '#1f2937';
      btn.style.color = '#f59e0b';
      btn.style.borderBottom = '2px solid #f59e0b';
      modal.querySelectorAll('pre').forEach(p => p.style.display = 'none');
      modal.querySelector('#aura-content-' + currentTab).style.display = 'block';
    };
  });

  // Copy button
  modal.querySelector('#aura-copy-btn').onclick = async () => {
    const text = {
      env: envOutput,
      json: jsonOutput,
      curl: curlOutput,
    }[currentTab];
    try {
      await navigator.clipboard.writeText(text);
      const btn = modal.querySelector('#aura-copy-btn');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    } catch (e) {
      alert('Clipboard access denied. Select text manual lalu Ctrl+C.');
    }
  };

  // Download .env
  modal.querySelector('#aura-download-btn').onclick = () => {
    const blob = new Blob([envOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.aura';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Test token
  modal.querySelector('#aura-test-btn').onclick = async () => {
    const btn = modal.querySelector('#aura-test-btn');
    btn.textContent = '⏳ Testing...';
    btn.disabled = true;
    try {
      const r = await fetch(
        'https://hoirqrkdgbmvpwutwuwj.supabase.co/rest/v1/components?select=id&limit=1',
        {
          headers: {
            'apikey': sessionData.supabase_anon_key,
            'Authorization': 'Bearer ' + session.access_token,
          },
        }
      );
      if (r.ok) {
        btn.textContent = '✅ Token valid!';
        btn.style.background = '#10b981';
        btn.style.color = 'white';
      } else if (r.status === 401) {
        btn.textContent = '❌ Token expired';
        btn.style.background = '#ef4444';
        btn.style.color = 'white';
      } else {
        btn.textContent = '⚠️ HTTP ' + r.status;
      }
    } catch (e) {
      btn.textContent = '❌ Network error';
    }
    setTimeout(() => {
      btn.textContent = '🧪 Test Token';
      btn.disabled = false;
      btn.style.background = '#1f2937';
      btn.style.color = '#e5e5e5';
    }, 3000);
  };

  console.log('%c✅ Modal popup muncul dengan 3 format output', STYLE.success);
  console.log('%c   📄 .ENV — untuk scraper (set AURA_REFRESH_TOKEN env var)', STYLE.info);
  console.log('%c   📋 JSON — untuk debugging lengkap', STYLE.info);
  console.log('%c   🔧 CURL — untuk test API manual', STYLE.info);
  console.log('');
  console.log('%c💡 Tips:', 'color: #f59e0b; font-weight: bold;');
  console.log('   • Token access_token expired tiap 1 jam — refresh_token bertahan 30 hari');
  console.log('   • Simpan refresh_token di .env, scraper akan auto-refresh saat expired');
  console.log('   • Jangan share access_token/refresh_token ke siapa pun!');

  return sessionData;
})();
