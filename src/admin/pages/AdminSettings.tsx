import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/admin/components/PageHeader"
import { useToast } from "@/admin/components/Toast"
import { useAdminAuth } from "@/admin/useAdminAuth"
import { changeAdminPassword, ApiError } from "@/lib/api"

function initials(name?: string) {
  if (!name) return "?"
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

export default function AdminSettings() {
  const { session } = useAdminAuth()
  const toast = useToast()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const change = useMutation({
    mutationFn: () => changeAdminPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated.")
      setCurrentPassword("")
      setNewPassword("")
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not change password. Please try again."),
  })

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your admin account." />

      <div className="mt-6 grid sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-ink/8 bg-white p-6">
          <h3 className="font-display font-bold">Account</h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-600">
              {initials(session?.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{session?.name}</p>
              <p className="truncate text-xs text-ink/45">{session?.email}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink/40">Role: <span className="font-medium text-ink/60">{session?.role ?? "Admin"}</span></p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            if (newPassword.length < 8) {
              setError("New password must be at least 8 characters")
              return
            }
            change.mutate()
          }}
          className="rounded-2xl border border-ink/8 bg-white p-6 space-y-3"
        >
          <h3 className="font-display font-bold">Change Password</h3>
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={change.isPending}>
            {change.isPending ? "Saving..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
