import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldCheck, Wrench, Sparkles, KeyRound, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  customerLogin,
  customerSignup,
  verifyCustomerEmail,
  resendCustomerVerification,
  fetchLoginCaptcha,
  ApiError,
  type LoginCaptcha,
} from "@/lib/api"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useSeo } from "@/lib/useSeo"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  captchaAnswer: z.string().min(1, "Answer the security check"),
})

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>

const fieldClass = "h-12 border-0 bg-blue-50/70 pl-11 focus:bg-white focus:ring-4 focus:ring-blue-500/10"

const perks = [
  { icon: ShieldCheck, title: "Certified Refurbished", desc: "Every device passes a 120-point diagnostic before it's listed." },
  { icon: Wrench, title: "Track Repairs Live", desc: "Follow your LapTech booking from drop-off to delivery." },
  { icon: Sparkles, title: "Member Pricing", desc: "Early access to drops and exchange offers built for you." },
]

function FieldIcon({ icon: Icon }: { icon: typeof Mail }) {
  return <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
}

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const { invalidate } = useCustomerAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [captcha, setCaptcha] = useState<LoginCaptcha | null>(null)

  useSeo({
    title: mode === "login" ? "Login" : "Sign Up",
    description: "Access your Lapsoo account to track enquiries, repairs, and orders.",
  })

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  const refreshCaptcha = async () => {
    try {
      const next = await fetchLoginCaptcha()
      setCaptcha(next)
      loginForm.setValue("captchaAnswer", "")
    } catch {
      setCaptcha(null)
    }
  }

  useEffect(() => {
    fetchLoginCaptcha()
      .then(setCaptcha)
      .catch(() => setCaptcha(null))
  }, [])

  const onLogin = async (data: LoginValues) => {
    setServerError(null)
    if (!captcha) {
      setServerError("Security check is loading. Please try again in a moment.")
      return
    }
    try {
      await customerLogin(data.email, data.password, captcha.token, Number(data.captchaAnswer))
      invalidate()
      navigate("/")
    } catch (err) {
      if (err instanceof ApiError && err.body?.requiresVerification) {
        setVerifyEmail(data.email)
        return
      }
      setServerError(err instanceof ApiError ? err.message : "Login failed. Please try again.")
      refreshCaptcha()
    }
  }

  const onSignup = async (data: SignupValues) => {
    setServerError(null)
    try {
      await customerSignup(data)
      setVerifyEmail(data.email)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Signup failed. Please try again.")
    }
  }

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyEmail) return
    setServerError(null)
    setVerifying(true)
    try {
      await verifyCustomerEmail(verifyEmail, verifyCode)
      invalidate()
      navigate("/")
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Verification failed. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  const onResendCode = async () => {
    if (!verifyEmail) return
    setResendMessage(null)
    setResending(true)
    try {
      await resendCustomerVerification(verifyEmail)
      setResendMessage("A new code has been sent to your email.")
    } catch {
      setResendMessage("Couldn't resend the code. Please try again.")
    } finally {
      setResending(false)
    }
  }

  const switchMode = (next: "login" | "signup") => {
    setMode(next)
    setServerError(null)
    setShowPassword(false)
    setVerifyEmail(null)
    setVerifyCode("")
    setResendMessage(null)
  }

  const step = verifyEmail ? "verify" : mode

  return (
    <div className="bg-paper-soft/40 py-10 md:py-16">
      <div className="container-lap">
        <div className="mx-auto flex max-w-4xl overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:min-h-[620px]">
          {/* Form panel */}
          <div className="flex w-full flex-col justify-center p-6 sm:p-10 lg:w-[58%] lg:p-14">
            <div className="mx-auto w-full max-w-sm lg:mx-0">
              <div className="flex rounded-full bg-ink/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={cn(
                    "flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors",
                    mode === "login" ? "bg-blue-500 text-white shadow-[0_8px_20px_-6px_rgba(47,94,255,0.55)]" : "text-ink/50 hover:text-ink"
                  )}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={cn(
                    "flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors",
                    mode === "signup" ? "bg-blue-500 text-white shadow-[0_8px_20px_-6px_rgba(47,94,255,0.55)]" : "text-ink/50 hover:text-ink"
                  )}
                >
                  Sign Up
                </button>
              </div>

              <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight">
                {step === "verify" ? "Verify your email" : step === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1.5 text-sm text-ink/45">
                {step === "verify"
                  ? `Enter the 6-digit code we sent to ${verifyEmail}.`
                  : step === "login"
                    ? "Please enter your details to sign in."
                    : "Takes less than a minute to get started."}
              </p>

              <AnimatePresence mode="wait">
                {step === "verify" ? (
                  <motion.form
                    key="verify"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={onVerify}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <Label htmlFor="verify-code">Verification code</Label>
                      <div className="relative mt-1.5">
                        <FieldIcon icon={KeyRound} />
                        <Input
                          id="verify-code"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="123456"
                          className={fieldClass}
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        />
                      </div>
                    </div>
                    {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                    {resendMessage && <p className="text-sm text-ink/50">{resendMessage}</p>}
                    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={verifying || verifyCode.length !== 6}>
                      {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                      {verifying ? "Verifying..." : "Verify & Continue"}
                    </Button>
                    <button
                      type="button"
                      onClick={onResendCode}
                      disabled={resending}
                      className="w-full text-center text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50"
                    >
                      {resending ? "Resending..." : "Resend code"}
                    </button>
                  </motion.form>
                ) : mode === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative mt-1.5">
                        <FieldIcon icon={Mail} />
                        <Input id="email" placeholder="you@email.com" className={fieldClass} {...loginForm.register("email")} />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-1.5">
                        <FieldIcon icon={Lock} />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={cn(fieldClass, "pr-11")}
                          {...loginForm.register("password")}
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
                      {loginForm.formState.errors.password && (
                        <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="captcha-answer">Security Check</Label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="flex h-12 flex-1 items-center rounded-xl bg-blue-50/70 px-4 text-sm font-semibold text-ink/70">
                          {captcha ? captcha.question : "Loading…"}
                        </span>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          aria-label="Get a new security check"
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50/70 text-ink/40 hover:text-ink/60"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        id="captcha-answer"
                        inputMode="numeric"
                        placeholder="Your answer"
                        className={cn(fieldClass, "mt-2 pl-4")}
                        {...loginForm.register("captchaAnswer")}
                      />
                      {loginForm.formState.errors.captchaAnswer && (
                        <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.captchaAnswer.message}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex cursor-pointer items-center gap-2 text-ink/60">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-ink/20 text-blue-500 focus:ring-blue-500/30"
                        />
                        Remember for 30 days
                      </label>
                      <Link to="/forgot-password" className="font-semibold text-blue-500 hover:text-blue-600">
                        Forgot password
                      </Link>
                    </div>
                    {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loginForm.formState.isSubmitting}>
                      {loginForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={signupForm.handleSubmit(onSignup)}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative mt-1.5">
                        <FieldIcon icon={User} />
                        <Input id="name" placeholder="Your name" className={fieldClass} {...signupForm.register("name")} />
                      </div>
                      {signupForm.formState.errors.name && (
                        <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative mt-1.5">
                        <FieldIcon icon={Mail} />
                        <Input id="signup-email" placeholder="you@email.com" className={fieldClass} {...signupForm.register("email")} />
                      </div>
                      {signupForm.formState.errors.email && (
                        <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative mt-1.5">
                        <FieldIcon icon={Phone} />
                        <Input id="phone" placeholder="98765 43210" className={fieldClass} {...signupForm.register("phone")} />
                      </div>
                      {signupForm.formState.errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative mt-1.5">
                        <FieldIcon icon={Lock} />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={cn(fieldClass, "pr-11")}
                          {...signupForm.register("password")}
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
                      {signupForm.formState.errors.password && (
                        <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={signupForm.formState.isSubmitting}>
                      {signupForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {signupForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              <p className="mt-6 text-center text-sm text-ink/50 lg:text-left">
                Are you the Team Member?{" "}
                <Link to="/admin/login" className="font-semibold text-blue-500 hover:text-blue-600">
                  Admin
                </Link>
              </p>
            </div>
          </div>

          {/* Illustration panel */}
          <div className="relative hidden w-[42%] shrink-0 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-[#122057] p-10 text-white lg:flex">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-white/30"
                  style={{
                    width: `${40 + i * 30}px`,
                    height: `${40 + i * 30}px`,
                    left: `${(i * 37) % 100}%`,
                    top: `${(i * 53) % 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex flex-col items-center gap-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <ShieldCheck className="h-11 w-11 text-white" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold leading-tight">
                  Your laptops, tracked and taken care of.
                </h2>
                <p className="mt-2 text-sm text-white/70">One account for LapAndTop, LaptopBazaar, and LapTech.</p>
              </div>
              <div className="w-full space-y-5 text-left">
                {perks.map((perk) => (
                  <div key={perk.title} className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <perk.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{perk.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/60">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="relative mt-8 text-xs text-white/50">© {new Date().getFullYear()} Lapsoo · Gurgaon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
