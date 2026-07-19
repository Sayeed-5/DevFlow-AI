const nodemailer = require('nodemailer')

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,   // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS    // Gmail App Password
    }
  })
}

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter()
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || `"DevFlow" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  })
  console.log(`📧 Email sent: ${info.messageId} → ${to}`)
  return info
}

/**
 * Send organization invite email
 */
const sendInviteEmail = async ({ to, orgName, inviterName, token }) => {
  const acceptUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/invite/accept?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,system-ui,sans-serif;color:#ededed">
      <div style="max-width:480px;margin:40px auto;background:#1c1c1c;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden">
        <div style="padding:32px;border-bottom:1px solid #2a2a2a;text-align:center">
          <div style="display:inline-flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;background:#052e16;border-radius:8px;display:flex;align-items:center;justify-content:center">
              <span style="color:#10b981;font-weight:bold;font-size:18px">✓</span>
            </div>
            <span style="font-size:20px;font-weight:700;color:#ededed">DevFlow</span>
          </div>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:20px;color:#ededed">You're invited! 🎉</h2>
          <p style="margin:0 0 24px;color:#a3a3a3;line-height:1.6">
            <strong style="color:#ededed">${inviterName}</strong> has invited you to join 
            <strong style="color:#10b981">${orgName}</strong> on DevFlow.
          </p>
          <a href="${acceptUrl}" 
             style="display:inline-block;padding:12px 28px;background:#10b981;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px">
            Accept Invitation →
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#525252">
            This invite expires in 7 days. If you didn't expect this, you can ignore it.
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#525252">
            Or copy this link: <a href="${acceptUrl}" style="color:#10b981">${acceptUrl}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to, subject: `You're invited to join ${orgName} on DevFlow`, html })
}

module.exports = { sendEmail, sendInviteEmail }
