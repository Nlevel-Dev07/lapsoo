import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login")
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
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container-lap flex justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/">
              <img src="/images/lapsoo-logo-light.png" alt="Lapsoo" className="h-8 w-auto mx-auto" />
            </Link>
            <p className="mt-3 text-sm text-ink/45">
              {mode === "login" ? "Welcome back." : "Create your account."}
            </p>
          </div>

          <div className="rounded-3xl border border-ink/8 bg-white p-8">
            <div className="mb-6 flex rounded-full bg-ink/[0.04] p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                  mode === "login" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                  mode === "signup" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                }`}
              >
                Sign Up
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="you@email.com" {...loginForm.register("email")} />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-5">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your name" {...signupForm.register("name")} />
                  {signupForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" placeholder="you@email.com" {...signupForm.register("email")} />
                  {signupForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" placeholder="98765 43210" {...signupForm.register("phone")} />
                  {signupForm.formState.errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" {...signupForm.register("password")} />
                  {signupForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>
                {serverError && <p className="text-sm text-red-500">{serverError}</p>}
                <Button type="submit" variant="accent" size="lg" className="w-full" disabled={signupForm.formState.isSubmitting}>
                  {signupForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
