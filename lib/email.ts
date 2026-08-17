import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.SMTP_FROM || 'Mantra Taxbooks <noreply@mantrataxbooks.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify Your Email – Mantra Taxbooks',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0">
        <div style="background:linear-gradient(135deg,#8B0000,#C41E3A);padding:28px 32px">
          <span style="color:#C0C0C0;font-weight:900;font-size:1.1rem;letter-spacing:3px">MANTRA</span>
          <span style="color:#E8E8E8;font-weight:900;font-size:1.1rem;letter-spacing:3px"> TAXBOOKS</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:1.3rem;color:#1A1A1A">Verify Your Email Address</h2>
          <p style="color:#666;margin:0 0 8px">Hi ${name}, welcome to Mantra Taxbooks!</p>
          <p style="color:#666;margin:0 0 24px">Please click the button below to verify your email address. This link expires in 24 hours.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#C41E3A,#8B0000);color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:.9rem">Verify Email Address</a>
          <p style="margin:24px 0 0;font-size:.8rem;color:#999">If you did not create this account, you can ignore this email.</p>
          <p style="margin:8px 0 0;font-size:.75rem;color:#bbb;word-break:break-all">${verifyUrl}</p>
        </div>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset Your Password – Mantra Taxbooks',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0">
        <div style="background:linear-gradient(135deg,#8B0000,#C41E3A);padding:28px 32px">
          <span style="color:#C0C0C0;font-weight:900;font-size:1.1rem;letter-spacing:3px">MANTRA</span>
          <span style="color:#E8E8E8;font-weight:900;font-size:1.1rem;letter-spacing:3px"> TAXBOOKS</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:1.3rem;color:#1A1A1A">Password Reset Request</h2>
          <p style="color:#666;margin:0 0 24px">Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#C41E3A,#8B0000);color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:.9rem">Reset Password</a>
          <p style="margin:24px 0 0;font-size:.8rem;color:#999">If you didn't request this, ignore this email. Link expires in 1 hour.</p>
          <p style="margin:8px 0 0;font-size:.75rem;color:#bbb;word-break:break-all">${resetUrl}</p>
        </div>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string, tempPassword: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Welcome to Mantra Taxbooks – Your Account Details',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0">
        <div style="background:linear-gradient(135deg,#8B0000,#C41E3A);padding:28px 32px">
          <span style="color:#C0C0C0;font-weight:900;font-size:1.1rem;letter-spacing:3px">MANTRA</span>
          <span style="color:#E8E8E8;font-weight:900;font-size:1.1rem;letter-spacing:3px"> TAXBOOKS</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:1.3rem;color:#1A1A1A">Welcome, ${name}!</h2>
          <p style="color:#666;margin:0 0 20px">Your account has been created. Here are your login details:</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-bottom:20px">
            <p style="margin:0 0 6px;font-size:.85rem"><strong>Email:</strong> ${email}</p>
            <p style="margin:0;font-size:.85rem"><strong>Password:</strong> ${tempPassword}</p>
          </div>
          <a href="${APP_URL}/login" style="display:inline-block;background:linear-gradient(135deg,#C41E3A,#8B0000);color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:.9rem">Login to Portal</a>
          <p style="margin:20px 0 0;font-size:.8rem;color:#999">Please change your password after first login.</p>
        </div>
      </div>
    `,
  })
}

export async function sendDelegateInviteEmail(
  email: string,
  ownerName: string,
  token: string,
  inviterName: string
) {
  const acceptUrl = `${APP_URL}/delegates/accept?token=${token}`
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `You've been invited to access ${ownerName}'s account – Mantra Taxbooks`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0">
        <div style="background:linear-gradient(135deg,#8B0000,#C41E3A);padding:28px 32px">
          <span style="color:#C0C0C0;font-weight:900;font-size:1.1rem;letter-spacing:3px">MANTRA</span>
          <span style="color:#E8E8E8;font-weight:900;font-size:1.1rem;letter-spacing:3px"> TAXBOOKS</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:1.3rem;color:#1A1A1A">You've Been Invited</h2>
          <p style="color:#666;margin:0 0 20px"><strong>${inviterName}</strong> has invited you to access their Mantra Taxbooks account. You'll be able to view invoices, documents, and support tickets on their behalf.</p>
          <a href="${acceptUrl}" style="display:inline-block;background:linear-gradient(135deg,#C41E3A,#8B0000);color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:.9rem">Accept Invitation</a>
          <p style="margin:20px 0 0;font-size:.8rem;color:#999">This invitation will expire if not accepted. If you did not expect this invite, you can safely ignore it.</p>
          <p style="margin:8px 0 0;font-size:.75rem;color:#bbb;word-break:break-all">${acceptUrl}</p>
        </div>
      </div>
    `,
  })
}

export async function sendInvoiceEmail(
  email: string,
  name: string,
  invoiceNo: string,
  type: 'PROFORMA' | 'TAX',
  total: number
) {
  const label = type === 'PROFORMA' ? 'Proforma Invoice' : 'Tax Invoice'
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${label} ${invoiceNo} – Mantra Taxbooks`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0">
        <div style="background:linear-gradient(135deg,#8B0000,#C41E3A);padding:28px 32px">
          <span style="color:#C0C0C0;font-weight:900;font-size:1.1rem;letter-spacing:3px">MANTRA</span>
          <span style="color:#E8E8E8;font-weight:900;font-size:1.1rem;letter-spacing:3px"> TAXBOOKS</span>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:1.3rem;color:#1A1A1A">${label} Generated</h2>
          <p style="color:#666;margin:0 0 20px">Hi ${name}, a new ${label.toLowerCase()} has been raised for your account.</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-bottom:20px">
            <p style="margin:0 0 6px;font-size:.85rem"><strong>Invoice No:</strong> ${invoiceNo}</p>
            <p style="margin:0;font-size:.85rem"><strong>Amount:</strong> ₹${total.toLocaleString('en-IN')}</p>
          </div>
          <a href="${APP_URL}/invoices" style="display:inline-block;background:linear-gradient(135deg,#C41E3A,#8B0000);color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:.9rem">View Invoice</a>
        </div>
      </div>
    `,
  })
}
