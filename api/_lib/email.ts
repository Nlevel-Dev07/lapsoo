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
