import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AnimatePresence, motion } from "framer-motion"
import { Mail, Lock, KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { requestPasswordReset, resetPassword, ApiError } from "@/lib/api"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useSeo } from "@/lib/useSeo"

const requestSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

const resetSchema = z
  .object({
    code: z.string().length(6, "Enter the 6-digit code"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RequestValues = z.infer<typeof requestSchema>
type ResetValues = z.infer<typeof resetSchema>

const fieldClass = "h-12 border-0 bg-blue-50/70 pl-11 focus:bg-white focus:ring-4 focus:ring-blue-500/10"

function FieldIcon({ icon: Icon }: { icon: typeof Mail }) {
  return <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
}

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "reset">("request")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { invalidate } = useCustomerAuth()

  useSeo({ title: "Forgot Password", description: "Reset the password for your Lapsoo account." })

  const requestForm = useForm<RequestValues>({ resolver: zodResolver(requestSchema) })
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) })

  const onRequest = async (data: RequestValues) => {
    setServerError(null)
    try {
      await requestPasswordReset(data.email)
      setEmail(data.email)
      setStep("reset")
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    }
  }

  const onReset = async (data: ResetValues) => {
    setServerError(null)
    try {
      await resetPassword(email, data.code, data.newPassword)
      invalidate()
      navigate("/")
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Could not reset your password. Please try again.")
    }
  }

  return (
    <div className="bg-paper-soft/40 py-10 md:py-16">
      <div className="container-lap">
        <div className="mx-auto max-w-md rounded-3xl border border-ink/8 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
            {step === "request" ? "Forgot your password?" : "Reset your password"}
          </h1>
          <p className="mt-1.5 text-sm text-ink/45">
            {step === "request"
              ? "Enter your account email and we'll send you a reset code."
              : `Enter the 6-digit code we sent to ${email}, and choose a new password.`}
          </p>

          <AnimatePresence mode="wait">
            {step === "request" ? (
              <motion.form
                key="request"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={requestForm.handleSubmit(onRequest)}
                className="mt-6 space-y-4"
              >
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <FieldIcon icon={Mail} />
                    <Input id="email" placeholder="you@email.com" className={fieldClass} {...requestForm.register("email")} />
                  </div>
                  {requestForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{requestForm.formState.errors.email.message}</p>
                  )}
                </div>
                {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                <Button type="submit" variant="accent" size="lg" className="w-full" disabled={requestForm.formState.isSubmitting}>
                  {requestForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {requestForm.formState.isSubmitting ? "Sending..." : "Send Reset Code"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="reset"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={resetForm.handleSubmit(onReset)}
                className="mt-6 space-y-4"
              >
                <div>
                  <Label htmlFor="code">Verification code</Label>
                  <div className="relative mt-1.5">
                    <FieldIcon icon={KeyRound} />
                    <Input id="code" inputMode="numeric" maxLength={6} placeholder="123456" className={fieldClass} {...resetForm.register("code")} />
                  </div>
                  {resetForm.formState.errors.code && (
                    <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative mt-1.5">
                    <FieldIcon icon={Lock} />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn(fieldClass, "pr-11")}
                      {...resetForm.register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/60"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative mt-1.5">
                    <FieldIcon icon={Lock} />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={fieldClass}
                      {...resetForm.register("confirmPassword")}
                    />
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                <Button type="submit" variant="accent" size="lg" className="w-full" disabled={resetForm.formState.isSubmitting}>
                  {resetForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {resetForm.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
                <button
                  type="button"
                  onClick={() => requestPasswordReset(email)}
                  className="w-full text-center text-sm font-semibold text-blue-500 hover:text-blue-600"
                >
                  Resend code
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-ink/50">
            Remembered your password?{" "}
            <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-600">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
