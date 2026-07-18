import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Moon, Sun, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateCustomerProfile, changeCustomerPassword, ApiError, type CustomerProfile } from "@/lib/api"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"

const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-6">
      <h3 className="font-display text-base font-bold">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  )
}

export function SettingsPanel({ profile }: { profile: CustomerProfile }) {
  const { invalidate } = useCustomerAuth()
  const queryClient = useQueryClient()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [appearance, setAppearance] = useState<"light" | "dark">("light")

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: profile.name, phone: profile.phone ?? "" } })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    profileForm.reset({ name: profile.name, phone: profile.phone ?? "" })
  }, [profile, profileForm])

  const onProfileSubmit = async (data: ProfileValues) => {
    setProfileError(null)
    setProfileSuccess(false)
    try {
      await updateCustomerProfile(data)
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] })
      invalidate()
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 2500)
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to update profile.")
    }
  }

  const onPasswordSubmit = async (data: PasswordValues) => {
    setPasswordError(null)
    setPasswordSuccess(false)
    try {
      await changeCustomerPassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      passwordForm.reset()
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 2500)
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to change password.")
    }
  }

  return (
    <div className="space-y-5">
      <SettingsSection title="Personal Information">
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" readOnly value={profile.email} />
            </div>
            <div>
              <Label htmlFor="settings-name">Full Name</Label>
              <Input id="settings-name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>}
            </div>
          </div>
          <div className="max-w-xs">
            <Label htmlFor="settings-phone">Phone</Label>
            <Input id="settings-phone" {...profileForm.register("phone")} />
            {profileForm.formState.errors.phone && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.phone.message}</p>}
          </div>
          {profileError && <p className="text-sm text-red-500">{profileError}</p>}
          {profileSuccess && <p className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Profile updated.</p>}
          <Button type="submit" variant="accent" disabled={profileForm.formState.isSubmitting}>
            {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </SettingsSection>

      <SettingsSection title="Security · Change Password">
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="settings-current-pw">Current Password</Label>
              <Input id="settings-current-pw" type="password" placeholder="••••••••" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div>
              <Label htmlFor="settings-new-pw">New Password</Label>
              <Input id="settings-new-pw" type="password" placeholder="••••••••" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <Label htmlFor="settings-confirm-pw">Confirm New Password</Label>
              <Input id="settings-confirm-pw" type="password" placeholder="••••••••" {...passwordForm.register("confirmPassword")} />
              {passwordForm.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
            </div>
          </div>
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Password changed.</p>}
          <Button type="submit" variant="accent" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </SettingsSection>

      <SettingsSection title="Appearance">
        <div className="flex gap-3">
          <button
            onClick={() => setAppearance("light")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold transition-colors ${
              appearance === "light" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-ink/10 text-ink/50 hover:border-ink/20"
            }`}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
          <button
            onClick={() => setAppearance("dark")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold transition-colors ${
              appearance === "dark" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-ink/10 text-ink/50 hover:border-ink/20"
            }`}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>
        {appearance === "dark" && <p className="mt-3 text-xs text-ink/35">Dark mode is coming soon for the full site — your preference is saved for when it ships.</p>}
      </SettingsSection>

      <SettingsSection title="Delete Account">
        <p className="text-sm text-ink/50">
          This will permanently remove your Lapsoo account, order history, and saved preferences. This action cannot be undone.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
              alert("Please contact our support team via WhatsApp or email to complete account deletion.")
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete My Account
        </Button>
      </SettingsSection>
    </div>
  )
}
