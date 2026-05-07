// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const { adminPaymentAlertTemplate, userPaymentSuccessTemplate } = require('../utils/emailTemplates');

const sendAdminPaymentAlert = async (user, subscription) => {
  try {
    const subject = `New manual payment pending - ${subscription.transactionId || 'No TXN ID'}`;
    const html = adminPaymentAlertTemplate(user, subscription);

    await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send admin payment alert:', error.message);
  }
};

const sendUserPaymentSuccess = async (user, subscription) => {
  try {
    const subject = `🎉 Your Apolo TV Premium is Active!`;
    const html = userPaymentSuccessTemplate(user, subscription);

    await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send user payment success email:', error.message);
  }
};

module.exports = { sendAdminPaymentAlert, sendUserPaymentSuccess };
