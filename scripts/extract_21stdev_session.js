// ============================================================================
// 21ST.DEV — SESSION EXTRACTOR + API DISCOVERY
// ============================================================================
// Cara pakai:
// 1. Login ke https://21st.dev/ (Google/email)
// 2. Tunggu sampai dashboard fully loaded
// 3. Buka DevTools: tekan F12
// 4. Pilih tab "Console"
// 5. Copy SEMUA kode ini (Ctrl+A → Ctrl+C)
// 6. Paste ke Console (Ctrl+V)
// 7. Tekan Enter
// 8. Modal popup akan muncul dengan:
//    - Info session (email, role, expiry, Supabase URL)
//    - 4 tab: JSON | .ENV | cURL | TABLES
//    - Tombol Copy untuk masing-masing format
//    - Tombol Download .env file
//    - Tombol "Test token" untuk verify via API
//    - Tab TABLES: auto-discover accessible tables + columns + row counts
// ============================================================================

(async function() {
  'use strict';

  const STYLE = {
    header: 'color: #3b82f6; font-weight: bold; font-size: 16px; background: #1a1a1a; padding: 8px 12px; display: block;',
    success: 'color: #10b981; font-weight: bold; font-size: 13px;',
    error: 'color: #ef4444; font-weight: bold; font-size: 13px;',
    info: 'color: #3b82f6; font-size: 12px;',
    label: 'color: #8b5cf6; font-weight: 500;',
  };

  console.log('%c🚀 21ST.DEV — SESSION EXTRACTOR + API DISCOVERY', STYLE.header);
  console.log('%c   Extracting session from localStorage + cookies...', STYLE.info);

  // ==========================================================================
  // 1. Extract Supabase auth session dari localStorage
  // ==========================================================================

  const sbKeys = Object.keys(localStorage).filter(k =>
    k.startsWith('sb-') && k.endsWith('-auth-token')
  );

  if (sbKeys.length === 0) {
    console.error('%c❌ Session tidak ditemukan!', STYLE.error);
    console.log('%c   Pastikan Anda sudah login di https://21st.dev/', STYLE.info);
    console.log('%c   Coba refresh halaman lalu jalankan script lagi.', STYLE.info);
    return;
  }

  console.log('%c✅ Found ' + sbKeys.length + ' Supabase auth key(s):', STYLE.success);
  sbKeys.forEach(k => console.log('   • ' + k));

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
    return;
  }

  // ==========================================================================
  // 2. Decode JWT + extract Supabase URL
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

  // Extract Supabase URL from JWT iss field
  // iss biasanya: "https://<project-ref>.supabase.co/auth/v1"
  const supabaseUrl = jwt.payload.iss ? jwt.payload.iss.replace('/auth/v1', '') : 'unknown';
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

  // Extract anon key — cari di localStorage atau dari sb- config keys
  let anonKey = '';
  // Try to find anon key in localStorage (sb-<ref>-auth-token sometimes has it)
  // Or check for sb-<ref> config key
  const configKeys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && !k.endsWith('-auth-token'));
  for (const ck of configKeys) {
    try {
      const config = JSON.parse(localStorage.getItem(ck));
      if (config && config.url) {
        anonKey = config.apikey || config.anonKey || '';
        break;
      }
    } catch {}
  }

  // If not found in localStorage, try to extract from page source
  if (!anonKey) {
    // Try to find in script tags
    const scripts = document.querySelectorAll('script');
    for (const s of scripts) {
      const text = s.textContent || '';
      const match = text.match(/anon[_-]?key["\s:=]+["']([A-Za-z0-9._-]+)["']/i);
      if (match) {
        anonKey = match[1];
        break;
      }
      const match2 = text.match(/apikey["\s:=]+["']([A-Za-z0-9._-]+)["']/i);
      if (match2) {
        anonKey = match2[1];
        break;
      }
    }
  }

  // Last resort: try fetching a public endpoint to get the key from response headers
  if (!anonKey) {
    // The storage key format is sb-<project-ref>-auth-token
    // The project ref is in the URL
    console.log('%c   ⚠️  Anon key tidak ditemukan di localStorage. Mencoba dari network...', STYLE.info);
    // We'll use the access_token as Bearer for API calls
    anonKey = session.access_token; // fallback — access_token can be used as apikey too
  }

  console.log('%c   Supabase URL: ' + supabaseUrl, STYLE.info);
  console.log('%c   Project Ref: ' + projectRef, STYLE.info);
  console.log('%c   Anon Key: ' + (anonKey === session.access_token ? '(using access_token as fallback)' : anonKey.substring(0, 30) + '...'), STYLE.info);

  // ==========================================================================
  // 3. Cek expiry
  // ==========================================================================

  const now = Date.now();
  const expiresAtMs = (session.expires_at || jwt.payload.exp) * 1000;
  const expiresInSec = Math.floor((expiresAtMs - now) / 1000);
  const isExpired = now > expiresAtMs;
  const expiresSoon = !isExpired && expiresInSec < 300;

  // ==========================================================================
  // 4. Extract cookies
  // ==========================================================================

  const cookies = document.cookie.split('; ').map(c => {
    const idx = c.indexOf('=');
    return { name: c.slice(0, idx), value: decodeURIComponent(c.slice(idx + 1)) };
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
  // 6. API DISCOVERY — auto-detect accessible tables
  // ==========================================================================

  console.log('%c   🔍 Discovering accessible tables...', STYLE.info);

  const candidateTables = [
    'components', 'registry', 'items', 'blocks', 'snippets',
    'templates', 'code_blocks', 'react_components', 'ui_components',
    'designs', 'projects', 'public_components', 'public_registry',
    'profiles', 'users', 'categories', 'tags',
  ];

  const discoveredTables = [];

  for (const table of candidateTables) {
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Range': '0-0',
          'Prefer': 'count=exact',
        },
      });

      if (r.ok || r.status === 206) {
        const cr = r.headers.get('content-range') || '';
        const total = cr.includes('/') ? parseInt(cr.split('/').pop() || '0') : 0;

        // Fetch 1 row to get columns
        let columns = [];
        try {
          const r2 = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (r2.ok) {
            const data = await r2.json();
            if (Array.isArray(data) && data.length > 0) {
              columns = Object.keys(data[0]);
            }
          }
        } catch {}

        discoveredTables.push({ table, total, columns });
        console.log(`%c   ✅ ${table}: ${total} rows, columns: ${columns.join(', ')}`, STYLE.success);
      }
    } catch (e) {
      // Table doesn't exist or not accessible
    }
  }

  if (discoveredTables.length === 0) {
    console.log('%c   ⚠️  No tables found with standard names. Trying OpenAPI spec...', STYLE.info);
    // Try fetching OpenAPI spec
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${session.access_token}` },
      });
      if (r.ok) {
        const spec = await r.json();
        const tableNames = Object.keys(spec.paths || spec.definitions || {}).filter(k => !k.startsWith('_'));
        for (const t of tableNames.slice(0, 20)) {
          discoveredTables.push({ table: t, total: '?', columns: [] });
          console.log(`%c   ✅ ${t} (from OpenAPI)`, STYLE.success);
        }
      }
    } catch {}
  }

  console.log(`%c   📊 Discovered ${discoveredTables.length} tables`, STYLE.info);

  // ==========================================================================
  // 7. Build output objects
  // ==========================================================================

  function formatDuration(sec) {
    if (sec < 0) return 'EXPIRED ' + Math.abs(Math.round(sec / 60)) + ' min ago';
    if (sec < 60) return sec + 's';
    if (sec < 3600) return Math.round(sec / 60) + ' min';
    if (sec < 86400) return Math.round(sec / 3600) + ' jam';
    return Math.round(sec / 86400) + ' hari';
  }

  const sessionData = {
    extracted_at: new Date().toISOString(),
    extracted_from: window.location.href,
    supabase_url: supabaseUrl,
    project_ref: projectRef,
    supabase_anon_key: anonKey,
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
    discovered_tables: discoveredTables,
  };

  // Print summary
  console.log('\n%c📋 SESSION SUMMARY', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
  console.log('%c   Email:      ' + STYLE.label + userInfo.email, '');
  console.log('%c   Supabase:   ' + supabaseUrl, '');
  console.log('%c   Project:    ' + projectRef, '');
  console.log('%c   Role:       ' + userInfo.role, '');
  console.log('%c   Provider:   ' + (userInfo.provider || 'unknown'), '');
  console.log('%c   Expires:    ' + new Date(expiresAtMs).toISOString(), '');
  console.log('%c   Status:     ' + (isExpired ? '❌ EXPIRED' : expiresSoon ? '⚠️ EXPIRES SOON' : '✅ Valid (' + formatDuration(expiresInSec) + ')'), '');
  console.log('%c   Tables:     ' + discoveredTables.length + ' discovered', '');
  console.log('');

  // ==========================================================================
  // 8. Generate 4 format output
  // ==========================================================================

  const jsonOutput = JSON.stringify(sessionData, null, 2);

  const envOutput = [
    '# 21st.dev session — extracted ' + sessionData.extracted_at,
    '# Source: ' + sessionData.extracted_from,
    '# User: ' + userInfo.email + ' (' + userInfo.role + ')',
    '# Expires: ' + new Date(expiresAtMs).toISOString() + ' (' + formatDuration(expiresInSec) + ')',
    '',
    '# Supabase config (21st.dev)',
    'TWENTY_FIRST_DEV_SUPABASE_URL=' + supabaseUrl,
    'TWENTY_FIRST_DEV_ANON_KEY=' + anonKey,
    '',
    '# Auth tokens',
    'TWENTY_FIRST_DEV_ACCESS_TOKEN=' + session.access_token,
    'TWENTY_FIRST_DEV_REFRESH_TOKEN=' + session.refresh_token,
    'TWENTY_FIRST_DEV_USER_EMAIL=' + (userInfo.email || ''),
    'TWENTY_FIRST_DEV_USER_ID=' + (userInfo.id || ''),
    '',
    '# Expiry info',
    'TWENTY_FIRST_DEV_TOKEN_EXPIRES_AT=' + session.expires_at,
    'TWENTY_FIRST_DEV_TOKEN_EXPIRES_ISO=' + new Date(expiresAtMs).toISOString(),
    '',
    '# Discovered tables',
    ...discoveredTables.map(t => `# ${t.table}: ${t.total} rows, columns: ${t.columns.join(', ')}`),
  ].join('\n');

  // cURL — test with first discovered table
  const testTable = discoveredTables[0]?.table || 'components';
  const curlOutput = [
    '# Test API call dengan access token',
    `curl -s "${supabaseUrl}/rest/v1/${testTable}?select=id&limit=3" \\`,
    '  -H "apikey: ' + anonKey + '" \\',
    '  -H "Authorization: Bearer ' + session.access_token + '"',
    '',
    '# Refresh token (dapatkan access_token baru)',
    `curl -s -X POST "${supabaseUrl}/auth/v1/token?grant_type=refresh_token" \\`,
    '  -H "apikey: ' + anonKey + '" \\',
    '  -H "Content-Type: application/json" \\',
    '  -d \'{"refresh_token": "' + session.refresh_token + '"}\'',
    '',
    '# Discovered tables:',
    ...discoveredTables.map(t => `#   ${t.table}: ${t.total} rows (${t.columns.join(', ')})`),
  ].join('\n');

  // Tables output
  const tablesOutput = discoveredTables.length > 0
    ? discoveredTables.map(t => {
        return `📊 ${t.table}\n   Rows: ${t.total}\n   Columns: ${t.columns.join(', ') || '(not fetched)'}\n`;
      }).join('\n')
    : 'No tables discovered. The API might use custom table names or require different auth.';

  // ==========================================================================
  // 9. Copy JSON ke clipboard
  // ==========================================================================

  try {
    await navigator.clipboard.writeText(jsonOutput);
    console.log('%c📋 JSON session copied to clipboard!', STYLE.success);
  } catch (e) {
    console.log('%c⚠️ Clipboard access denied. Copy manual dari output di bawah.', STYLE.error);
  }

  // ==========================================================================
  // 10. Modal popup
  // ==========================================================================

  const oldModal = document.getElementById('dev21-session-extractor-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'dev21-session-extractor-modal';
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
                width: 90%; max-width: 760px; max-height: 90vh; overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #333; background: linear-gradient(135deg, #1e293b, #0f172a);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #3b82f6;">🚀 21st.dev Session Extracted</h2>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">${userInfo.email} • ${userInfo.role} • ${projectRef}</div>
          </div>
          <button id="dev21-close-btn" style="background: none; border: none; color: #9ca3af; font-size: 24px; cursor: pointer; padding: 4px 10px;">×</button>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 12px; flex-wrap: wrap;">
          <div><span style="color: #9ca3af;">Status: </span><span style="color: ${statusColor}; font-weight: 600;">${statusIcon} ${statusText}</span></div>
          <div><span style="color: #9ca3af;">Expires: </span><span style="color: #e5e5e5;">${formatDuration(expiresInSec)}</span></div>
          <div><span style="color: #9ca3af;">Tables: </span><span style="color: #e5e5e5;">${discoveredTables.length}</span></div>
          <div><span style="color: #9ca3af;">URL: </span><span style="color: #e5e5e5;">${supabaseUrl}</span></div>
        </div>
      </div>
      <div style="display: flex; background: #0f0f0f; border-bottom: 1px solid #333;">
        <button class="dev21-tab" data-tab="env" style="flex: 1; padding: 12px; background: #1e293b; color: #3b82f6; border: none; cursor: pointer; font-size: 13px; font-weight: 500; border-bottom: 2px solid #3b82f6;">📄 .ENV</button>
        <button class="dev21-tab" data-tab="json" style="flex: 1; padding: 12px; background: transparent; color: #9ca3af; border: none; cursor: pointer; font-size: 13px; font-weight: 500; border-bottom: 2px solid transparent;">📋 JSON</button>
        <button class="dev21-tab" data-tab="curl" style="flex: 1; padding: 12px; background: transparent; color: #9ca3af; border: none; cursor: pointer; font-size: 13px; font-weight: 500; border-bottom: 2px solid transparent;">🔧 CURL</button>
        <button class="dev21-tab" data-tab="tables" style="flex: 1; padding: 12px; background: transparent; color: #9ca3af; border: none; cursor: pointer; font-size: 13px; font-weight: 500; border-bottom: 2px solid transparent;">📊 TABLES</button>
      </div>
      <div style="flex: 1; overflow: auto; padding: 16px 20px;">
        <pre id="dev21-content-env" style="margin: 0; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6; color: #d4d4d4; white-space: pre-wrap; word-break: break-all;">${escapeHtml(envOutput)}</pre>
        <pre id="dev21-content-json" style="display: none; margin: 0; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 11px; line-height: 1.5; color: #d4d4d4; white-space: pre-wrap; word-break: break-all;">${escapeHtml(jsonOutput)}</pre>
        <pre id="dev21-content-curl" style="display: none; margin: 0; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6; color: #d4d4d4; white-space: pre-wrap; word-break: break-all;">${escapeHtml(curlOutput)}</pre>
        <pre id="dev21-content-tables" style="display: none; margin: 0; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 13px; line-height: 1.8; color: #d4d4d4; white-space: pre-wrap;">${escapeHtml(tablesOutput)}</pre>
      </div>
      <div style="padding: 12px 20px; border-top: 1px solid #333; background: #0f0f0f; display: flex; gap: 8px; justify-content: flex-end;">
        <button id="dev21-test-btn" style="padding: 8px 16px; background: #1e293b; color: #e5e5e5; border: 1px solid #374151; border-radius: 6px; cursor: pointer; font-size: 12px;">🧪 Test Token</button>
        <button id="dev21-download-btn" style="padding: 8px 16px; background: #1e293b; color: #e5e5e5; border: 1px solid #374151; border-radius: 6px; cursor: pointer; font-size: 12px;">⬇️ Download .env</button>
        <button id="dev21-copy-btn" style="padding: 8px 16px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">📋 Copy</button>
      </div>
    </div>
  `;

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  document.body.appendChild(modal);

  // Event handlers
  modal.querySelector('#dev21-close-btn').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  let currentTab = 'env';
  modal.querySelectorAll('.dev21-tab').forEach(btn => {
    btn.onclick = () => {
      currentTab = btn.dataset.tab;
      modal.querySelectorAll('.dev21-tab').forEach(b => {
        b.style.background = 'transparent'; b.style.color = '#9ca3af'; b.style.borderBottom = '2px solid transparent';
      });
      btn.style.background = '#1e293b'; btn.style.color = '#3b82f6'; btn.style.borderBottom = '2px solid #3b82f6';
      modal.querySelectorAll('pre').forEach(p => p.style.display = 'none');
      modal.querySelector('#dev21-content-' + currentTab).style.display = 'block';
    };
  });

  modal.querySelector('#dev21-copy-btn').onclick = async () => {
    const text = { env: envOutput, json: jsonOutput, curl: curlOutput, tables: tablesOutput }[currentTab];
    try {
      await navigator.clipboard.writeText(text);
      const btn = modal.querySelector('#dev21-copy-btn');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    } catch (e) { alert('Clipboard denied. Select text manual lalu Ctrl+C.'); }
  };

  modal.querySelector('#dev21-download-btn').onclick = () => {
    const blob = new Blob([envOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '.env.21stdev'; a.click();
    URL.revokeObjectURL(url);
  };

  modal.querySelector('#dev21-test-btn').onclick = async () => {
    const btn = modal.querySelector('#dev21-test-btn');
    btn.textContent = '⏳ Testing...'; btn.disabled = true;
    try {
      const testEndpoint = discoveredTables[0]?.table || 'components';
      const r = await fetch(`${supabaseUrl}/rest/v1/${testEndpoint}?select=id&limit=1`, {
        headers: { 'apikey': anonKey, 'Authorization': 'Bearer ' + session.access_token },
      });
      if (r.ok) {
        btn.textContent = '✅ Token valid!'; btn.style.background = '#10b981'; btn.style.color = 'white';
      } else if (r.status === 401) {
        btn.textContent = '❌ Token expired'; btn.style.background = '#ef4444'; btn.style.color = 'white';
      } else {
        btn.textContent = '⚠️ HTTP ' + r.status;
      }
    } catch (e) { btn.textContent = '❌ Network error'; }
    setTimeout(() => {
      btn.textContent = '🧪 Test Token'; btn.disabled = false;
      btn.style.background = '#1e293b'; btn.style.color = '#e5e5e5';
    }, 3000);
  };

  console.log('%c✅ Modal popup with 4 tabs: .ENV | JSON | cURL | TABLES', STYLE.success);
  console.log('%c   📄 .ENV — untuk migration script', STYLE.info);
  console.log('%c   📋 JSON — full session data untuk debugging', STYLE.info);
  console.log('%c   🔧 CURL — test API manual', STYLE.info);
  console.log('%c   📊 TABLES — daftar tabel + kolom + row count', STYLE.info);

  return sessionData;
})();
