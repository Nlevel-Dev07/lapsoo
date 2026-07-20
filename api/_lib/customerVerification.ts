import crypto from "node:crypto"
import { prisma } from "./prisma"
import { sendVerificationEmail, sendPasswordResetEmail } from "./email"

const CODE_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

export type CodePurpose = "SIGNUP" | "PASSWORD_RESET"

function generateCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex")
}

export async function createAndSendVerification(
  customer: { id: string; email: string; name: string },
  purpose: CodePurpose = "SIGNUP"
) {
  const code = generateCode()
  await prisma.customerVerificationCode.create({
    data: {
      customerId: customer.id,
      purpose,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  })
  if (purpose === "PASSWORD_RESET") {
    await sendPasswordResetEmail(customer.email, customer.name, code)
  } else {
    await sendVerificationEmail(customer.email, customer.name, code)
  }
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; error: string }

export async function verifyCode(customerId: string, code: string, purpose: CodePurpose): Promise<VerifyResult> {
  const record = await prisma.customerVerificationCode.findFirst({
    where: { customerId, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  })

  if (!record) {
    return { ok: false, error: "Code expired. Please request a new one." }
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Please request a new code." }
  }

  if (record.codeHash !== hashCode(code)) {
    await prisma.customerVerificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })
    return { ok: false, error: "Incorrect code" }
  }

  await prisma.customerVerificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  })
  return { ok: true }
}
