// HTML email template for admin magic link login

const BRAND = {
  charcoal: '#1C1917',
  charcoalLight: '#292524',
  ember: '#E8450D',
  sand: '#F5F0EB',
  stone: '#78716C',
  slate: '#44403C',
  white: '#FFFFFF',
};

function buildMagicLinkEmail(loginUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND.charcoal};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.charcoal};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${BRAND.white};letter-spacing:-0.5px;">
            <span style="color:${BRAND.ember};">Alpha</span>SMB
          </div>
          <p style="font-size:13px;color:${BRAND.stone};margin:8px 0 0;">Admin Login</p>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:${BRAND.charcoalLight};border-radius:12px;padding:32px;">
          <p style="font-size:16px;color:${BRAND.sand};line-height:1.6;margin:0 0 24px;">
            Click the button below to sign in to the AlphaSMB admin dashboard.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 24px;">
              <a href="${loginUrl}" style="display:inline-block;background:${BRAND.ember};color:${BRAND.white};font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Sign In</a>
            </td></tr>
          </table>

          <p style="font-size:13px;color:${BRAND.stone};line-height:1.5;margin:0;">
            This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <p style="font-size:13px;color:${BRAND.stone};line-height:1.5;margin:0;">
            <a href="https://alphasmb.com" style="color:${BRAND.ember};text-decoration:none;">alphasmb.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { buildMagicLinkEmail };
