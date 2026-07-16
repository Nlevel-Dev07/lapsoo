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

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const { invalidate } = useAdminAuth()
  const [serverError, setServerError] = useState<string | null>(null)
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
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-extrabold tracking-tight text-white">Lapsoo</span>
          <p className="mt-1 text-sm text-white/40">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl bg-white p-8 space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="admin@lapsoo.in" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-sm text-red-500">{serverError}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
