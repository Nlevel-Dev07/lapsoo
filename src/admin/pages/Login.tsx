import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { adminLogin, ApiError } from "@/lib/api"
import { useAdminAuth } from "../useAdminAuth"
import { Eye, EyeOff, KeyRound, Laptop, Lock, Mail, ShieldCheck, Sparkles, Wrench } from "lucide-react"
import { SITE } from "@/data/site"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const { invalidate } = useAdminAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotHelp, setShowForgotHelp] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      await adminLogin(data.email, data.password)
      invalidate()
      navigate("/admin")
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left branding panel */}
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between overflow-hidden p-12 xl:p-16">
        {/* background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-graphite-900 via-ink to-graphite-800" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-500/25 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-[130px]" />

        <div className="relative z-10 animate-fade-up">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-[0_8px_20px_-6px_rgba(47,94,255,0.55)]">
              <Laptop className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-white">Lapsoo</span>
          </div>
          <p className="mt-1 pl-[50px] text-[13px] font-medium uppercase tracking-[0.18em] text-white/40">
            Admin Console
          </p>
        </div>

        <div className="relative z-10 max-w-md animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Command center
          </div>
          <h1 className="mt-5 font-display text-4xl xl:text-[2.6rem] font-extrabold leading-[1.12] tracking-tight text-white">
            Run every repair, order &amp; customer from one place.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/50">
            Sign in to manage products, teams, jobsheets and bookings across the entire Lapsoo operation.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <Wrench className="h-4.5 w-4.5 text-blue-400" />
              <p className="mt-2.5 text-sm font-semibold text-white">Repair Ops</p>
              <p className="mt-0.5 text-xs text-white/40">Track jobsheets end-to-end</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-400" />
              <p className="mt-2.5 text-sm font-semibold text-white">Role-based access</p>
              <p className="mt-0.5 text-xs text-white/40">Secured for your team</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/30 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <span>© {new Date().getFullYear()} Lapsoo</span>
          <span>Internal use only</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 lg:hidden opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px] lg:hidden" />

        <div className="relative z-10 w-full max-w-sm animate-fade-up">
          <div className="mb-8 text-center lg:hidden">
            <span className="font-display text-2xl font-extrabold tracking-tight text-white">Lapsoo</span>
            <p className="mt-1 text-sm text-white/40">Admin Panel</p>
          </div>

          <div className="rounded-3xl border border-black/[0.06] bg-white p-8 shadow-[0_24px_60px_-20px_rgba(10,10,12,0.35)] sm:p-9">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Welcome back</h2>
              <p className="mt-1.5 text-sm text-ink/45">Sign in with your admin credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/30" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@lapsoo.in"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotHelp((v) => !v)}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink/30" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-10 pr-11"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 transition-colors hover:text-ink/60"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}

                {showForgotHelp && (
                  <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3 text-xs text-ink/60">
                    <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <p>
                      Admin passwords are reset by a super admin. Reach out at{" "}
                      <a href={`mailto:${SITE.corporateEmail}`} className="font-semibold text-blue-500 hover:text-blue-600">
                        {SITE.corporateEmail}
                      </a>{" "}
                      to request a reset.
                    </p>
                  </div>
                )}
              </div>

              {serverError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
                  {serverError}
                </div>
              )}

              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/30 lg:text-ink/35">
            Protected admin area · Lapsoo Internal Systems
          </p>
        </div>
      </div>
    </div>
  )
}
