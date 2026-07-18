import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldCheck, Wrench, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { customerLogin, customerSignup, ApiError } from "@/lib/api"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useSeo } from "@/lib/useSeo"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").optional().or(z.literal("")),
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
  const navigate = useNavigate()
  const { invalidate } = useCustomerAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  useSeo({
    title: mode === "login" ? "Login" : "Sign Up",
    description: "Access your Lapsoo account to track enquiries, repairs, and orders.",
  })

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  const onLogin = async (data: LoginValues) => {
    setServerError(null)
    try {
      await customerLogin(data.email, data.password)
      invalidate()
      navigate("/")
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Login failed. Please try again.")
    }
  }

  const onSignup = async (data: SignupValues) => {
    setServerError(null)
    try {
      await customerSignup({ ...data, phone: data.phone || undefined })
      invalidate()
      navigate("/")
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Signup failed. Please try again.")
    }
  }

  const switchMode = (next: "login" | "signup") => {
    setMode(next)
    setServerError(null)
    setShowPassword(false)
  }

  return (
    <div className="bg-paper-soft/40 py-10 md:py-16">
      <div className="container-lap">
        <div className="mx-auto flex max-w-4xl overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:min-h-[620px]">
          {/* Brand panel */}
          <div className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b0c10] to-[#122057] p-10 text-white lg:flex">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

            <Link to="/" className="relative">
              <img src="/images/lapsoo-logo-dark.png" alt="Lapsoo" className="h-8 w-auto" />
            </Link>

            <div className="relative space-y-8">
              <div>
                <h2 className="font-display text-2xl font-extrabold leading-tight">
                  Your laptops, tracked and taken care of.
                </h2>
                <p className="mt-2 text-sm text-white/55">One account for LapAndTop, LaptopBazaar, and LapTech.</p>
              </div>
              <div className="space-y-5">
                {perks.map((perk) => (
                  <div key={perk.title} className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <perk.icon className="h-4 w-4 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{perk.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/50">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="relative text-xs text-white/35">© {new Date().getFullYear()} Lapsoo · Gurgaon</p>
          </div>

          {/* Form panel */}
          <div className="flex w-full flex-col justify-center p-6 sm:p-10 lg:w-[58%] lg:p-14">
            <div className="mb-8 text-center lg:hidden">
              <Link to="/">
                <img src="/images/lapsoo-logo-light.png" alt="Lapsoo" className="mx-auto h-8 w-auto" />
              </Link>
            </div>

            <div className="mx-auto w-full max-w-sm">
              <h1 className="font-display text-2xl font-extrabold tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1.5 text-sm text-ink/45">
                {mode === "login" ? "Sign in to manage your orders and repairs." : "Takes less than a minute to get started."}
              </p>

              <div className="mt-6 flex rounded-full bg-ink/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={cn(
                    "flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors",
                    mode === "login" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                  )}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={cn(
                    "flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors",
                    mode === "signup" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                  )}
                >
                  Sign Up
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === "login" ? (
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
                      <Label htmlFor="phone">Phone (optional)</Label>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
