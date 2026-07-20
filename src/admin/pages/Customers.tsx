import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  fetchAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
  ApiError,
  type AdminCustomer,
} from "@/lib/api"
import { LeadTable, DeleteButton, fmtDate } from "@/admin/components/LeadTable"

export default function Customers() {
  const queryClient = useQueryClient()
  const [resetTarget, setResetTarget] = useState<AdminCustomer | null>(null)
  const [editTarget, setEditTarget] = useState<AdminCustomer | null>(null)
  const [adding, setAdding] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: fetchAdminCustomers })

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateAdminCustomer(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-customers"] }),
  })

  const deleteCustomer = useMutation({
    mutationFn: (id: string) => deleteAdminCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-customers"] }),
  })

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Customers</h1>
          <p className="mt-1 text-sm text-ink/50">Everyone who has created a customer account on the site.</p>
        </div>
        <Button variant="accent" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

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
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setResetTarget(c)}>
                Reset Password
              </Button>
              <button onClick={() => setEditTarget(c)} className="p-2 rounded-lg hover:bg-ink/5">
                <Pencil className="h-4 w-4 text-ink/50" />
              </button>
              <DeleteButton
                onClick={() => {
                  if (confirm(`Delete ${c.name}? This cannot be undone.`)) {
                    deleteCustomer.mutate(c.id)
                  }
                }}
              />
            </div>,
          ])}
        />
      </div>

      {resetTarget && <ResetPasswordModal customer={resetTarget} onClose={() => setResetTarget(null)} />}
      {editTarget && <EditCustomerModal customer={editTarget} onClose={() => setEditTarget(null)} />}
      {adding && <AddCustomerModal onClose={() => setAdding(false)} />}
    </div>
  )
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
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
    <ModalShell title="Reset Password" onClose={onClose}>
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
    </ModalShell>
  )
}

function EditCustomerModal({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(customer.name)
  const [email, setEmail] = useState(customer.email)
  const [phone, setPhone] = useState(customer.phone ?? "")
  const [error, setError] = useState<string | null>(null)

  const update = useMutation({
    mutationFn: () => updateAdminCustomer(customer.id, { name, email, phone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      onClose()
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update customer. Please try again."),
  })

  return (
    <ModalShell title="Edit Customer" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          update.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <Label htmlFor="edit-name">Full Name</Label>
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="edit-email">Email</Label>
          <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="edit-phone">Phone</Label>
          <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </ModalShell>
  )
}

function AddCustomerModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () => createAdminCustomer({ name, email, phone, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      onClose()
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create customer. Please try again."),
  })

  return (
    <ModalShell title="Add Customer" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (!/^[6-9]\d{9}$/.test(phone)) {
            setError("Enter a valid 10-digit Indian mobile number")
            return
          }
          if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
          }
          create.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <Label htmlFor="add-name">Full Name</Label>
          <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="add-email">Email</Label>
          <Input id="add-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="add-phone">Phone</Label>
          <Input id="add-phone" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="add-password">Password</Label>
          <Input id="add-password" type="text" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Customer"}
        </Button>
      </form>
    </ModalShell>
  )
}
