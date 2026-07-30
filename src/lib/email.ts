/**
 * Email integration via Resend.com.
 * 
 * Free tier: 3,000 emails/month
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via Resend API.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set — email not sent");
    return false;
  }
  
  const from = params.from || process.env.RESEND_FROM_EMAIL || "Alextrix <noreply@alextrix.dev>";
  
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    
    if (!res.ok) {
      console.error("Resend API error:", res.status, await res.text());
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Resend API exception:", e);
    return false;
  }
}

/**
 * Send license key email to customer after successful payment.
 */
export async function sendLicenseEmail(params: {
  email: string;
  licenseKey: string;
  orderId: string;
}): Promise<boolean> {
  const { email, licenseKey, orderId } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.alextrix.dev";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#FDFBF7;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:48px;height:48px;background:#E65C00;color:#FDFBF7;border-radius:12px;line-height:48px;font-size:24px;font-weight:800;">A</div>
      <h1 style="color:#111827;font-size:24px;margin:16px 0 4px;">Alextrix</h1>
      <p style="color:#6B7280;font-size:14px;margin:0;">Lifetime Access License</p>
    </div>
    
    <div style="background:#FFFFFF;border:1px solid #E8E2D5;border-radius:16px;padding:32px;">
      <h2 style="color:#111827;font-size:18px;margin:0 0 16px;">✅ Pembayaran Berhasil!</h2>
      <p style="color:#4B5563;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Terima kasih telah membeli Alextrix Lifetime Access. Berikut adalah license key Anda:
      </p>
      
      <div style="background:#F9FAFB;border:1px dashed #E65C00;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">License Key</p>
        <p style="color:#E65C00;font-size:24px;font-weight:700;font-family:'JetBrains Mono',monospace;margin:0;letter-spacing:2px;">${licenseKey}</p>
      </div>
      
      <a href="${appUrl}/activate?key=${licenseKey}" 
         style="display:block;background:#E65C00;color:#FDFBF7;text-align:center;padding:14px 24px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:16px;">
        Aktivasi Sekarang →
      </a>
      
      <p style="color:#9CA3AF;font-size:12px;line-height:1.5;margin:0;">
        Atau salin license key di atas dan tempel di halaman aktivasi:<br>
        <a href="${appUrl}/activate" style="color:#E65C00;">${appUrl}/activate</a>
      </p>
      
      <hr style="border:none;border-top:1px solid #F3F0EA;margin:24px 0;">
      
      <p style="color:#9CA3AF;font-size:12px;line-height:1.5;margin:0;">
        <strong>Order ID:</strong> ${orderId}<br>
        <strong>Lisensi berlaku:</strong> Seumur hidup (lifetime access)<br>
        <strong>Max devices:</strong> 3 perangkat<br>
        <strong>Support:</strong> Balas email ini jika ada masalah
      </p>
    </div>
    
    <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:24px 0 0;">
      © ${new Date().getFullYear()} Alextrix. All rights reserved.
    </p>
  </div>
</body>
</html>
  `;
  
  return sendEmail({
    to: email,
    subject: `License Key Alextrix — ${licenseKey}`,
    html,
  });
}
