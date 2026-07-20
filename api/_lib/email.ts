import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM as string

export async function sendVerificationEmail(to: string, name: string, code: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `${code} is your Lapsoo verification code`,
    text: `Hi ${name},\n\nYour Lapsoo verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Your Lapsoo verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${code}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  })
}

interface JobsheetDetails {
  trackingCode: string
  name: string
  device: string
  issueType: string
  status: string
  estimateCost: number | null
  estimateTime: string | null
  store: string | null
}

export async function sendJobsheetEmail(to: string, jobsheet: JobsheetDetails) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Your Lapsoo repair jobsheet — ${jobsheet.trackingCode}`,
    text: `Hi ${jobsheet.name},\n\nHere are your repair jobsheet details:\n\nTracking ID: ${jobsheet.trackingCode}\nDevice: ${jobsheet.device}\nIssue: ${jobsheet.issueType}\nStatus: ${jobsheet.status}\nEstimate Cost: ${jobsheet.estimateCost != null ? `₹${jobsheet.estimateCost}` : "TBD"}\nEstimate Time: ${jobsheet.estimateTime ?? "TBD"}\nStore: ${jobsheet.store ?? "-"}\n\nYou can track your repair anytime using the tracking ID above.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Repair Jobsheet</h2>
        <p>Hi ${jobsheet.name},</p>
        <p>Here are your repair jobsheet details:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #666;">Tracking ID</td><td style="padding: 4px 0; font-weight: 700;">${jobsheet.trackingCode}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Device</td><td style="padding: 4px 0;">${jobsheet.device}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Issue</td><td style="padding: 4px 0;">${jobsheet.issueType}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Status</td><td style="padding: 4px 0;">${jobsheet.status}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Estimate Cost</td><td style="padding: 4px 0;">${jobsheet.estimateCost != null ? `₹${jobsheet.estimateCost}` : "TBD"}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Estimate Time</td><td style="padding: 4px 0;">${jobsheet.estimateTime ?? "TBD"}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Store</td><td style="padding: 4px 0;">${jobsheet.store ?? "-"}</td></tr>
        </table>
        <p style="margin-top: 16px;">You can track your repair anytime using the tracking ID above.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, name: string, code: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `${code} is your Lapsoo password reset code`,
    text: `Hi ${name},\n\nUse this code to reset your Lapsoo password: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p>Use this code to reset your Lapsoo password:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${code}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  })
}
