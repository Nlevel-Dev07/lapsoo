import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchAdminCustomers, updateAdminCustomer, type AdminCustomer } from "@/lib/api"
import { LeadTable, fmtDate } from "@/admin/components/LeadTable"

export default function Customers() {
  const queryClient = useQueryClient()
  const [resetTarget, setResetTarget] = useState<AdminCustomer | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: fetchAdminCustomers })

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateAdminCustomer(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-customers"] }),
  })

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-2xl font-bold">Customers</h1>
      <p className="mt-1 text-sm text-ink/50">Everyone who has created a customer account on the site.</p>

      <div className="mt-6 rounded-2xl border border-ink/8 bg-white p-6 w-fit">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Registered Customers</p>
        <p className="mt-2 font-display text-3xl font-extrabold">{isLoading ? "—" : data?.length ?? 0}</p>
      </div>

      <div className="mt-6">
        <LeadTable
          isLoading={isLoading}
          empty={!data?.length}
          columns={["Name", "Email", "Phone", "Signed Up", "Last Login", "Repairs", "Status", ""]}
          rows={data?.map((c) => [
            c.name,
            c.email,
            c.phone || "—",
            fmtDate(c.createdAt),
            c.lastLoginAt ? fmtDate(c.lastLoginAt) : "Never",
            c._count.repairRequests,
            <button
              onClick={() => toggleActive.mutate({ id: c.id, active: !c.active })}
              className={`text-xs font-semibold px-3 py-1 rounded-full ${c.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
            >
              {c.active ? "Active" : "Suspended"}
            </button>,
            <Button variant="outline" size="sm" onClick={() => setResetTarget(c)}>
              Reset Password
            </Button>,
          ])}
        />
      </div>

      {resetTarget && <ResetPasswordModal customer={resetTarget} onClose={() => setResetTarget(null)} />}
    </div>
  )
}

function ResetPasswordModal({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const reset = useMutation({
    mutationFn: () => updateAdminCustomer(customer.id, { newPassword: password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      onClose()
    },
    onError: () => setError("Could not reset password. Please try again."),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Reset Password</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink/55">
          Set a new password for <span className="font-semibold">{customer.name}</span> ({customer.email}). Share it
          with them directly — no email is sent automatically.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            if (password.length < 8) {
              setError("Password must be at least 8 characters")
              return
            }
            reset.mutate()
          }}
          className="mt-4 space-y-3"
        >
          <Input
            type="text"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? "Saving..." : "Save New Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
