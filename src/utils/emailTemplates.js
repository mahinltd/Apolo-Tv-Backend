// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const BRAND_COLOR = '#FF5A45';
const BG_COLOR = '#F4F1EA';
const LOGO_URL = 'https://your-domain.com/public/assets/logo.svg';

const adminPaymentAlertTemplate = (user, subscription) => {
  const trx = subscription.transactionId || 'N/A';
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:24px;background:${BG_COLOR};font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:700px;margin:0 auto;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border:1px solid #f0dbd6;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 24px 16px 24px;text-align:center;background:${BG_COLOR};">
                <img src="${LOGO_URL}" alt="Apolo TV" width="64" height="64" style="display:inline-block;border:0;" />
                <h1 style="margin:12px 0 0 0;font-size:24px;line-height:1.2;color:${BRAND_COLOR};">Apolo TV Payment Alert</h1>
                <p style="margin:8px 0 0 0;font-size:14px;color:#6b7280;">A new payment requires admin review</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;border-spacing:0;border:1px solid #f1e2de;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;width:40%;font-weight:700;">User Name</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${user.name || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;font-weight:700;">User Email</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${user.email}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;font-weight:700;">Plan</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${subscription.planType}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;font-weight:700;">Amount</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${subscription.amount}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;font-weight:700;">Method</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${subscription.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;padding:12px 14px;font-weight:700;">TrxID</td>
                    <td style="padding:12px 14px;">${trx}</td>
                  </tr>
                </table>

                <p style="margin:18px 0 0 0;text-align:center;">
                  <a href="https://your-domain.com/admin" style="display:inline-block;padding:12px 18px;background:${BRAND_COLOR};color:#ffffff;border-radius:8px;text-decoration:none;font-weight:700;">Open Admin Dashboard</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9f3f2;padding:12px 24px;color:#6b7280;font-size:12px;text-align:center;">
                Apolo TV • Automated Notification
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const userPaymentSuccessTemplate = (user, subscription) => {
  const expires = subscription.expiresAt ? new Date(subscription.expiresAt).toDateString() : 'N/A';
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:24px;background:${BG_COLOR};font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:700px;margin:0 auto;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border:1px solid #f0dbd6;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 24px 16px 24px;text-align:center;background:${BG_COLOR};">
                <img src="${LOGO_URL}" alt="Apolo TV" width="64" height="64" style="display:inline-block;border:0;" />
                <h1 style="margin:12px 0 0 0;font-size:24px;line-height:1.2;color:${BRAND_COLOR};">Welcome to Apolo TV Premium</h1>
                <p style="margin:8px 0 0 0;font-size:14px;color:#6b7280;">Your membership is now active</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px 0;">Hi ${user.name || user.email},</p>
                <p style="margin:0 0 16px 0;">Thank you for upgrading. You now have full premium access to Apolo TV.</p>

                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;border-spacing:0;border:1px solid #f1e2de;border-radius:10px;overflow:hidden;margin-bottom:12px;">
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;width:40%;font-weight:700;">Plan</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${subscription.planType}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;font-weight:700;">Amount</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${subscription.amount}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;border-bottom:1px solid #f1e2de;padding:12px 14px;font-weight:700;">Method</td>
                    <td style="border-bottom:1px solid #f1e2de;padding:12px 14px;">${subscription.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="background:#fff7f5;padding:12px 14px;font-weight:700;">Expiry Date</td>
                    <td style="padding:12px 14px;">${expires}</td>
                  </tr>
                </table>

                <p style="margin:18px 0 0 0;text-align:center;">
                  <a href="https://your-domain.com/account" style="display:inline-block;padding:12px 18px;background:${BRAND_COLOR};color:#ffffff;border-radius:8px;text-decoration:none;font-weight:700;">Go To My Account</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9f3f2;padding:12px 24px;color:#6b7280;font-size:12px;text-align:center;">
                Apolo TV • Thank you for your support
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

module.exports = { adminPaymentAlertTemplate, userPaymentSuccessTemplate };
